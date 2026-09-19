/**
 * AMT Toolkit - Chrome Extension Service Worker
 * Manages native Side Panel integration and extension lifecycle.
 */

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error('Error setting panel behavior:', error));

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('AMT Toolkit extension installed successfully.');
  }
});
