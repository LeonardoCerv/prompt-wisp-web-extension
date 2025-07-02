// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'insertPrompt') {
    insertPromptIntoPage(request.content);
    sendResponse({ success: true });
  }
});

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

// Site-specific input detection
function getSiteInput() {
  const hostname = window.location.hostname;
  
  // ChatGPT
  if (hostname.includes('chatgpt.com') || hostname.includes('chat.openai.com')) {
    return document.querySelector('#prompt-textarea[contenteditable="true"]') || 
           document.querySelector('textarea[data-id="root"]');
  }
  
  // Claude
  if (hostname.includes('claude.ai')) {
    return document.querySelector('.ProseMirror[contenteditable="true"]');
  }
  
  // Gemini
  if (hostname.includes('gemini.google.com')) {
    return document.querySelector('.ql-editor[contenteditable="true"]');
  }
  
  // DeepSeek/fallback
  return document.querySelector('textarea, [contenteditable="true"]');
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
    // Save current selection
    const selection = window.getSelection();
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    
    // Set the text
    if (input.tagName === 'TEXTAREA') {
      input.value = text;
      // Trigger change events
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      input.textContent = text;
      // Trigger input events for rich editors
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    // Focus and place cursor at end
    input.focus();
    if (input.contentEditable === 'true') {
      const newRange = document.createRange();
      newRange.selectNodeContents(input);
      newRange.collapse(false);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }
    
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
    header.style = 'padding: 8px; background: #10b981; color: white; font-size: 12px; text-align: center;';
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