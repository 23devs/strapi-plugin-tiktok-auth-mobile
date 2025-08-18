import { errors } from '@strapi/utils';
import { toLower, find, isEmpty } from 'lodash';
import axios, { isAxiosError } from 'axios';

const { ApplicationError } = errors;

import { CLIENT_KEY, CLIENT_SECRET, GRANT_TYPE, PLUGIN_API_NAMES, REDIRECT_URI, TIKTOK_GET_USER_INFO_URL } from '../constants';

export default ({ strapi }) => {
  const _getTiktokUser = async (accessToken) => {
    const url = TIKTOK_GET_USER_INFO_URL;

    try {
      const { data: response } = await axios.get(
        `${url}?fields=open_id,union_id,username,display_name`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          timeout: 10000,
        }
      );

      const { data, error } = response;

      if (error?.code !== 'ok') {
        throw new ApplicationError(error.message);
      }

      const user = data.user;

      if (!user) {
        throw new ApplicationError('User does not exist.');
      }

      return {
        username: user.display_name ? decodeURIComponent(user.display_name) : undefined,
        verified: user.is_verified ?? false,
        email: user.union_id ? `${user.union_id}@tiktok.com` : undefined,
      }
    } catch (error) {
      if (isAxiosError(error)) {
        throw new ApplicationError(`Failed to fetch TikTok user: ${error.message}`);
      }
      throw error;
    }
  };

  const getTiktokOauthToken = async ({ code }) => {
    if (!CLIENT_KEY || !CLIENT_SECRET || !REDIRECT_URI) {
      console.log('No env variables');
      throw new ApplicationError(`Unset environment variables: check CLIENT_KEY, CLIENT_SECRET, REDIRECT_URI`);
    }

    console.log(TIKTOK_GET_OAUTH_TOKEN_URL);

    const url = TIKTOK_GET_OAUTH_TOKEN_URL;

    try {
      const response = await axios.post(
        `${url}`,
        {
          'client_key': CLIENT_KEY,
          'client_secret': CLIENT_SECRET,
          'code': code,
          'grant_type': GRANT_TYPE,
          'redirect_uri': REDIRECT_URI,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": 'application/x-www-form-urlencoded',
          },
          timeout: 30000,
        }
      );

      console.log(response);

      return {
        accessToken: response.access_token,
      };
    } catch (error) {
      if (isAxiosError(error)) {
        const err = `Failed to get TikTok token: ${error.message}`;
        throw new ApplicationError(err);
      }
      throw error;
    }
  };

  const connect = async ({ accessToken }) => {
    if (!accessToken) {
      throw new ApplicationError('No access token provided.');
    }

    const profile = await _getTiktokUser(accessToken);
    const email = toLower(profile.email);

    if (!email) {
      throw new ApplicationError('Email was not available.');
    }

    const users = await strapi
      .query(PLUGIN_API_NAMES.USER_PERMISSIONS_USER)
      .findMany({
        where: { email },
      });

    const advancedSettings = await strapi
      .store({ type: 'plugin', name: 'users-permissions', key: 'advanced' })
      .get();

    const provider = 'tiktok';
    const user = find(users, { provider });

    if (isEmpty(user) && !advancedSettings.allow_register) {
      throw new ApplicationError('Register action is actually not available.');
    }

    if (!isEmpty(user)) {
      return user;
    }

    if (users.length && advancedSettings.unique_email) {
      throw new ApplicationError('Email is already taken.');
    }

    const defaultRole = await strapi
      .query(PLUGIN_API_NAMES.USER_PERMISSIONS_ROLE)
      .findOne({ where: { type: advancedSettings.default_role } });

    const newUser = {
      ...profile,
      email, // overwrite with lowercased email
      provider,
      role: defaultRole.id,
      confirmed: true,
    };

    const createdUser = await strapi
      .query(PLUGIN_API_NAMES.USER_PERMISSIONS_USER)
      .create({ data: newUser });

    return createdUser;
  };

  return {
    connect,
    getTiktokOauthToken,
  };
};
