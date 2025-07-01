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

// Save button
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
    const site = window.location.hostname;
    const url = window.location.href;
    
    const { prompts = [] } = await chrome.storage.local.get('prompts');
    prompts.unshift({
      id: Date.now(),
      text: prompt,
      site,
      url,
      timestamp: new Date().toISOString()
    });
    
    await chrome.storage.local.set({ prompts });
    saveBtn.textContent = 'Saved!';
    setTimeout(() => saveBtn.textContent = 'Save', 2000);
  }
};

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
  
  const { prompts = [] } = await chrome.storage.local.get('prompts');
  dropdown.innerHTML = '';
  
  if (prompts.length === 0) {
    const empty = document.createElement('div');
    empty.textContent = 'No saved prompts';
    empty.style.padding = '10px';
    dropdown.appendChild(empty);
  } else {
    prompts.forEach(prompt => {
      const item = document.createElement('div');
      item.textContent = prompt.text.length > 50 
        ? prompt.text.substring(0, 50) + '...' 
        : prompt.text;
      item.style = `
        padding: 8px;
        cursor: pointer;
        border-bottom: 1px solid #eee;
      `;
      item.onclick = async () => {
        const result = await pasteWithFallback(prompt.text);
        if (result.success) {
          item.textContent = 'Pasted!';
        } else if (result.action === 'copied') {
          item.textContent = 'Copied to clipboard!';
        } else {
          item.textContent = 'Failed!';
        }
        setTimeout(() => dropdown.style.display = 'none', 1000);
      };
      dropdown.appendChild(item);
    });
  }
};

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