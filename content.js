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

// Get current prompt text
function getCurrentPrompt() {
  const input = document.querySelector('textarea, [contenteditable="true"]');
  if (!input) return null;
  
  if (input.tagName === 'TEXTAREA') {
    return input.value;
  }
  return input.textContent || input.innerText;
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
copyBtn.onclick = () => {
  const prompt = getCurrentPrompt();
  if (prompt) {
    navigator.clipboard.writeText(prompt);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => copyBtn.textContent = 'Copy', 2000);
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
      item.onclick = () => {
        const input = document.querySelector('textarea, [contenteditable="true"]');
        if (input) {
          if (input.tagName === 'TEXTAREA') {
            input.value = prompt.text;
          } else {
            input.textContent = prompt.text;
          }
          input.focus();
          dropdown.style.display = 'none';
        } else {
          navigator.clipboard.writeText(prompt.text);
          item.textContent = 'Copied to clipboard!';
          setTimeout(() => dropdown.style.display = 'none', 1000);
        }
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