import chai, { use, should } from 'chai';
import chaiAsPromised from 'chai-as-promised';

use(chaiAsPromised);
should();
const { expect } = chai;

import { stub } from 'sinon';

import {
  exchangeBearerTokenHandler, getRegistrantsSearchHandler, loginHandler,
  getRegistrationInfoHandler, markRegistrationCompleteHandler,
  addNoteHandler, checkInHandler,
} from '../mocks/mws_handler.js';
import { setupServer } from 'msw/node/lib/index.js';

import fetch from 'node-fetch';
global.fetch = fetch;

import {
  exchangeBearerToken, searchRegistrations, login, getRegistrationInfo,
  markRegistrationComplete, addNote, checkIn,
} from '../../src/regfox/regfox_api.js';

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
          id: 123455,
          registrationId: '593409403',
        }],
      });
      const result = await searchRegistrations('anything', 'none');

      expect(result).to.deep.nested.include({ 'registrants[0].name': 'Bob' });
    });

    it('handles a failure in the API', async () => {
      getResponse.returns({
        errors: ['heky!'],
        registrants: [{
          name: 'Fred',
        }],
      });
      return searchRegistrations('anything', 'none').should.eventually.be.rejected;
    });

    it('handles a failure in query', async () => {
      getResponse.returns({
        success: false,
        registrants: [{
          name: 'Bob',
        }],
      });
      return searchRegistrations('anything', 'none').should.eventually.be.rejected;
    });

    it('failures get parsed correctly', async () => {
      getResponse.returns({
        success: false,
        registrants: [{
          name: 'Bob',
        }],
      });
      try {
        await searchRegistrations('anything', 'none');
        expect.fail('searchRegistrations should have thrown an exception');
      } catch (error) {
        expect(error.message).to.include('"success":false');
        expect(error.message).to.include('registrants');
      }
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

  describe('login', () => {
    const getResponse = stub();
    const server = setupServer(...loginHandler(getResponse));
    before(() => server.listen());
    afterEach(() => getResponse.reset());
    afterEach(() => server.resetHandlers());
    after(() => server.close());

    it('logs in Bob', async () => {
      getResponse.returns({
        'success': true,
        'errors': null,
        'token': {
          'tokenType': 'REDIRECT',
          'token': 'user-wbcx-61dfe34a-2416-44ea-8e25-136d68448222',
          'accountId': 1311,
          'prompt2FA': null,
          '__typename': 'Token',
        },
        '__typename': 'AuthLoginResponse',
      });
      const result = await login('anything', 'none');

      expect(result).to.deep.nested.include({ 'token.token': 'user-wbcx-61dfe34a-2416-44ea-8e25-136d68448222' });
    });

    it('handles a failure in the API', async () => {
      getResponse.returns({
        errors: ['heky!'],
      });
      return login('anything', 'none').should.eventually.be.rejected;
    });

    it('handles a failure in mutation', async () => {
      getResponse.returns({
        success: false,
      });
      return login('anything', 'none').should.eventually.be.rejected;
    });
  });

  describe('getRegistrationInfo', () => {
    const getResponse = stub();
    const server = setupServer(...getRegistrationInfoHandler(123455, getResponse));
    before(() => server.listen());
    afterEach(() => getResponse.reset());
    afterEach(() => server.resetHandlers());
    after(() => server.close());

    it('returns data as requested', async () => {
      getResponse.returns({
        'code': 200,
        'error': null,
        'data': {
          'id': 123455,
          'accountId': 1311,
          'registrationId': '593409403',
          'transactionCount': 1,
        },
      });
      const result = await getRegistrationInfo(123455);

      expect(result).to.include({ 'transactionCount': 1 });
    });

    it('handles a failure in the API', async () => {
      getResponse.returns({
        error: ['heky!'],
      });
      return getRegistrationInfo(123455).should.eventually.be.rejected;
    });
  });

  describe('markRegistrationComplete', () => {
    const FORM_ID = 12345;
    const REGISTRATION_ID = 532432;
    const TRANSACTION_ID = 9090;
    const ID = 3232;

    const getResponse = stub();
    const server = setupServer(...markRegistrationCompleteHandler(FORM_ID, REGISTRATION_ID, getResponse));
    before(() => server.listen());
    afterEach(() => getResponse.reset());
    afterEach(() => server.resetHandlers());
    after(() => server.close());

    // TODO figure out what a successful response looks like!
    it('returns data as requested');

    // TODO figure out what an unsuccessful response looks like!
    it('handles a failure in marking a registration as complete');

    it('handles an illegal bearerToken', async () => {
      getResponse.returns({
        code: 1000,
        message: 'unauthorized request',
      });

      return markRegistrationComplete(FORM_ID, REGISTRATION_ID, TRANSACTION_ID, ID, 'fake fake fake').should.eventually.be.rejected;
    });
  });

  describe('addNote', () => {
    const getResponse = stub();
    const server = setupServer(...addNoteHandler(getResponse));
    before(() => server.listen());
    afterEach(() => getResponse.reset());
    afterEach(() => server.resetHandlers());
    after(() => server.close());

    it('returns data as requested', async () => {
      const message = 'Hello World';
      const id = '12345';
      getResponse.returns({
        'id': 274860,
        'createdBy': 144247,
        'typeId': id,
        'noteType': 5,
        'visibility': 2,
        'message': message,
        'dateCreated': '2022-01-05T03:57:15.743859194Z',
      });

      const result = await addNote(message, id, 1234);
      expect(result).to.include.keys('dateCreated', 'message');
    });

    it('handles an illegal request', async () => {
      getResponse.returns({
        code: 1000,
        message: 'bad request',
      });

      return addNote(undefined, 'fake fake', 1234).should.eventually.be.rejected;
    });
  });

  describe('checkIn', () => {
    const ID = 12345312;

    const getResponse = stub();
    const server = setupServer(...checkInHandler(ID, getResponse));
    before(() => server.listen());
    afterEach(() => getResponse.reset());
    afterEach(() => server.resetHandlers());
    after(() => server.close());

    it('returns data as requested', async () => {
      getResponse.returns();

      const result = await checkIn(ID, 1234);

      expect(result).to.deep.equal({ 'status': 'OK' });
    });

    it('handles an illegal request', async () => {
      getResponse.returns({
        code: 1000,
        message: 'bad request',
      });

      return checkIn(ID, 1234).should.eventually.be.rejected;
    });

    it('handles a duplicate request', async () => {
      getResponse.returns({
        code: 1000,
        message: 'already checked in',
      });

      const result = await checkIn(ID, 1234);

      expect(result).to.deep.equal({ 'status': 'OK' });
    });
  });
});
