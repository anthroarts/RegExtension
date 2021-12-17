import { use, should, expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

use(chaiAsPromised);
should();

import { getBearerToken } from '../../src/regfox/regfox_page.js';

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
});