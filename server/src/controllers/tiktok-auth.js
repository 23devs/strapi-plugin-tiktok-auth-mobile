import { errors } from '@strapi/utils';

import {
  PLUGIN_ID,
  PLUGIN_API_NAMES,
  USERS_PERMISSIONS,
  JWT,
  TIKTOK_AUTH
} from '../constants';

const { ApplicationError, ForbiddenError } = errors;

// https://github.com/strapi/strapi/blob/2d97100ef73dbf1378ee138cf52f414d1b32a0c5/packages/plugins/users-permissions/server/controllers/auth.js#L27C1-L32C3
const sanitizeUser = (user, ctx) => {
  const { auth } = ctx.state;
  const userSchema = strapi.getModel(PLUGIN_API_NAMES.USER_PERMISSIONS_USER);

  return strapi.contentAPI.sanitize.output(user, userSchema, { auth });
};

export async function connect(ctx) {
  const {
    access_token,
    // redirect_uri,
    // code_verifier,
  } = ctx.request.body;

  try {
    const user = await strapi
      .plugin(PLUGIN_ID)
      .service(TIKTOK_AUTH)
      .connect({
        accessToken: access_token,
        // redirectUri: redirect_uri,
        // codeVerifier: code_verifier,
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
};
