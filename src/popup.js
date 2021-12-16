(function () {
  const sendBackgroundScriptAMessage = (type, payload) => {
    chrome.runtime.sendMessage({ type, payload });
  }

  const setupRegDeskButton = () => {
    document.getElementById('regDesk').addEventListener('click', () => {
      chrome.tabs.create({'url': chrome.runtime.getURL('regdesk.html')}, function(tab) {});
    })
  }

  const setupPrintLegacyButton = () => {
    document.getElementById('printLegacy').addEventListener('click', () => {
      sendBackgroundScriptAMessage('print-legacy-plz');
    });
  };

  const setupDisableAutoLogoutToggle = () => {
    // TODO make this id constant...
    document.getElementById('disableAutoLogout').addEventListener('change', (e) => {
      sendBackgroundScriptAMessage('change-logout-plz', e.target.checked);
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    setupPrintLegacyButton();
    setupDisableAutoLogoutToggle();
    setupRegDeskButton();
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // FIXME/TODO the request type should be part of a shared package
    // The sendBackgroundScript a message and such should all be too
    if (request.type === 'change-logout-plz') {
      document.getElementById('disableAutoLogout').checked = request.payload;
    }
  });

  sendBackgroundScriptAMessage('loaded-plz', 'popup');
})();