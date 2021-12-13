
const getCurrentTab = async () => {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
};

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.type === 'print-legacy-plz') {
    // TODO, should probably just use content scripts?
    const tab = await getCurrentTab();
    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        files: ["content_script.js"],
      });
  }
});
