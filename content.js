// Site-specific input detection
function getSiteInput() {
  const hostname = window.location.hostname;
  
  // ChatGPT
  if (hostname.includes('chatgpt.com') || hostname.includes('chat.openai.com')) {
    return document.querySelector('#prompt-textarea[contenteditable="true"]') || 
           document.querySelector('textarea[data-id="root"]') ||
           document.querySelector('[contenteditable="true"][data-testid="textbox"]');
  }
  
  // Claude
  if (hostname.includes('claude.ai')) {
    return document.querySelector('.ProseMirror[contenteditable="true"]') ||
           document.querySelector('[contenteditable="true"]');
  }
  
  // Gemini
  if (hostname.includes('gemini.google.com')) {
    return document.querySelector('.ql-editor[contenteditable="true"]') ||
           document.querySelector('rich-textarea [contenteditable="true"]');
  }
  
  // Perplexity
  if (hostname.includes('perplexity.ai')) {
    return document.querySelector('textarea[placeholder*="Ask"]') ||
           document.querySelector('textarea');
  }
  
  // Character.ai
  if (hostname.includes('character.ai')) {
    return document.querySelector('textarea[placeholder*="Type a message"]') ||
           document.querySelector('textarea');
  }
  
  // Poe
  if (hostname.includes('poe.com')) {
    return document.querySelector('textarea[class*="ChatMessageInput"]') ||
           document.querySelector('textarea');
  }
  
  // DeepSeek/fallback - try most specific selectors first
  const selectors = [
    'textarea[placeholder*="prompt"]',
    'textarea[placeholder*="message"]',
    '[contenteditable="true"][role="textbox"]',
    'textarea[role="textbox"]',
    '[contenteditable="true"]',
    'textarea',
    'input[type="text"]'
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element && element.offsetParent !== null) { // Check if visible
      return element;
    }
  }
  
  return null;
}

// Get current prompt text
function getCurrentPrompt() {
  const input = getSiteInput();
  if (!input) return null;
  
  if (input.tagName === 'TEXTAREA') {
    return input.value;
  }
  return input.textContent || input.innerText;
}

// Enhanced paste function with reliable fallback
async function pasteWithFallback(text) {
  const input = getSiteInput();
  if (!input) {
    await navigator.clipboard.writeText(text);
    return { success: false, action: 'copied' };
  }

  try {
    // Focus the input first
    input.focus();
    
    // Set the text based on input type
    if (input.tagName === 'TEXTAREA' || input.tagName === 'INPUT') {
      // For regular textarea and input elements
      input.value = text;
      // Trigger change events
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      // Set cursor to end
      input.setSelectionRange(text.length, text.length);
    } else if (input.contentEditable === 'true') {
      // For contenteditable elements
      const selection = window.getSelection();
      
      // Clear existing content
      input.textContent = text;
      
      // Trigger input events for rich editors
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Set cursor to end
      const range = document.createRange();
      range.selectNodeContents(input);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Additional events for some rich editors
      input.dispatchEvent(new Event('keyup', { bubbles: true }));
      input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'a', ctrlKey: true }));
    }
    
    // Re-focus to ensure proper state
    input.focus();
    
    return { success: true, action: 'pasted' };
  } catch (error) {
    console.error('Paste failed, falling back to copy:', error);
    try {
      await navigator.clipboard.writeText(text);
      return { success: false, action: 'copied' };
    } catch (copyError) {
      console.error('Copy also failed:', copyError);
      return { success: false, action: 'failed' };
    }
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'insertPrompt') {
    const result = await pasteWithFallback(request.content);
    if (result.success) {
      showInsertConfirmation();
      sendResponse({ success: true });
    } else if (result.action === 'copied') {
      showCopyConfirmation();
      sendResponse({ success: false, message: 'Copied to clipboard as fallback' });
    } else {
      sendResponse({ success: false, message: 'Failed to insert prompt' });
    }
  }
});

// Legacy function - keeping for backwards compatibility but not using
function insertPromptIntoPage(content) {
  // Try to find common text input elements
  const selectors = [
    'textarea[placeholder*="prompt"]',
    'textarea[placeholder*="message"]', 
    'input[type="text"][placeholder*="prompt"]',
    'div[contenteditable="true"]',
    'textarea',
    'input[type="text"]'
  ];

  let targetElement = null;
  
  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    for (const element of elements) {
      if (element.offsetParent !== null) { // Check if visible
        targetElement = element;
        break;
      }
    }
    if (targetElement) break;
  }

  if (targetElement) {
    // Insert the prompt
    if (targetElement.tagName === 'DIV') {
      targetElement.textContent = content;
    } else {
      targetElement.value = content;
    }
    
    // Trigger input events
    targetElement.dispatchEvent(new Event('input', { bubbles: true }));
    targetElement.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Focus the element
    targetElement.focus();
    
    // Show confirmation
    showInsertConfirmation();
  } else {
    // Copy to clipboard as fallback
    navigator.clipboard.writeText(content).then(() => {
      showCopyConfirmation();
    });
  }
}

function showInsertConfirmation() {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 12px 20px;
    border-radius: 6px;
    z-index: 10000;
    font-family: system-ui;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  notification.textContent = '✓ Prompt inserted!';
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

function showCopyConfirmation() {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #3b82f6;
    color: white;
    padding: 12px 20px;
    border-radius: 6px;
    z-index: 10000;
    font-family: system-ui;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  notification.textContent = '📋 Prompt copied to clipboard!';
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Floating buttons container
const container = document.createElement('div');
container.id = 'prompt-wisp-container';
container.style = `
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 9999;
`;

// Save prompt to API or local storage via background script
async function savePromptToAPI(promptText) {
  if (!promptText || !promptText.trim()) {
    return { success: false, error: 'No content to save' };
  }

  return new Promise((resolve) => {
    chrome.runtime.sendMessage({
      action: 'savePromptToAPI',
      content: promptText,
      title: `Prompt from ${window.location.hostname}`,
      site: window.location.hostname
    }, (response) => {
      resolve(response);
    });
  });
}

// Copy button
const copyBtn = document.createElement('button');
copyBtn.textContent = 'Copy';
copyBtn.style = `
  padding: 8px 12px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;
copyBtn.onclick = async () => {
  const prompt = getCurrentPrompt();
  if (prompt) {
    try {
      await navigator.clipboard.writeText(prompt);
      copyBtn.textContent = 'Copied!';
      setTimeout(() => copyBtn.textContent = 'Copy', 2000);
    } catch (error) {
      copyBtn.textContent = 'Failed!';
      setTimeout(() => copyBtn.textContent = 'Copy', 2000);
    }
  }
};

// Save button with API integration
const saveBtn = document.createElement('button');
saveBtn.textContent = 'Save';
saveBtn.style = `
  padding: 8px 12px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;
saveBtn.onclick = async () => {
  const prompt = getCurrentPrompt();
  if (prompt) {
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;
    
    const result = await savePromptToAPI(prompt);
    
    if (result.success) {
      if (result.location === 'server') {
        saveBtn.textContent = 'Saved to Server!';
        showNotification('✓ Prompt saved to Prompt Wisp!', '#10b981');
      } else {
        saveBtn.textContent = 'Saved Locally!';
        showNotification('✓ Prompt saved locally!', '#f59e0b');
      }
    } else {
      saveBtn.textContent = 'Save Failed!';
      showNotification('✗ Failed to save prompt', '#ef4444');
    }
    
    setTimeout(() => {
      saveBtn.textContent = 'Save';
      saveBtn.disabled = false;
    }, 3000);
  }
};

// Notification helper
function showNotification(message, color) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${color};
    color: white;
    padding: 12px 20px;
    border-radius: 6px;
    z-index: 10000;
    font-family: system-ui;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Paste button with dropdown
const pasteBtn = document.createElement('button');
pasteBtn.textContent = 'Paste';
pasteBtn.style = `
  padding: 8px 12px;
  background: #FF9800;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
`;

const dropdown = document.createElement('div');
dropdown.id = 'prompt-dropdown';
dropdown.style = `
  position: absolute;
  bottom: 100%;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
  display: none;
  width: 250px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

pasteBtn.onclick = async () => {
  dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
  
  // Try to load from API first, fallback to local
  await loadPromptsForDropdown();
};

async function loadPromptsForDropdown() {
  dropdown.innerHTML = '<div style="padding: 10px; text-align: center;">Loading...</div>';
  
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({
      action: 'getPromptsFromAPI'
    }, (response) => {
      if (response && response.success) {
        displayPromptsInDropdown(response.prompts, response.source);
      } else {
        console.error('Failed to load prompts:', response?.error);
        // Fallback to empty state
        displayPromptsInDropdown([], 'error');
      }
      resolve();
    });
  });
}

function displayPromptsInDropdown(prompts, source) {
  dropdown.innerHTML = '';
  
  if (source === 'local') {
    const header = document.createElement('div');
    header.textContent = 'Local Prompts Only';
    header.style = 'padding: 8px; background: #f59e0b; color: white; font-size: 12px; text-align: center;';
    dropdown.appendChild(header);
  } else if (source === 'error') {
    const header = document.createElement('div');
    header.textContent = 'Error Loading Prompts';
    header.style = 'padding: 8px; background: #ef4444; color: white; font-size: 12px; text-align: center;';
    dropdown.appendChild(header);
  } else if (source === 'server') {
    const header = document.createElement('div');
    header.textContent = 'Server Prompts';
    header.style = 'padding: 8px; background: #10b981; color: black; font-size: 12px; text-align: center;';
    dropdown.appendChild(header);
  }
  
  if (prompts.length === 0) {
    const empty = document.createElement('div');
    empty.textContent = source === 'error' ? 'Failed to load prompts' : 'No saved prompts';
    empty.style.padding = '10px';
    empty.style.color = source === 'error' ? '#ef4444' : '#6b7280';
    dropdown.appendChild(empty);
  } else {
    prompts.slice(0, 10).forEach(prompt => { // Limit to 10 most recent
      const item = document.createElement('div');
      const content = prompt.content || prompt.text || '';
      item.textContent = content.length > 50 
        ? content.substring(0, 50) + '...' 
        : content;
      item.style = `
        padding: 8px;
        cursor: pointer;
        border-bottom: 1px solid #eee;
        color: black;
      `;
      item.onmouseenter = () => item.style.backgroundColor = '#f5f5f5';
      item.onmouseleave = () => item.style.backgroundColor = '';
      item.onclick = async () => {
        const result = await pasteWithFallback(content);
        if (result.success) {
          item.textContent = 'Pasted!';
          showNotification('✓ Prompt pasted!', '#10b981');
        } else if (result.action === 'copied') {
          item.textContent = 'Copied to clipboard!';
          showNotification('📋 Prompt copied to clipboard!', '#3b82f6');
        } else {
          item.textContent = 'Failed!';
          showNotification('✗ Failed to paste prompt', '#ef4444');
        }
        setTimeout(() => dropdown.style.display = 'none', 1000);
      };
      dropdown.appendChild(item);
    });
  }
}

document.addEventListener('click', (e) => {
  if (!pasteBtn.contains(e.target)) {
    dropdown.style.display = 'none';
  }
});

// Add elements to DOM
container.appendChild(dropdown);
container.appendChild(pasteBtn);
container.appendChild(saveBtn);
container.appendChild(copyBtn);
document.body.appendChild(container);