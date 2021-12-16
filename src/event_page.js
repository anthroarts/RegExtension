import { get } from 'lodash';

const getCurrentTab = async () => {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
};

const sendTabAMessage = (tab, type, payload) => {
  chrome.tabs.sendMessage(tab.id, { type, payload });
}

const sendPopupAMessage = (type, payload) => {
  chrome.runtime.sendMessage({ type, payload });
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  const tab = await getCurrentTab();

  if (request.type === 'print-legacy-plz') {
    // TODO, should probably just use content scripts?
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content_script.js"],
    });
  }

  if (request.type === 'loaded-plz'
    && (request.payload === 'disable-auto-logout' || request.payload === 'popup')) {
    const isEnabled = get(await chrome.storage.local.get(['disable-auto-logout-storage']), 'disable-auto-logout-storage', false);
    sendTabAMessage(tab, 'change-logout-plz', isEnabled);
    sendPopupAMessage('change-logout-plz', isEnabled);
  }

  if (request.type === 'change-logout-plz') {
    await chrome.storage.local.set({ 'disable-auto-logout-storage': request.payload });
    sendTabAMessage(tab, request.type, request.payload);
  }
});