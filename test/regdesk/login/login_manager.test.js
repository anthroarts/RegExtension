import { use, should, expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

use(chaiAsPromised);
should();

import chrome from 'sinon-chrome';
global.chrome = chrome;

import { LoginManager } from '../../../src/regdesk/login/login_manager.js';

describe('regdesk_login_manager', () => {
  const loginManager = new LoginManager();

  beforeEach(() => chrome.reset());
  after(() => chrome.flush());

  it('returns false for isLoggedIn when bearerDetails is null', () => {
    chrome.storage.local.get.returns(Promise.resolve(null));
    return expect(loginManager.isLoggedIn()).to.eventually.be.false;
  });

  it('returns false for isLoggedIn when ttl is expired', () => {
    chrome.storage.local.get.returns(Promise.resolve({ 'regfox-bearer-details': { ttl: (Date.now() - 300) } }));
    return expect(loginManager.isLoggedIn()).to.eventually.be.false;
  });

  it('returns true for isLoggedIn when ttl is fresh', () => {
    chrome.storage.local.get.returns(Promise.resolve({ 'regfox-bearer-details': { ttl: (Date.now() + 300) } }));
    return expect(loginManager.isLoggedIn()).to.eventually.be.true;
  });

  it('expects storage to be null after logout', async () => {
    await loginManager.logout();
    expect(chrome.storage.local.set).to.have.been.calledOnceWith({ 'regfox-bearer-details': null });
  });
});
