import { errors } from '@strapi/utils';
import { toLower, find, isEmpty } from 'lodash';
import axios, { isAxiosError } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const { ApplicationError } = errors;

import { PLUGIN_API_NAMES, TIKTOK_GET_USER_INFO_URL } from '../constants';

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
        console.log('User not exist.');
        throw new ApplicationError('User not exist.');
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

  const connect = async ({ accessToken, redirectUri, codeVerifier }) => {
    if (!accessToken) {
      throw new ApplicationError('No access token provided.');
    }

    /* TODO: !!!
    if (!redirectUri) {
      throw new ApplicationError('No redirect Uri provided.');
    }

    if (!codeVerifier) {
      throw new ApplicationError('No code verifier provided.');
    }
    */

    const profile = await _getTiktokUser(accessToken);
    const email = toLower(profile.email);

    // if (!profile.verified) {
    //   throw new ApplicationError('Ticktok user not verified.');
    // }

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
  };
};
