import { get } from 'lodash-es';

import { isScript } from './startup/startup.js';
import { sendPopupAMessage, sendTabAMessage, MESSAGE_TYPE } from './coms/communication.js';

const STORAGE_KEY_DISABLE_AUTO_LOGOUT = 'disable-auto-logout-storage';

const getCurrentTab = async () => {
  const queryOptions = { active: true, currentWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab;
};

const init = () => {
  chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    const tab = await getCurrentTab();

    if (request.type === MESSAGE_TYPE.printLegacy) {
      // TODO, should probably just use content scripts?
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content_script.js'],
      });
    }

    if (request.type === MESSAGE_TYPE.finishLoad
      && (request.payload === 'disable-auto-logout' || request.payload === 'popup')) {
      const isEnabled = get(await chrome.storage.local.get([STORAGE_KEY_DISABLE_AUTO_LOGOUT]), [STORAGE_KEY_DISABLE_AUTO_LOGOUT], false);
      sendTabAMessage(tab, MESSAGE_TYPE.changeLogout, isEnabled);
      sendPopupAMessage(MESSAGE_TYPE.changeLogout, isEnabled);
    }

    if (request.type === MESSAGE_TYPE.changeLogout) {
      await chrome.storage.local.set({ [STORAGE_KEY_DISABLE_AUTO_LOGOUT]: request.payload });
      sendTabAMessage(tab, request.type, request.payload);
    }
  });
}

if (isScript()) {
  // When running as a script (on a webpage) auto execute.
  init();
}

export { init };