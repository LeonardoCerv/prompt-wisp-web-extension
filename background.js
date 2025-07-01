// Initialize storage
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['prompts'], (result) => {
    if (!result.prompts) {
      chrome.storage.local.set({ prompts: [] });
    }
  });
});

// Handle messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'savePrompt') {
    chrome.storage.local.get(['prompts'], (result) => {
      const prompts = result.prompts || [];
      prompts.unshift({
        id: Date.now(),
        text: request.text,
        site: request.site,
        url: request.url,
        timestamp: new Date().toISOString()
      });
      if (prompts.length > 200) prompts.splice(200);
      chrome.storage.local.set({ prompts }, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }
});