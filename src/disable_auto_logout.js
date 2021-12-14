(function () {
  var isEnabled = false;

  const intervalID = setInterval(() => {
    if (!isEnabled) {
      return;
    }

    window.dispatchEvent(new KeyboardEvent('keyup', null));
  }, 1000);

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'change-logout-plz') {
      isEnabled = request.payload;
    }
  });

  const sendBackgroundScriptAMessage = (type, payload) => {
    chrome.runtime.sendMessage({ type, payload });
  }

  sendBackgroundScriptAMessage('loaded-plz', 'disable-auto-logout');
})();