import { get } from 'lodash-es';
import { buildSearchRegistrationsBody } from './regfox_graphql_search_registrations_query.js';

const REGFOX_GRAPHQL_URL = 'https://api.webconnex.com/apollo/graphql';

/**
 * Returns an object that contains a list of completed (fully paid and accepted) registrants.
 * Returns a Promise Error if the network is down or some other technical issue.
 *
 * @param {*} term name or email (check regfox_graphql_search_registrations_query for other search fields)
 * @param {*} bearerToken the bearer token of the logged in user (from getBearerToken)
 */
const searchRegistrations = async (term, bearerToken) => {
  return fetch(REGFOX_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'authorization': `Bearer ${bearerToken}`
    },
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

export { searchRegistrations, REGFOX_GRAPHQL_URL };