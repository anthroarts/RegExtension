
const MESSAGE_TYPE = {
  changeLogout: 'change-logout-plz', // payload is a boolean
  finishLoad: 'load-plz', // payload is the name of the script that just loaded
  printLegacy: 'print-legacy-plz', // payload is undefined
  printLabel: 'print-label-plz', // payload is a BadgeLabelBuilder.
};

/**
 * Sends a message to the background script. Technically asynchronous, and
 * technically the popup can listen in on these.
 *
 * @param {*} type one of MESSAGE_TYPES
 * @param {*} payload whatever object you want
 * @param {function(*?)} callback - Optional response handler for a response from
 * the message handler.
 */
const sendBackgroundScriptAMessage = (type, payload, callback) => {
  chrome.runtime.sendMessage({ type, payload }, callback);
};

/**
 * Sends a message to a particular tab.
 *
 * @param {*} tab the tab to recieve the message
 * @param {*} type one of MESSAGE_TYPES
 * @param {*} payload whatever object you want
 */
const sendTabAMessage = (tab, type, payload) => {
  chrome.tabs.sendMessage(tab.id, { type, payload });
};

/**
 * Sends a message to the popup script. Technically asynchronous, and technically the background can listen in on these.
 *
 * @param {*} type one of MESSAGE_TYPES
 * @param {*} payload whatever object you want
 */
const sendPopupAMessage = (type, payload) => {
  chrome.runtime.sendMessage({ type, payload });
};

export { sendBackgroundScriptAMessage, sendTabAMessage, sendPopupAMessage, MESSAGE_TYPE };
