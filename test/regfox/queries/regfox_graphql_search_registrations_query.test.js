import { expect } from 'chai';

import { buildSearchRegistrationsBody } from '../../../src/regfox/queries/regfox_graphql_search_registrations_query.js';

describe('regfox_graphsql_search_registrations_query', () => {
  describe('buildSearchRegistrationsBody', () => {
    it('contains a user\'s search term', () => {
      const arg = 'guaranteed-to-be-unique';
      const body = buildSearchRegistrationsBody(arg);

      expect(body).to.deep.nested.include({ 'variables.query.search.value': arg });
    });
  });
});