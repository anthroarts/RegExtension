import { get } from 'lodash-es';
import { buildSearchRegistrationsBody } from './queries/regfox_graphql_search_registrations_query.js';
import { buildAuthLoginMutationBody } from './queries/regfox_graphql_auth_login_mutation_query.js';
import { parseRegfoxGetRegistrationResponse } from './responses/regfox_api_get_registration_info_parser.js';

const REGFOX_GET_REGISTRATION_URL = 'https://api.webconnex.com/v1/cp/report/regfox.com/registrant/${id}';
const REGFOX_EXCHANGE_TOKEN_URL = 'https://api.webconnex.com/auth/exchange-token';
const REGFOX_GRAPHQL_URL = 'https://api.webconnex.com/apollo/graphql';

const buildHeaders = (bearerToken) => ({
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'authorization': `Bearer ${bearerToken}`,
});

/**
 * Returns an object that contains a list of registrants.
 * Returns a Promise Error if the network is down or some other technical issue.
 *
 * @param {*} term name or email (check regfox_graphql_search_registrations_query for other search fields)
 * @param {*} bearerToken the bearer token of the logged in user
 */
const searchRegistrations = async (term, bearerToken) => {
  return fetch(REGFOX_GRAPHQL_URL, {
    method: 'POST',
    headers: buildHeaders(bearerToken),
    body: JSON.stringify(buildSearchRegistrationsBody(term)),
  }).then((response) => response.json())
    .then((response) => {
      if (get(response, 'data.response.errors')) {
        throw new Error(`Could not parse or process response, see details to fix here: ${JSON.stringify(response)}`);
      }

      if (!get(response, 'data.response.success', false)) {
        throw new Error(`Could not parse or process response, see details to fix here: ${JSON.stringify(response)}`);
      }

      return response.data.response;
    });
};

/**
 * Returns an object that contains a new bearer token for the user/account of the token passed in.
 * Returns a promise Error if the network is down or the exchange failed.
 *
 * @param {*} bearerToken the bearer token of the logged in user
 */
const exchangeBearerToken = async (bearerToken) => {
  return fetch(REGFOX_EXCHANGE_TOKEN_URL, {
    method: 'PUT',
    headers: buildHeaders(bearerToken),
    body: JSON.stringify({ tokenType: 'SESSION' }),
  }).then((response) => response.json())
    .then((response) => {
      if (get(response, 'errors')) {
        throw new Error(`Could not parse or process response, see details to fix here: ${JSON.stringify(response)}`);
      }

      if (!get(response, 'token')) {
        throw new Error(`Could not parse or process response, see details to fix here: ${JSON.stringify(response)}`);
      }

      return response;
    });
};

/**
 * Returns an object that contains a bearer token of the email/password passed in.
 * Returns a promise Error if the network is down or login failed.
 *
 * Doesn't support 2fa!
 *
 * @param {*} email
 * @param {*} password
 */
const login = async (email, password) => {
  return fetch(REGFOX_GRAPHQL_URL, {
    method: 'POST',
    headers: buildHeaders(undefined),
    body: JSON.stringify(buildAuthLoginMutationBody(email, password)),
  }).then((response) => response.json())
    .then((response) => {
      if (get(response, 'data.mutationResponse.errors')) {
        throw new Error(`Could not parse or process response, see details to fix here: ${JSON.stringify(response)}`);
      }

      if (!get(response, 'data.mutationResponse.success', false)) {
        throw new Error(`Could not parse or process response, see details to fix here: ${JSON.stringify(response)}`);
      }

      return response.data.mutationResponse;
    });
};

/**
 * Returns a nicely parsed object containing registration info given an id.
 * Returns a promise Error if the network is down or parsing failed.
 *
 * @param {string} id of a registration, note this is **not** the RegistrationId, its just the id
 */
const getRegistrationInfo = async (id) => {
  const fullUrl = getRegistrationInfoUrl(id);
  return fetch(fullUrl, {
    method: 'GET',
    headers: buildHeaders(undefined),
  }).then((response) => response.json())
    .then((response) => {
      if (get(response, 'error')) {
        throw new Error(`Could not parse or process response, see details to fix here: ${JSON.stringify(response)}`);
      }

      if (!get(response, 'data')) {
        throw new Error(`Could not parse or process response, see details to fix here: ${JSON.stringify(response)}`);
      }

      return parseRegfoxGetRegistrationResponse(response.data);
    });
};

// Only exported for testing, DONT CALL THIS METHOD!
const getRegistrationInfoUrl = (id) => {
  return REGFOX_GET_REGISTRATION_URL.replace('${id}', id);
};

export { getRegistrationInfo, searchRegistrations, exchangeBearerToken, login, REGFOX_GRAPHQL_URL, REGFOX_EXCHANGE_TOKEN_URL, getRegistrationInfoUrl };
