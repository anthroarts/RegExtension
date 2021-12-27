import { isScript } from './startup/startup.js';
import { sendBackgroundScriptAMessage, MESSAGE_TYPE } from './coms/communication.js';

const init = () => {
  let isEnabled = false;

  setInterval(() => {
    if (!isEnabled) {
      return;
    }

    // Inside regfox is a method you can grep called `clearIdle`. It resets
    // the idle timers and if not called, will lead to the auto-logout popup.
    //
    // Ideally we would call this `clearIdle` directly, but its obfuscated
    // behind Angular. Theoretically we could grab a reference via something like
    // `angular.element($('[ng-controller]')).scope().<something>.clearIdle()`
    // But I couldn't figure it out.
    //
    // However, inside regfox is a window.addEventListener that triggers on
    // keyup, mousemove, and a few other window.Events and calls `clearIdle`
    // for us! So while a bit roundabout, this does reset idle timers too.
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
