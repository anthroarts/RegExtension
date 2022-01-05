import chai, { use, should, assert } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { some } from 'lodash-es';
import { randomUUID } from 'crypto';

use(chaiAsPromised);
should();
const { expect } = chai;

import { searchRegistrations, login, getRegistrationInfo, markRegistrationComplete, addNote } from '../../src/regfox/regfox_api.js';

const loginForTest = async () => {
  const email = process.env.EMAIL;
  const password = process.env.PASSWORD;

  assert.exists(email);
  assert.exists(password);

  return login(email, password);
};

/* eslint-disable no-invalid-this */
// eslint-disable-next-line valid-jsdoc
// https://github.com/mochajs/mocha/issues/1480
const skippableFailure = (callback) => {
  return function () {
    return Promise.resolve().then((...args) => {
      return callback.apply(this, args);
    }).catch((error) => {
      console.error(error);
      this.skip();
    });
  };
};
/* eslint-enable no-invalid-this */

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

it.allowFail = (title, callback) => {
  return it(title, skippableFailure(callback));
};

before.allowFail = (callback) => {
  return before(skippableFailure(callback));
};

describe('regfox_api (integration testing)', () => {
  it.allowFail('logs in', async () => {
    const result = await loginForTest();

    expect(result).to.include.keys('token');
    expect(result.token.token).to.not.be.undefined;
  });

  describe('workflows', () => {
    const COMPLETED_STATUS = 3; // https://help.regfox.com/en/articles/2343628-registration-statuses-explained
    const TEST_NAME = 'First Last';
    const TEST_CUSTOMER_ID = '1662788';
    const TEST_ID = '26564608';

    const findTestRegistrant = (results) => results.registrants.find((reg) => reg.status === COMPLETED_STATUS && reg.customerId === TEST_CUSTOMER_ID);

    let bearerToken = undefined;
    before.allowFail(async () => {
      bearerToken = (await loginForTest()).token.token;
    });

    it.allowFail('searches for a registrant and does not find anything', async () => {
      assert.exists(bearerToken);

      const results = await searchRegistrations('GUARANTEED_TO_BE_UNIQUE_UNLESS_SOMEONE_HAS_A_REALLY_WEIRD_NAME', bearerToken);

      expect(results.registrants).to.be.empty;
    });

    it.allowFail('searches for a registrant', async () => {
      assert.exists(bearerToken);

      const results = await searchRegistrations(TEST_NAME, bearerToken);
      const registrant = findTestRegistrant(results);

      expect(registrant).to.exist;
      expect(registrant.id).to.be.equal(TEST_ID);
    });

    it.allowFail('searches for a registrant and then gets their info', async () => {
      assert.exists(bearerToken);

      const results = await searchRegistrations(TEST_NAME, bearerToken);
      const registrant = findTestRegistrant(results);
      const registrantInfo = await getRegistrationInfo(registrant.id, bearerToken);

      expect(registrantInfo.notes).to.not.be.empty;
      expect(registrantInfo.outstandingAmountString).to.be.equal('0');
      expect(registrantInfo.name).to.be.equal(TEST_NAME);
      expect(`${registrantInfo.customerId}`).to.be.equal(TEST_CUSTOMER_ID);
    });

    it.allowFail('marks a registrant as complete', async () => {
      assert.exists(bearerToken);
      const registrationInfo = await getRegistrationInfo(TEST_ID, bearerToken);

      const result = await markRegistrationComplete(registrationInfo.formId, registrationInfo.registrationId, registrationInfo.transactionId, registrationInfo.id, bearerToken);

      expect(result).to.be.empty; // TODO I don't have authorization, so it just returns {}, no errors or anything.
    });

    // TODO add this in only when necessary, its a very ugly test.
    it.skip('adds a note to a registration', async function () {
      // Arrange
      assert.exists(bearerToken);
      const results = await searchRegistrations(TEST_NAME, bearerToken);
      const registrant = findTestRegistrant(results);
      const registrantInfo = await getRegistrationInfo(registrant.id, bearerToken);

      // Act
      const message = randomUUID();
      const result = await addNote(message, registrantInfo.id, bearerToken);

      // Regfox is eventually consistent.
      let registrantInfoWithNote;
      for (let i = 0; i < 10; i++) {
        registrantInfoWithNote = await getRegistrationInfo(registrant.id, bearerToken);
        if (registrantInfoWithNote.notes.length > registrantInfo.notes.length) {
          break;
        }
        await sleep(3000); // And I mean /eventually/, this test on average takes 14 seconds...
      }

      // Assert
      expect(result).to.include.keys('message', 'dateCreated');
      expect(registrantInfoWithNote.notes).to.have.lengthOf(registrantInfo.notes.length + 1);
      expect(some(registrantInfoWithNote.notes, { message })).to.be.true;
    }).timeout(50000);
  });
});
