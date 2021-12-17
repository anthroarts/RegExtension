import chai, { use, should } from 'chai';
import chaiAsPromised from 'chai-as-promised';

use(chaiAsPromised);
should();
const { expect } = chai;

import { stub } from "sinon";

import { exchangeBearerTokenHandler, getRegistrantsSearchHandler } from '../mocks/mws_handler.js';
import { setupServer } from 'msw/node/lib/index.js'

import fetch from 'node-fetch';
global.fetch = fetch;

import { exchangeBearerToken, searchRegistrations } from '../../src/regfox/regfox_api.js';

describe('regfox_api', () => {
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

  describe('exchangeBearerToken', () => {
    const getResponse = stub();
    const server = setupServer(...exchangeBearerTokenHandler(getResponse));
    before(() => server.listen());
    afterEach(() => getResponse.reset());
    afterEach(() => server.resetHandlers());
    after(() => server.close());

    it('returns an exchanged token as requested', async () => {
      getResponse.returns({
        accountId: 1311,
        realm: 'user',
        token: 'user-wbcx-9ee06da6-4370-4f28-8543-1a460f06b123',
        tokenType: 'SESSION',
        ttl: 900,
        userId: 144247,
      });
      const result = await exchangeBearerToken('anything');

      expect(result).to.deep.nested.include({ 'token': 'user-wbcx-9ee06da6-4370-4f28-8543-1a460f06b123' });
    });

    it('handles a failure in the API', async () => {
      getResponse.returns({
        errors: ['heky!'],
      });
      return exchangeBearerToken('anything').should.eventually.be.rejected;
    });

    it('handles a failure in exchange', async () => {
      getResponse.returns({
        tokenType: 'SESSION',
        ttl: 900,
        userId: 144247,
      });
      return exchangeBearerToken('anything').should.eventually.be.rejected;
    });
  });
});