const { expect } = require('chai');

const { buildSearchRegistrationsBody } = require('../../src/regfox/regfox_graphql_search_registrations_query');

describe('regfox_graphsql_search_registrations_query', () => {
  describe('buildSearchRegistrationsBody', () => {
    it('contains a user\'s search term', () => {
      const arg = 'guaranteed-to-be-unique';
      const body = buildSearchRegistrationsBody(arg);

      expect(body).to.deep.nested.include({ 'variables.query.search.value': arg });
    });
  });
});