import { factories } from '@strapi/strapi';
const { createCoreService } = factories;

import { PLUGIN_API_NAMES } from '../constants';

export default createCoreService(PLUGIN_API_NAMES.AUTH_MOBILE_CREDENTIAL, {
  async findAll() {
    return strapi.db.query(PLUGIN_API_NAMES.AUTH_MOBILE_CREDENTIAL).findMany();
  },
});
