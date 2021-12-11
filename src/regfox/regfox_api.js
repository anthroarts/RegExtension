const { buildSearchRegistrationsBody } = require('./regfox_graphql_search_registrations_query');

const REGFOX_URL = "https://api.webconnex.com/apollo/graphql";

// TODO bearer token retrieval and refresh
// bearer token storage
// grabbing the bearer token without requiring re-login?

const searchRegistrations = (term, bearerToken) => {
  fetch(REGFOX_URL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'authorization': `Bearer ${bearerToken}`
    },
    body: JSON.stringify(buildSearchRegistrationsBody(term))
  }).then(console.log).catch(console.log);
  // TODO the "Status" field needs to be parsed out to determine if registration is completed and paid.
  // https://help.regfox.com/en/articles/2343628-registration-statuses-explained
};

module.exports = { searchRegistrations };