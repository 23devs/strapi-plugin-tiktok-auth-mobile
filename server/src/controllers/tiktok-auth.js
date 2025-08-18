import { errors } from '@strapi/utils';

import {
  PLUGIN_ID,
  PLUGIN_API_NAMES,
  USERS_PERMISSIONS,
  JWT,
  TIKTOK_AUTH,
  REDIRECT_APP_URL,
} from '../constants';

const { ApplicationError, ForbiddenError } = errors;

// https://github.com/strapi/strapi/blob/2d97100ef73dbf1378ee138cf52f414d1b32a0c5/packages/plugins/users-permissions/server/controllers/auth.js#L27C1-L32C3
const sanitizeUser = (user, ctx) => {
  const { auth } = ctx.state;
  const userSchema = strapi.getModel(PLUGIN_API_NAMES.USER_PERMISSIONS_USER);

  return strapi.contentAPI.sanitize.output(user, userSchema, { auth });
};

export async function callback(ctx) {
  const {
    code,
    scopes,
    state,
    error,
    error_description
  } = ctx.request.query;

  if (error) {
    const err = new ApplicationError(`${error}: ${error_description || 'description not available'}`);
    return ctx.badRequest(err);
  }

  if (!scopes?.includes('user.info.basic')) {
    const err = new ApplicationError(`User hasn't provided needed scopes`);
    return ctx.badRequest(err);
  }

  if (!code) {
    const err = new ApplicationError(`No code provided`);
    return ctx.badRequest(err);
  }
  
  // TODO: check state

  try {
    const data = await strapi
      .plugin(PLUGIN_ID)
      .service(TIKTOK_AUTH)
      .getTiktokOauthToken({
        code: decodeURIComponent(code),
      });

    const redirectUrl = `${REDIRECT_APP_URL}?access_token=${data.accessToken}`;

    console.log(`Redirecting to -> ${redirectUrl}`);

    return ctx.redirect(redirectUrl);
  } catch (error) {
    const err = new ApplicationError(error.message);
    return ctx.badRequest(err);
  }
}

export async function connect(ctx) {
  const {
    access_token,
  } = ctx.request.body;

  try {
    const user = await strapi
      .plugin(PLUGIN_ID)
      .service(TIKTOK_AUTH)
      .connect({
        accessToken: access_token,
      });

    if (user.blocked) {
      const err =  new ForbiddenError(
        'Your account has been blocked by an administrator'
      );

      return ctx.badRequest(err);
    }

    return ctx.send({
      jwt: strapi
        .plugin(USERS_PERMISSIONS)
        .service(JWT)
        .issue({ id: user.id }),
      user: await sanitizeUser(user, ctx),
    });
  } catch (error) {
    const err = new ApplicationError(error.message);
    return ctx.badRequest(err);
  }
}

export default {
  connect,
  callback,
};
