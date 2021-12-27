import { expect } from 'chai';

import { buildAuthLoginMutationBody } from '../../../src/regfox/queries/regfox_graphql_auth_login_mutation_query.js';

describe('regfox_graphql_auth_login_mutation_query', () => {
  describe('buildAuthLoginMutationBody', () => {
    it('contains a user\'s email', () => {
      const arg = 'guaranteed-to-be-unique';
      const body = buildAuthLoginMutationBody(arg, 'other');

      expect(body).to.deep.nested.include({ 'variables.email': arg });
    });
  });
});
