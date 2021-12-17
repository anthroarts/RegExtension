import { isScript } from './startup/startup.js'
import { sendBackgroundScriptAMessage, MESSAGE_TYPE } from './coms/communication.js';

const init = () => {
  var isEnabled = false;

  setInterval(() => {
    if (!isEnabled) {
      return;
    }

    // There is probably a better way to do this, utilizing something like
    // angular.element($('[ng-controller]')).scope().<something>.clearIdle()
    // But I couldn't figure it out. And hey, this works!
    window.dispatchEvent(new KeyboardEvent('keyup', null));
  }, 1000);

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === MESSAGE_TYPE.changeLogout) {
      isEnabled = request.payload;
    }
  });

  sendBackgroundScriptAMessage(MESSAGE_TYPE.finishLoad, 'disable-auto-logout');
};

if (isScript()) {
  // When running as a script (on a webpage) auto execute.
  init();
}

export { init };