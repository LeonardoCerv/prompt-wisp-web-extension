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
          const result = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (text) => {
              // Site-specific input detection
              function getSiteInput() {
                const hostname = window.location.hostname;
                
                // ChatGPT - multiple possible selectors
                if (hostname.includes('chatgpt.com') || hostname.includes('chat.openai.com')) {
                  return document.querySelector('#prompt-textarea[contenteditable="true"]') || 
                         document.querySelector('div[contenteditable="true"].ProseMirror') ||
                         document.querySelector('textarea[data-id="root"]') ||
                         document.querySelector('textarea#prompt-textarea');
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

              // Special handling for ChatGPT's ProseMirror editor
              function handleChatGPTInput(input, text) {
                try {
                  // Clear existing content
                  input.innerHTML = '';
                  
                  // Create paragraphs for each line break
                  const paragraphs = text.split('\n').filter(p => p.trim() !== '');
                  if (paragraphs.length === 0) {
                    const p = document.createElement('p');
                    p.textContent = text;
                    input.appendChild(p);
                  } else {
                    paragraphs.forEach(para => {
                      const p = document.createElement('p');
                      p.textContent = para;
                      input.appendChild(p);
                    });
                  }
                  
                  // Focus and place cursor at end
                  input.focus();
                  const range = document.createRange();
                  range.selectNodeContents(input);
                  range.collapse(false);
                  const selection = window.getSelection();
                  selection.removeAllRanges();
                  selection.addRange(range);
                  
                  // Trigger necessary events
                  const event = new Event('input', { bubbles: true });
                  input.dispatchEvent(event);
                  
                  return true;
                } catch (error) {
                  console.error('ChatGPT paste failed:', error);
                  return false;
                }
              }

              // Enhanced paste function with reliable fallback
              async function pasteWithFallback(text) {
                const input = getSiteInput();
                if (!input) {
                  await navigator.clipboard.writeText(text);
                  return { success: false, action: 'copied' };
                }

                try {
                  const hostname = window.location.hostname;
                  let pasteSuccess = false;
                  
                  // Special handling for ChatGPT
                  if (hostname.includes('chatgpt.com') || hostname.includes('chat.openai.com')) {
                    pasteSuccess = handleChatGPTInput(input, text);
                  } 
                  // Standard handling for other sites
                  else {
                    if (input.tagName === 'TEXTAREA') {
                      input.value = text;
                      input.dispatchEvent(new Event('input', { bubbles: true }));
                      input.dispatchEvent(new Event('change', { bubbles: true }));
                    } else {
                      input.textContent = text;
                      input.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                    
                    // Focus and place cursor at end
                    input.focus();
                    if (input.contentEditable === 'true') {
                      const selection = window.getSelection();
                      const newRange = document.createRange();
                      newRange.selectNodeContents(input);
                      newRange.collapse(false);
                      selection.removeAllRanges();
                      selection.addRange(newRange);
                    }
                    pasteSuccess = true;
                  }
                  
                  if (pasteSuccess) {
                    return { success: true, action: 'pasted' };
                  }
                } catch (error) {
                  console.error('Paste failed:', error);
                }

                // Fallback to copy if paste failed
                try {
                  await navigator.clipboard.writeText(text);
                  return { success: false, action: 'copied' };
                } catch (copyError) {
                  console.error('Copy also failed:', copyError);
                  return { success: false, action: 'failed' };
                }
              }

              // Execute the paste function
              return pasteWithFallback(text);
            },
            args: [prompt.text]
          });

          // Handle the result
          const pasteResult = result[0].result;
          if (pasteResult.success) {
            item.textContent = 'Pasted!';
          } else if (pasteResult.action === 'copied') {
            item.textContent = 'Copied to clipboard!';
          } else {
            item.textContent = 'Failed!';
          }
          
          setTimeout(() => {
            item.textContent = prompt.text.length > 100 
              ? prompt.text.substring(0, 100) + '...' 
              : prompt.text;
          }, 2000);
          
        } catch (error) {
          // If script injection fails, copy to clipboard as fallback
          try {
            await navigator.clipboard.writeText(prompt.text);
            item.textContent = 'Copied to clipboard!';
          } catch (copyError) {
            item.textContent = 'Failed!';
          }
          setTimeout(() => {
            item.textContent = prompt.text.length > 100 
              ? prompt.text.substring(0, 100) + '...' 
              : prompt.text;
          }, 2000);
        }
      };
      
      container.appendChild(item);
    });
  }
  
  loadPrompts();
});