// Background script for the AI Prompt Saver extension

chrome.runtime.onInstalled.addListener(() => {
  console.log('AI Prompt Saver extension installed');
  
  // Initialize storage with default values
  chrome.storage.local.get(['prompts', 'autoSave'], (result) => {
    if (!result.prompts) {
      chrome.storage.local.set({ prompts: [] });
    }
    if (result.autoSave === undefined) {
      chrome.storage.local.set({ autoSave: false });
    }
  });
  
  // Create context menu
  createContextMenu();
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openPopup') {
    // Open the popup programmatically
    chrome.action.openPopup();
  }
  
  // Keep the message channel open for async responses
  return true;
});

// Context menu for saving prompts (optional enhancement)
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'saveSelectedText') {
    if (info.selectionText) {
      savePromptFromSelection(info.selectionText, tab);
    }
  }
});

async function savePromptFromSelection(text, tab) {
  try {
    const result = await chrome.storage.local.get(['prompts']);
    const prompts = result.prompts || [];
    
    // Determine site from tab URL
    let site = 'Unknown';
    if (tab.url.includes('chat.deepseek.com')) site = 'DeepSeek';
    else if (tab.url.includes('chatgpt.com')) site = 'ChatGPT';
    else if (tab.url.includes('gemini.google.com')) site = 'Gemini';
    else if (tab.url.includes('claude.ai')) site = 'Claude';
    else if (tab.url.includes('grok.com')) site = 'Grok';
    else if (tab.url.includes('meta.ai')) site = 'Meta';
    else if (tab.url.includes('copilot.microsoft.com')) site = 'Copilot';
    
    const newPrompt = {
      id: Date.now(),
      text: text,
      site: site,
      url: tab.url,
      timestamp: new Date().toISOString(),
      autoSaved: false,
      fromSelection: true
    };
    
    prompts.unshift(newPrompt);
    
    // Keep only last 200 prompts
    if (prompts.length > 200) {
      prompts.splice(200);
    }
    
    await chrome.storage.local.set({ prompts });
    
    // Log success instead of showing notification
    console.log('Selected text saved as prompt!');
    
  } catch (error) {
    console.error('Error saving selected text:', error);
  }
}

// Create context menu when extension starts
chrome.runtime.onStartup.addListener(() => {
  createContextMenu();
});

function createContextMenu() {
  chrome.contextMenus.create({
    id: 'saveSelectedText',
    title: 'Save as AI Prompt',
    contexts: ['selection'],
    documentUrlPatterns: [
      'https://chat.openai.com/*',
      'https://claude.ai/*',
      'https://gemini.google.com/*',
      'https://copilot.microsoft.com/*',
      'https://poe.com/*',
      'https://perplexity.ai/*'
    ]
  });
}

// Badge management
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.prompts) {
    const promptCount = changes.prompts.newValue ? changes.prompts.newValue.length : 0;
    updateBadge(promptCount);
  }
});

function updateBadge(count) {
  if (count > 0) {
    chrome.action.setBadgeText({ text: count.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

// Initialize badge on startup
chrome.storage.local.get(['prompts'], (result) => {
  const promptCount = result.prompts ? result.prompts.length : 0;
  updateBadge(promptCount);
});
