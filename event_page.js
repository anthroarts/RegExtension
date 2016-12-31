chrome.runtime.onInstalled.addListener(function() {
  // Replace all rules ...
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    // With a new rule ...
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostEquals: 'manage.webconnex.com',
					   pathContains: 'reports/orders/'},
          })
        ],
        actions: [ new chrome.declarativeContent.ShowPageAction() ]
      }
    ]);
  });
});

chrome.pageAction.onClicked.addListener(function() {
  chrome.tabs.executeScript(null, {file: "jquery-3.1.1.min.js"}, function() {
	chrome.tabs.executeScript(null, {file:"content_script.js"})
  });
});

