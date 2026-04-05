const OFFLINE_ERRORS = [
  'net::ERR_INTERNET_DISCONNECTED',
  'net::ERR_CONNECTION_REFUSED',
  'net::ERR_ADDRESS_UNREACHABLE',
];

chrome.webNavigation.onErrorOccurred.addListener((details) => {
  if (details.frameId !== 0) return; // main frame only

  if (OFFLINE_ERRORS.some((err) => details.error.includes(err))) {
    chrome.tabs.update(details.tabId, {
      url: chrome.runtime.getURL('index.html'),
    });
  }
});
