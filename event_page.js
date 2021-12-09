chrome.runtime.onInstalled.addListener(function () {
  // Replace all rules ...
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    // With a new rule ...
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {
              hostEquals: 'manage.webconnex.com',
              pathContains: 'reports/orders/'
            },
          }),
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {
              hostEquals: 'manage.webconnex.com',
              pathContains: 'reports/registrants/'
            },
          })
        ],
        actions: [new chrome.declarativeContent.ShowAction()]
      }
    ]);
  });
});

chrome.action.onClicked.addListener(function (tab) {
  // TODO, should probably just use content scripts?
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      files: ["jquery-3.1.1.min.js"],
    },
    () => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          files: ["content_script.js"],
        });
    });
});

