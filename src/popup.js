(function () {
  const sendBackgroundScriptAMessage = (type, payload) => {
    chrome.runtime.sendMessage({ type, payload });
  }

  const setupPrintLegacyButton = () => {
    document.getElementById('printLegacy').addEventListener('click', () => {
      sendBackgroundScriptAMessage('print-legacy-plz');
    });
  };

  document.addEventListener('DOMContentLoaded', setupPrintLegacyButton);
})();