import { use, expect } from 'chai';
import { stub } from 'sinon';
import sinonChai from 'sinon-chai';

use(sinonChai);

import chrome from 'sinon-chrome';
global.chrome = chrome;

import { init } from '../src/event_page.js';

describe('event_page', () => {
  beforeEach(() => chrome.reset());
  beforeEach(() => chrome.scripting = { executeScript: stub() });
  beforeEach(() => init());
  after(() => chrome.flush());

  it('sets up the listener upon init', async () => {
    expect(chrome.runtime.onMessage.addListener).to.have.been.called;
  });

  describe('listener', () => {
    beforeEach(() => chrome.tabs.query.returns([{ id: 1 }]));
    beforeEach(() => chrome.runtime.sendMessage.flush());
    beforeEach(() => chrome.tabs.sendMessage.flush());

    const sendMessage = async (message) => {
      // We can't use the regular `chrome.runtime.onMessage.dispatch` because 
      // our listener is async and sinon-chrome doesn't support that.
      return Promise.all(chrome.runtime.onMessage._listeners.map(async listener => listener(message)))
    };

    it('calls executeScript when printLegacy message is received', async () => {
      await sendMessage({ type: 'print-legacy-plz' });
      expect(chrome.scripting.executeScript).to.have.been.called;
    });

    it('forwards change-logout-plz as it should', async () => {
      await sendMessage({ type: 'change-logout-plz', payload: true });
      expect(chrome.storage.local.set).to.have.been.calledOnceWith({ 'disable-auto-logout-storage': true });
      expect(chrome.tabs.sendMessage).to.have.been.calledOnceWith(1, { type: 'change-logout-plz', payload: true });
    });

    it('listens for loaded events from popup', async () => {
      chrome.storage.local.get.returns({ 'disable-auto-logout-storage': true });
      await sendMessage({ type: 'load-plz', payload: 'popup' });
      expect(chrome.tabs.sendMessage).to.have.been.calledOnceWith(1, { type: 'change-logout-plz', payload: true });
      expect(chrome.runtime.sendMessage).to.have.been.calledOnceWith({ type: 'change-logout-plz', payload: true });
    });

    it('listens for loaded events from popup', async () => {
      chrome.storage.local.get.returns(undefined);
      await sendMessage({ type: 'load-plz', payload: 'disable-auto-logout' });
      expect(chrome.tabs.sendMessage).to.have.been.calledOnceWith(1, { type: 'change-logout-plz', payload: false });
      expect(chrome.runtime.sendMessage).to.have.been.calledOnceWith({ type: 'change-logout-plz', payload: false });
    });
  });
});