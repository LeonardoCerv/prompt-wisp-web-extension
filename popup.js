document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('prompts-container');
  
  async function loadPrompts() {
    const { prompts = [] } = await chrome.storage.local.get('prompts');
    
    if (prompts.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          No prompts saved yet
        </div>
      `;
      return;
    }
    
    container.innerHTML = '';
    prompts.forEach(prompt => {
      const item = document.createElement('div');
      item.className = 'prompt-item';
      item.textContent = prompt.text.length > 100 
        ? prompt.text.substring(0, 100) + '...' 
        : prompt.text;
      
      item.onclick = async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) return;
        
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (text) => {
              const input = document.querySelector('textarea, [contenteditable="true"]');
              if (input) {
                if (input.tagName === 'TEXTAREA') {
                  input.value = text;
                } else {
                  input.textContent = text;
                }
                input.focus();
                return true;
              }
              return false;
            },
            args: [prompt.text]
          });
        } catch (error) {
          // If pasting fails, copy to clipboard
          navigator.clipboard.writeText(prompt.text);
          item.textContent = 'Copied to clipboard!';
          setTimeout(() => item.textContent = prompt.text.substring(0, 100) + '...', 2000);
        }
      };
      
      container.appendChild(item);
    });
  }
  
  loadPrompts();
});