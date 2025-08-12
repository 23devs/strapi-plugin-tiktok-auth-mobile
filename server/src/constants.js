export const PLUGIN_ID = 'tiktok-auth-mobile';
export const USERS_PERMISSIONS = 'users-permissions';

export const TIKTOK_AUTH = 'tiktokAuth';
export const ROLE = 'role';
export const USER = 'user';
export const JWT = 'jwt';

export const PLUGIN_API_NAMES = {
  USER_PERMISSIONS_ROLE: `plugin::${USERS_PERMISSIONS}.${ROLE}`,
  USER_PERMISSIONS_USER: `plugin::${USERS_PERMISSIONS}.${USER}`,
};

export const CLIENT_KEY = process.env.CLIENT_KEY || null;
export const CLIENT_SECRET = process.env.CLIENT_SECRET || null;

export const GRANT_TYPE = 'authorization_code';

export const STRAPI_URL = process.env.STRAPI_URL || null;
export const REDIRECT_URI = `${STRAPI_URL}/api/tiktok-auth-mobile/callback`;
export const REDIRECT_APP_URL = process.env.REDIRECT_APP_URL || null;

export const TIKTOK_API_V2_URL = 'https://open.tiktokapis.com/v2';
export const TIKTOK_GET_USER_INFO_URL = `${TIKTOK_API_V2_URL}/user/info/`;
export const TIKTOK_GET_OAUTH_TOKEN_URL = `${TIKTOK_API_V2_URL}/oauth/token/`;
