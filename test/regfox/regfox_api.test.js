import chai, { use, should } from 'chai';
import chaiAsPromised from 'chai-as-promised';

use(chaiAsPromised);
should();
const { expect } = chai;

import { stub } from "sinon";

import { getRegistrantsSearchHandler } from '../mocks/mws_handler.js';
import { setupServer } from 'msw/node/lib/index.js'

import fetch from 'node-fetch';
global.fetch = fetch;

import { searchRegistrations, getBearerToken } from '../../src/regfox/regfox_api.js';

describe('regfox_api', () => {
  describe('getBearerToken', () => {
    afterEach(() => {
      localStorage.clear();
      localStorage.itemInsertionCallback = null;
    });

    it('returns undefined when not found', () => {
      const bearerToken = getBearerToken();
      expect(bearerToken).to.be.undefined;
    });

    it('returns a good value', () => {
      const expectedToken = 'foxbutts';
      localStorage.setItem('wbcx_sessions', JSON.stringify({ '1311': { token: expectedToken } }));
      const bearerToken = getBearerToken();
      expect(bearerToken).to.equal(expectedToken);
    });
  });

  describe('searchRegistrations', () => {
    const getResponse = stub();
    const server = setupServer(...getRegistrantsSearchHandler(getResponse));
    before(() => server.listen());
    afterEach(() => getResponse.reset());
    afterEach(() => server.resetHandlers());
    after(() => server.close());

    it('returns a single entry for Bob', async () => {
      getResponse.returns({
        success: true,
        registrants: [{
          name: 'Bob',
        }]
      });
      const result = await searchRegistrations('anything', 'none');

      expect(result).to.deep.nested.include({ 'registrants[0].name': 'Bob' });
    });

    it('handles a failure in the API', async () => {
      getResponse.returns({
        errors: ['heky!'],
        registrants: [{
          name: 'Fred',
        }]
      });
      return searchRegistrations('anything', 'none').should.eventually.be.rejected;
    });

    it('handles a failure in query', async () => {
      getResponse.returns({
        success: false,
        registrants: [{
          name: 'Bob',
        }]
      });
      return searchRegistrations('anything', 'none').should.eventually.be.rejected;
    });
  });
});