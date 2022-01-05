import { get } from 'lodash-es';
import { buildSearchRegistrationsBody } from './queries/regfox_graphql_search_registrations_query.js';
import { buildAuthLoginMutationBody } from './queries/regfox_graphql_auth_login_mutation_query.js';
import { parseRegfoxGetRegistrationResponse } from './responses/regfox_api_get_registration_info_parser.js';
import { buildMarkRegistrationCompleteBody } from './payloads/regfox_api_mark_registration_complete_body.js';
import { buildAddNoteBody } from './payloads/regfox_api_add_note.js';

const REGFOX_ADD_NOTE_URL = 'https://api.webconnex.com/v1/cp/notes';
const REGFOX_MARK_REGISTRATION_COMPLETE_URL = 'https://api.webconnex.com/v1/cp/forms/${formId}/registrations/${registrationId}';
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
 * @param {string} term name or email (check regfox_graphql_search_registrations_query for other search fields)
 * @param {string} bearerToken the bearer token of the logged in user
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
 * @param {string} bearerToken the bearer token of the logged in user
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
 * @param {string} email
 * @param {string} password
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
 * @param {string} bearerToken the bearer token of the logged in user
 */
const getRegistrationInfo = async (id, bearerToken) => {
  const fullUrl = getRegistrationInfoUrl(id);
  return fetch(fullUrl, {
    method: 'GET',
    headers: buildHeaders(bearerToken),
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

const getRegistrationInfoUrl = (id) => {
  return REGFOX_GET_REGISTRATION_URL.replace('${id}', id);
};

/**
 * Marks a registrant (technically a transaction of an order of a registered user) as completed (which means fully paid).
 * See https://gist.github.com/raytingtw/8d0a083dc130c40818d71606e41b884e.
 * Returns a promise Error if the network is down.
 *
 * All of these parameters can be pulled straight from the registrationInfo.
 *
 * @param {number} formId is the form (webpage) the user signed up with, could be hardcoded to 372652
 * @param {number} registrationId of the registrant (**not** the Id), I think sometimes this is called the OrderId
 * @param {number} transactionId of the registrant
 * @param {string} id of registration (**not** the RegistrationId)
 * @param {string} bearerToken the bearer token of the logged in user
 */
const markRegistrationComplete = async (formId, registrationId, transactionId, id, bearerToken) => {
  const fullUrl = getMarkRegistrationCompleteUrl(formId, registrationId);
  return fetch(fullUrl, {
    method: 'PUT',
    headers: buildHeaders(bearerToken),
    body: JSON.stringify(buildMarkRegistrationCompleteBody(transactionId, id)),
  }).then((response) => response.json())
    .then(handleBadResponseCodes);
};

const getMarkRegistrationCompleteUrl = (formId, registrationId) => {
  return REGFOX_MARK_REGISTRATION_COMPLETE_URL.replace('${formId}', formId).replace('${registrationId}', registrationId);
};

/**
 * Returns an object including the message, dateCreated and a few other attributes.
 * Returns a promise Error if the network is down or the note could not be created.
 *
 * @param {*} message that should be seen as a note
 * @param {string} id of registration (**not** the RegistrationId)
 * @param {string} bearerToken the bearer token of the logged in user
 */
const addNote = async (message, id, bearerToken) => {
  return fetch(REGFOX_ADD_NOTE_URL, {
    method: 'POST',
    headers: buildHeaders(bearerToken),
    body: JSON.stringify(buildAddNoteBody(message, id)),
  }).then((response) => response.json())
    .then(handleBadResponseCodes);
};

const handleBadResponseCodes = (response) => {
  if (get(response, 'code') === 1000 && get(response, 'message') === 'unauthorized request') {
    throw new Error(`Illegal bearerToken passed in: ${JSON.stringify(response)}`);
  }

  if (get(response, 'code') === 1000 && get(response, 'message') === 'bad request') {
    throw new Error(`Some part of the request was malformed: ${JSON.stringify(response)}`);
  }

  return response;
};

export {
  getRegistrationInfo, searchRegistrations, exchangeBearerToken,
  login, markRegistrationComplete, addNote,

  // Only exported for testing, DONT USE THESE OTHERWISE!
  REGFOX_GRAPHQL_URL as TEST_REGFOX_GRAPHQL_URL,
  REGFOX_EXCHANGE_TOKEN_URL as TEST_REGFOX_EXCHANGE_TOKEN_URL,
  REGFOX_ADD_NOTE_URL as TEST_REGFOX_ADD_NOTE_URL,
  getRegistrationInfoUrl as testGetRegistrationInfoUrl,
  getMarkRegistrationCompleteUrl as testGetMarkRegistrationCompleteUrl,
};
