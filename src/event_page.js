import { get } from 'lodash-es';

import { isScript } from './startup/startup.js';
import { sendPopupAMessage, sendTabAMessage, MESSAGE_TYPE } from './coms/communication.js';

const STORAGE_KEY_DISABLE_AUTO_LOGOUT = 'disable-auto-logout-storage';

const getCurrentTab = async () => {
  const queryOptions = { active: true, currentWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab;
};

const getAllRegfoxTabs = async () => {
  const queryOptions = { url: 'https://manage.webconnex.com/*' };
  return chrome.tabs.query(queryOptions);
};

const injectPrintButtonScript = (tabId, change) => {
  // Change event only includes the details that actaully changed. We only want
  // to inject this script on the right page.
  if (!change?.url?.match(/manage\.webconnex\.com\/a\/\d+\/reports\/orders\/\d+\/details/)) {
    return;
  }

  chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ['detail_print.js'],
  });
};

const init = () => {
  chrome.tabs.onUpdated.addListener(injectPrintButtonScript);

  chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.type === MESSAGE_TYPE.printLegacy) {
      // TODO, should probably just use content scripts?
      const tab = await getCurrentTab();
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content_script.js'],
      });
    }

    if (request.type === MESSAGE_TYPE.finishLoad &&
      (request.payload === 'disable-auto-logout' || request.payload === 'popup')) {
      const tabs = await getAllRegfoxTabs();
      const isEnabled = get(await chrome.storage.local.get([STORAGE_KEY_DISABLE_AUTO_LOGOUT]), [STORAGE_KEY_DISABLE_AUTO_LOGOUT], false);
      tabs.forEach((tab) => sendTabAMessage(tab, MESSAGE_TYPE.changeLogout, isEnabled));
      sendPopupAMessage(MESSAGE_TYPE.changeLogout, isEnabled);
    }

    if (request.type === MESSAGE_TYPE.changeLogout) {
      const tabs = await getAllRegfoxTabs();
      await chrome.storage.local.set({ [STORAGE_KEY_DISABLE_AUTO_LOGOUT]: request.payload });
      tabs.forEach((tab) => sendTabAMessage(tab, MESSAGE_TYPE.changeLogout, request.payload));
    }
  });
};

if (isScript()) {
  // When running as a script (on a webpage) auto execute.
  init();
}

export { init };
