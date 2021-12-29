import { isScript } from './startup/startup.js';
import { sendBackgroundScriptAMessage, MESSAGE_TYPE } from './coms/communication.js';

const DISABLE_AUTO_LOGOUT_ID = 'disableAutoLogout';

const init = () => {
  const setupRegDeskButton = () => {
    document.getElementById('regDesk').addEventListener('click', () => {
      chrome.tabs.create({ 'url': chrome.runtime.getURL('regdesk.html') });
    });
  };

  const setupPrintLegacyButton = () => {
    document.getElementById('printLegacy').addEventListener('click', () => {
      sendBackgroundScriptAMessage(MESSAGE_TYPE.printLegacy);
    });
  };

  const setupDisableAutoLogoutToggle = () => {
    document.getElementById(DISABLE_AUTO_LOGOUT_ID).addEventListener('change', (e) => {
      sendBackgroundScriptAMessage(MESSAGE_TYPE.changeLogout, e.target.checked);
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    setupPrintLegacyButton();
    setupDisableAutoLogoutToggle();
    setupRegDeskButton();
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === MESSAGE_TYPE.changeLogout) {
      document.getElementById(DISABLE_AUTO_LOGOUT_ID).checked = request.payload;
    }
  });

  sendBackgroundScriptAMessage(MESSAGE_TYPE.finishLoad, 'popup');
};

if (isScript()) {
  // When running as a script (on a webpage) auto execute.
  init();
}

export { init };
