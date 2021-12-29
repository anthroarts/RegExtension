import { use, expect } from 'chai';
import { stub, useFakeTimers } from 'sinon';
import sinonChai from 'sinon-chai';

use(sinonChai);

import chrome from 'sinon-chrome';
global.chrome = chrome;

global.KeyboardEvent = class KeyboardEvent { };

import { init } from '../src/disable_auto_logout.js';

describe('disable_auto_logout', () => {
  const clock = useFakeTimers();
  beforeEach(() => global.window = { dispatchEvent: stub() });
  beforeEach(() => chrome.runtime.sendMessage.flush());
  beforeEach(() => init());
  after(() => chrome.flush());
  after(() => clock.uninstall());

  it('calls send message on initial load', () => {
    expect(chrome.runtime.sendMessage).to.have.been.calledWith({ type: 'load-plz', payload: 'disable-auto-logout' });
  });

  it('timer does nothing on initial load', () => {
    clock.tick(1000 * 1000);
    expect(window.dispatchEvent).to.not.have.been.called;
  });

  it('dispatches events after getting the magic message', () => {
    chrome.runtime.onMessage.dispatch({ type: 'change-logout-plz', payload: true });
    clock.tick(1000 * 100);
    expect(window.dispatchEvent).to.have.been.called;
  });

  it('stops dispatching events after getting shutoff message', () => {
    chrome.runtime.onMessage.dispatch({ type: 'change-logout-plz', payload: false });
    clock.tick(1000 * 100);
    expect(window.dispatchEvent).to.not.have.been.called;
  });
});
