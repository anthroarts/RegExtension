import { use, expect } from 'chai';
import sinonChai from 'sinon-chai';

use(sinonChai);

import chrome from 'sinon-chrome';
global.chrome = chrome;

import { JSDOM } from 'jsdom';
import { fireEvent } from '@testing-library/dom';

import { init } from '../src/popup.js';

describe('popup', () => {
  beforeEach(async () => JSDOM.fromFile('./public/popup.html').then(dom => {
    global.document = dom.window.document
    global.window = dom.window;
  }));
  beforeEach(() => chrome.runtime.sendMessage.flush());
  after(() => chrome.flush());

  it('calls send message on initial load', async () => {
    init();
    expect(chrome.runtime.sendMessage).to.have.been.calledWith({ type: 'load-plz', payload: 'popup' })
  });

  it('changes the toggle when recieving a change-logout-plz message', async () => {
    init();
    chrome.runtime.onMessage.dispatch({ type: 'change-logout-plz', payload: true });
    expect(document.getElementById('disableAutoLogout').checked).to.be.true;
  });

  describe('DOMContentLoaded', () => {
    beforeEach(() => {
      init();
      fireEvent(document, new window.Event('DOMContentLoaded', { bubbles: true, cancelable: true }));
      chrome.runtime.sendMessage.flush(); // Reflush things to make the tests easier.
    });

    it('creates a new tab when regDesk button is clicked', async () => {
      fireEvent.click(document.getElementById('regDesk'));
      expect(chrome.tabs.create).to.have.been.calledOnce;
    });

    it('sends a message when legacyprint button is clicked', async () => {
      fireEvent.click(document.getElementById('printLegacy'));
      expect(chrome.runtime.sendMessage).to.have.been.calledOnceWith({ type: 'print-legacy-plz', payload: undefined });
    });

    it('sends a message when disableAutoLogout toggle is clicked', async () => {
      fireEvent.click(document.getElementById('disableAutoLogout'));
      expect(chrome.runtime.sendMessage).to.have.been.calledOnceWith({ type: 'change-logout-plz', payload: true });

      fireEvent.click(document.getElementById('disableAutoLogout'));
      expect(chrome.runtime.sendMessage).to.have.been.calledWith({ type: 'change-logout-plz', payload: false });
    });
  });
});