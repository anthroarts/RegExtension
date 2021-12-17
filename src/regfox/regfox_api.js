import { get } from 'lodash-es';
import { buildSearchRegistrationsBody } from './regfox_graphql_search_registrations_query.js';

const REGFOX_EXCHANGE_TOKEN_URL = 'https://api.webconnex.com/auth/exchange-token';
const REGFOX_GRAPHQL_URL = 'https://api.webconnex.com/apollo/graphql';

const buildHeaders = (bearerToken) => ({
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'authorization': `Bearer ${bearerToken}`
});

/**
 * Returns an object that contains a list of completed (fully paid and accepted) registrants.
 * Returns a Promise Error if the network is down or some other technical issue.
 *
 * @param {*} term name or email (check regfox_graphql_search_registrations_query for other search fields)
 * @param {*} bearerToken the bearer token of the logged in user
 */
const searchRegistrations = async (term, bearerToken) => {
  return fetch(REGFOX_GRAPHQL_URL, {
    method: 'POST',
    headers: buildHeaders(bearerToken),
    body: JSON.stringify(buildSearchRegistrationsBody(term))
  }).then(response => response.json())
    .then(response => {
      if (get(response, 'data.response.errors')) {
        throw new Error(response);
      }

      if (!get(response, 'data.response.success', false)) {
        throw new Error(response);
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
    body: JSON.stringify({ tokenType: 'SESSION' })
  }).then(response => response.json())
    .then(response => {
      if (get(response, 'errors')) {
        throw new Error(response);
      }

      if (!get(response, 'token')) {
        throw new Error(response);
      }

      return response;
    });
}

export { searchRegistrations, exchangeBearerToken, REGFOX_GRAPHQL_URL, REGFOX_EXCHANGE_TOKEN_URL };