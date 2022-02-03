import { use, should, expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { stub, useFakeTimers } from 'sinon';

use(chaiAsPromised);
should();

import chrome from 'sinon-chrome';
global.chrome = chrome;

global.CustomEvent = class CustomEvent extends Event {
  // eslint-disable-next-line require-jsdoc
  constructor(type, extra) {
    super(type);
    this.detail = extra.detail;
  }
};

import { RegfoxApi } from '../../../src/regfox/regfox_api.js';
import { LoginManager } from '../../../src/regdesk/login/login_manager.js';

describe('regdesk_login_manager', () => {
  let clock;
  let loginManager;
  let exchangeBearerTokenStub;
  before(() => {
    clock = useFakeTimers();
    loginManager = new LoginManager(); // must be after useFakeTimers
    exchangeBearerTokenStub = stub(RegfoxApi, 'exchangeBearerToken');
  });
  beforeEach(() => chrome.storage.local.clear());
  beforeEach(() => exchangeBearerTokenStub.reset());
  after(() => chrome.reset() && chrome.flush());
  after(() => clock.uninstall());

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

  it('throws an exception when a second instances is created', () => {
    expect(() => new LoginManager()).to.throw();
  });

  it('refresh does a thing', async () => {
    chrome.storage.local.get.returns(Promise.resolve({ 'regfox-bearer-details': { bearerToken: 'old', ttl: (Date.now() + 300) } }));
    exchangeBearerTokenStub.returns({
      token: 'new',
      ttl: 900, // Typically what Regfox sends us.
    });

    await loginManager.refresh();

    expect(exchangeBearerTokenStub).calledOnceWith('old');
  });

  it('refresh does not do a thing because the ttl is super far out', async () => {
    chrome.storage.local.get.returns(Promise.resolve({ 'regfox-bearer-details': { bearerToken: 'old', ttl: (Date.now() + 30000000000) } }));

    await loginManager.refresh();

    expect(exchangeBearerTokenStub).not.called;
  });

  it('refresh does a thing because the ttl override is set', async () => {
    chrome.storage.local.get.returns(Promise.resolve({ 'regfox-bearer-details': { bearerToken: 'old', ttl: (Date.now() + 30000000000) } }));
    exchangeBearerTokenStub.returns({
      token: 'new',
      ttl: 900, // Typically what Regfox sends us.
    });

    await loginManager.refresh(true);

    expect(exchangeBearerTokenStub).calledOnceWith('old');
  });

  it('sends event in response to a local storage value change', () => {
    const listener = stub();
    loginManager.addEventListener(LoginManager.events.SET_REGFOX_LOGIN_STATUS, listener);

    chrome.storage.onChanged.dispatch({ 'regfox-bearer-details': { newValue: { bearerToken: 'old', ttl: (Date.now() + 300) } } });

    expect(listener).calledOnce;
    expect(listener.getCall(0).args[0].detail).to.deep.equal({ isLoggedIn: true });
  });
});
