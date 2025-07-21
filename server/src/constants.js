export const PLUGIN_ID = 'tiktok-auth-mobile';
export const USERS_PERMISSIONS = 'users-permissions';

export const CREDENTIAL = 'credential';
export const TIKTOK_AUTH = 'tiktokAuth';
export const ROLE = 'role';
export const USER = 'user';
export const JWT = 'jwt';

export const PLUGIN_API_NAMES = {
  AUTH_MOBILE_CREDENTIAL: `plugin::${PLUGIN_ID}.${CREDENTIAL}`,
  USER_PERMISSIONS_ROLE: `plugin::${USERS_PERMISSIONS}.${ROLE}`,
  USER_PERMISSIONS_USER: `plugin::${USERS_PERMISSIONS}.${USER}`,
};

// https://developers.tiktok.com/doc/tiktok-api-v2-get-user-info
export const TIKTOK_GET_USER_INFO_URL = 'https://open.tiktokapis.com/v2/user/info/';
