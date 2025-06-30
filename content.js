// Content script to detect and extract prompts from AI LLM websites

class PromptDetector {
  constructor() {
    this.site = this.detectSite();
    this.setupPromptCapture();
  }

  detectSite() {
    const hostname = window.location.hostname;

    if (hostname.includes('chat.deepseek.com')) return 'DeepSeek';
    if (hostname.includes('chatgpt.com')) return 'ChatGPT';
    if (hostname.includes('gemini.google.com')) return 'Gemini';
    if (hostname.includes('claude.ai')) return 'Claude';
    if (hostname.includes('grok.com')) return 'Grok';
    if (hostname.includes('meta.ai')) return 'Meta';
    if (hostname.includes('copilot.microsoft.com')) return 'Copilot';

    return 'Unknown';
  }
    // [TODO] Define selectors for different AI sites
  getPromptSelectors() {
    const selectors = {
      'DeepSeek': [
        'textarea[placeholder*="Message"]',
        'textarea[data-id="root"]',
        '[contenteditable="true"][data-id="root"]',
        'textarea.m-0'
      ],
      'ChatGPT': [
        'textarea[placeholder*="Message"]',
        'textarea[data-id="root"]',
        '[contenteditable="true"][data-id="root"]',
        'textarea.m-0'
      ],
      'Gemini': [
        'textarea[aria-label*="Message"]',
        'rich-textarea textarea',
        '.ql-editor'
      ],
      'Claude': [
        'div[contenteditable="true"]',
        'textarea[placeholder*="Message"]',
        '.ProseMirror'
      ],
      'Grok': [
        'textarea[placeholder*="Message"]',
        '.ChatMessageInputContainer textarea'
      ],
      'Meta': [
        'textarea[placeholder*="Message"]',
        '.ChatMessageInputContainer textarea'
      ],
      'Copilot': [
        'textarea[placeholder*="Message"]',
        'cib-text-input textarea',
        '#searchbox textarea'
      ]
    };

    return selectors[this.site] || ['textarea', '[contenteditable="true"]'];
  }

  getCurrentPrompt() {
    const selectors = this.getPromptSelectors();
    
    for (const selector of selectors) {
      try {
        const element = document.querySelector(selector);
        if (element) {
          const text = element.value || element.textContent || element.innerText;
          if (text && text.trim().length > 0) {
            return text.trim();
          }
        }
      } catch (e) {
        console.log(`Selector failed: ${selector}`, e);
      }
    }
    
    return null;
  }

  setupPromptCapture() {
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'getCurrentPrompt') {
        const prompt = this.getCurrentPrompt();
        sendResponse({ 
          prompt: prompt,
          site: this.site,
          url: window.location.href
        });
      }
    });
  }
}

// Initialize the prompt detector
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new PromptDetector();
  });
} else {
  new PromptDetector();
}

// Add visual indicator that extension is active
function addExtensionIndicator() {
  if (document.getElementById('prompt-saver-indicator')) return;
  
  const indicator = document.createElement('div');
  indicator.id = 'prompt-saver-indicator';
  indicator.innerHTML = '🤖';
  indicator.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 10000;
    background: rgba(102, 126, 234, 0.9);
    color: white;
    padding: 8px;
    border-radius: 50%;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  `;
  
  indicator.addEventListener('mouseenter', () => {
    indicator.style.transform = 'scale(1.1)';
  });
  
  indicator.addEventListener('mouseleave', () => {
    indicator.style.transform = 'scale(1)';
  });
  
  indicator.title = 'AI Prompt Saver - Click to open';
  indicator.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'openPopup' });
  });
  
  document.body.appendChild(indicator);
}

// Add indicator after a short delay
setTimeout(addExtensionIndicator, 1000);
