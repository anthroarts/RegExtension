import chai, { use, should, assert } from 'chai';
import chaiAsPromised from 'chai-as-promised';

use(chaiAsPromised);
should();
const { expect } = chai;

import { searchRegistrations, login, getRegistrationInfo } from '../../src/regfox/regfox_api.js';

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

it.allowFail = (title, callback) => {
  it(title, skippableFailure(callback));
};

before.allowFail = (callback) => {
  before(skippableFailure(callback));
};
/* eslint-enable no-invalid-this */

describe('regfox_api (integration testing)', () => {
  it.allowFail('logs in', async () => {
    const result = await loginForTest();
    expect(result).to.include.keys('token');
    expect(result.token.token).to.not.be.undefined;
  });

  describe('workflows', () => {
    let bearerToken = undefined;
    before.allowFail(async () => {
      bearerToken = (await loginForTest()).token.token;
    });

    it.allowFail('searches and does not find anything', async () => {
      assert.exists(bearerToken);

      const results = await searchRegistrations('GUARANTEED_TO_BE_UNIQUE_UNLESS_SOMEONE_HAS_A_REALLY_WEIRD_NAME', bearerToken);
      expect(results.registrants).to.be.empty;
    });

    it.allowFail('searches for a user', async () => {
      assert.exists(bearerToken);

      const results = await searchRegistrations('First Last', bearerToken);
      expect(results.registrants).to.have.lengthOf.at.least(1);
      const registrant = results.registrants.find((reg) => reg.status === 3 && reg.customerId === '1662788');
      expect(registrant).to.exist;
      expect(registrant.id).to.be.equal('26564608');
    });

    it.allowFail('searches for a user and then gets their info', async () => {
      assert.exists(bearerToken);

      const results = await searchRegistrations('First Last', bearerToken);
      const registrant = results.registrants.find((reg) => reg.status === 3 && reg.customerId === '1662788');
      const registrantInfo = await getRegistrationInfo(registrant.id, bearerToken);
      expect(registrantInfo.notes).to.not.be.empty;
      expect(registrantInfo.outstandingAmountString).to.be.equal('0');
    });
  });
});
