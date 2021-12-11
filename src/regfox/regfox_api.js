const { data } = require('jquery');
const { get } = require('lodash');
const { buildSearchRegistrationsBody } = require('./regfox_graphql_search_registrations_query');

const REGFOX_URL = 'https://api.webconnex.com/apollo/graphql';

/**
 * Returns the bearer token out of local storage, assuming the user is logged in.
 * Returns undefined if the bearer token cannot be found. 
 */
const getBearerToken = () => {
  const session = JSON.parse(localStorage.getItem('wbcx_sessions'));
  return get(session, '1311.token'); // 1311 is a magic number that means "FC", you can find it in the URL.
}

/**
 * Returns an object that contains a list of completed (fully paid and accepted) registrants.
 * Returns a Promise Error if the network is down or some other technical issue.
 * 
 * @param {*} term name or email (check regfox_graphql_search_registrations_query for other search fields)
 * @param {*} bearerToken the bearer token of the logged in user (from getBearerToken)
 */
const searchRegistrations = async (term, bearerToken) => {
  return fetch(REGFOX_URL, {
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

      return data.response;
    });
};

module.exports = { searchRegistrations, getBearerToken };