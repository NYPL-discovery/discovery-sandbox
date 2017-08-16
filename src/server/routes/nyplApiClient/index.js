import NyplApiClient from '@nypl/nypl-data-api-client';
import config from '../../../../appConfig.js';

const appEnvironment = process.env.APP_ENV || 'production';
const apiBase = config.api[appEnvironment];
const nyplApiClient = new NyplApiClient({
  base_url: apiBase,
  oauth_key: process.env.clientId,
  oauth_secret: process.env.clientSecret,
  oauth_url: config.tokenUrl,
});

export default nyplApiClient;
