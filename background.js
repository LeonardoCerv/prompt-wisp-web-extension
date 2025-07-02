// Background script for Prompt Wisp Extension
// Handles extension lifecycle and storage management

// Configuration
const API_BASE = 'https://prompt-wisp.vercel.app/'; // Replace with your actual Prompt Wisp domain

// Initialize storage and extension state
chrome.runtime.onInstalled.addListener(() => {
  // Initialize local prompts storage if it doesn't exist
  chrome.storage.local.get(['prompts'], (result) => {
    if (!result.prompts) {
      chrome.storage.local.set({ prompts: [] });
    }
  });
  
  // Clear any stale authentication data on fresh install
  if (chrome.runtime.OnInstalledReason && chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.storage.local.clear();
  }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Prompt Wisp Extension started');
});

// Handle messages between different parts of the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'savePrompt':
      handleSavePrompt(request, sendResponse);
      return true; // Indicates we will respond asynchronously
      
    case 'getPrompts':
      handleGetPrompts(sendResponse);
      return true;
      
    case 'clearLocalData':
      handleClearLocalData(sendResponse);
      return true;
      
    case 'syncWithServer':
      handleSyncWithServer(sendResponse);
      return true;

    case 'savePromptToAPI':
      handleSavePromptToAPI(request, sendResponse);
      return true;

    case 'getPromptsFromAPI':
      handleGetPromptsFromAPI(sendResponse);
      return true;

    case 'checkAuth':
      handleCheckAuth(sendResponse);
      return true;
      
    default:
      console.warn('Unknown action:', request.action);
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

// Save prompt to local storage
async function handleSavePrompt(request, sendResponse) {
  try {
    const { prompts = [] } = await chrome.storage.local.get('prompts');
    
    const newPrompt = {
      id: Date.now(),
      text: request.text || request.content,
      content: request.content || request.text,
      title: request.title || `Prompt from ${request.site || 'unknown'}`,
      site: request.site || '',
      url: request.url || '',
      timestamp: new Date().toISOString()
    };
    
    prompts.unshift(newPrompt);
    
    // Limit to 200 prompts to prevent storage bloat
    if (prompts.length > 200) {
      prompts.splice(200);
    }
    
    await chrome.storage.local.set({ prompts });
    sendResponse({ success: true, prompt: newPrompt });
  } catch (error) {
    console.error('Failed to save prompt:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Get prompts from local storage
async function handleGetPrompts(sendResponse) {
  try {
    const { prompts = [] } = await chrome.storage.local.get('prompts');
    sendResponse({ success: true, prompts });
  } catch (error) {
    console.error('Failed to get prompts:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Clear local data
async function handleClearLocalData(sendResponse) {
  try {
    await chrome.storage.local.clear();
    sendResponse({ success: true });
  } catch (error) {
    console.error('Failed to clear local data:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Sync with server (placeholder for future implementation)
async function handleSyncWithServer(sendResponse) {
  try {
    // This could be implemented to sync local prompts with server
    // when connection is restored
    console.log('Sync with server requested - not yet implemented');
    sendResponse({ success: true, message: 'Sync not yet implemented' });
  } catch (error) {
    console.error('Sync failed:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// API Functions - These run from extension context, avoiding CORS issues

// Check authentication status with API
async function handleCheckAuth(sendResponse) {
  try {
    const response = await fetch(`${API_BASE}/api/extension/auth`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const authData = await response.json();
    sendResponse({ success: true, authenticated: authData.authenticated, user: authData.user });
  } catch (error) {
    console.error('Auth check failed:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Save prompt to API
async function handleSavePromptToAPI(request, sendResponse) {
  const { content, title, site } = request;
  
  if (!content || !content.trim()) {
    sendResponse({ success: false, error: 'No content to save' });
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/prompts`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title || `Prompt from ${site || 'unknown'}`,
        content: content,
        tags: site ? [site] : []
      })
    });

    if (response.ok) {
      const savedPrompt = await response.json();
      sendResponse({ success: true, location: 'server', prompt: savedPrompt });
    } else {
      throw new Error(`Server error: ${response.status}`);
    }
  } catch (error) {
    console.error('API save failed:', error);
    // Fallback to local storage
    const localResult = await savePromptLocallyInternal(content, title, site);
    sendResponse({ success: localResult.success, location: 'local', error: error.message });
  }
}

// Get prompts from API
async function handleGetPromptsFromAPI(sendResponse) {
  try {
    // First check if authenticated
    const authResponse = await fetch(`${API_BASE}/api/extension/auth`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const authData = await authResponse.json();
    
    if (!authData.authenticated) {
      // Fallback to local prompts
      const { prompts = [] } = await chrome.storage.local.get('prompts');
      sendResponse({ success: true, prompts, source: 'local', authenticated: false });
      return;
    }

    // Get prompts from server
    const response = await fetch(`${API_BASE}/api/prompts`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (response.ok) {
      const prompts = await response.json();
      sendResponse({ success: true, prompts, source: 'server', authenticated: true });
    } else {
      throw new Error(`Server error: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to load from API:', error);
    // Fallback to local prompts
    const { prompts = [] } = await chrome.storage.local.get('prompts');
    sendResponse({ success: true, prompts, source: 'local', error: error.message });
  }
}

// Internal helper function for local saves
async function savePromptLocallyInternal(content, title, site) {
  try {
    const { prompts = [] } = await chrome.storage.local.get('prompts');
    const newPrompt = {
      id: Date.now(),
      text: content,
      content: content,
      title: title || `Prompt from ${site || 'unknown'}`,
      site: site || '',
      url: '',
      timestamp: new Date().toISOString()
    };
    
    prompts.unshift(newPrompt);
    
    // Limit to 200 prompts to prevent storage bloat
    if (prompts.length > 200) {
      prompts.splice(200);
    }
    
    await chrome.storage.local.set({ prompts });
    return { success: true, prompt: newPrompt };
  } catch (error) {
    console.error('Local save failed:', error);
    return { success: false, error: error.message };
  }
}

// Handle extension updates
chrome.runtime.onUpdateAvailable.addListener((details) => {
  console.log('Extension update available:', details);
  // Auto-reload the extension to apply updates
  chrome.runtime.reload();
});

// Error handling for uncaught errors
self.addEventListener('error', (event) => {
  console.error('Background script error:', event.error);
});

// Handle unhandled promise rejections
self.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault();
});