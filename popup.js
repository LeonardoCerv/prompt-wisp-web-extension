class PromptWispExtension {
  constructor() {
    // Replace with your actual Prompt Wisp domain
    this.apiBase = 'https://prompt-wisp.vercel.app/'; // Example for local development
    this.user = null;
    this.init();
  }

  async init() {
    await this.checkAuthStatus();
    this.setupEventListeners();
    this.hideLoading();
  }

  async checkAuthStatus() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({
        action: 'checkAuth'
      }, (response) => {
        try {
          if (response && response.success && response.authenticated && response.user) {
            this.user = response.user;
            this.showUserSection();
            this.loadPrompts();
          } else {
            this.showAuthSection();
          }
          resolve();
        } catch (error) {
          console.error('Auth check failed:', error);
          this.showError('Failed to connect to Prompt Wisp. Please check your connection.');
          this.showAuthSection();
          resolve();
        }
      });
    });
  }

  async authenticate() {
    return new Promise((resolve, reject) => {
      const authUrl = `${this.apiBase}/login?extension=true`;
      
      chrome.windows.create({
        url: authUrl,
        type: 'popup',
        width: 500,
        height: 700
      }, (window) => {
        if (chrome.runtime.lastError) {
          reject(new Error('Failed to open authentication window'));
          return;
        }

        const checkAuth = async () => {
          chrome.runtime.sendMessage({
            action: 'checkAuth'
          }, (response) => {
            if (response && response.success && response.authenticated && response.user) {
              chrome.windows.remove(window.id);
              this.user = response.user;
              this.showUserSection();
              this.loadPrompts();
              this.showSuccess('Successfully connected to Prompt Wisp!');
              resolve(response.user);
            } else {
              // Check if window still exists
              chrome.windows.get(window.id, (w) => {
                if (chrome.runtime.lastError) {
                  // Window was closed
                  reject(new Error('Authentication cancelled'));
                }
              });
            }
          });
        };

        // Poll every 2 seconds
        const pollInterval = setInterval(checkAuth, 2000);
        
        // Clean up when window is closed
        chrome.windows.onRemoved.addListener((windowId) => {
          if (windowId === window.id) {
            clearInterval(pollInterval);
            reject(new Error('Authentication cancelled'));
          }
        });
      });
    });
  }

  async loadPrompts() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({
        action: 'getPromptsFromAPI'
      }, (response) => {
        try {
          if (response && response.success) {
            console.log('Loaded prompts:', response.prompts);
            const isLocal = response.source === 'local';
            this.displayPrompts(response.prompts, isLocal);
            if (isLocal && response.error) {
              this.showError('Failed to load prompts from server. Using local prompts.');
            }
          } else {
            console.error('Failed to load prompts:', response?.error);
            this.showError('Failed to load prompts from server. Using local prompts.');
            this.loadLocalPrompts();
          }
          resolve();
        } catch (error) {
          console.error('Failed to load prompts:', error);
          this.showError('Failed to load prompts from server. Using local prompts.');
          this.loadLocalPrompts();
          resolve();
        }
      });
    });
  }

  async loadLocalPrompts() {
    // Fallback to local storage if API fails
    const { prompts = [] } = await chrome.storage.local.get('prompts');
    this.displayPrompts(prompts, true);
  }

  displayPrompts(prompts, isLocal = false) {
    const container = document.getElementById('prompts-list');
    
    if (!prompts || prompts.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>No prompts found</p>
          ${isLocal ? '<p style="font-size: 12px; color: #ef4444;">Showing local prompts only</p>' : ''}
        </div>
      `;
      return;
    }

    container.innerHTML = prompts.map(prompt => `
      <div class="prompt-item" onclick="window.promptWisp.usePrompt( '${this.escapeHtml(prompt.content || prompt.text || "")}')">
        <div class="prompt-title">${this.escapeHtml(prompt.title || 'Untitled Prompt')}</div>
        <div class="prompt-preview">${this.escapeHtml((prompt.content || prompt.text || '').substring(0, 100))}${(prompt.content || prompt.text || '').length > 100 ? '...' : ''}</div>
      </div>
    `).join('');
    
    if (isLocal) {
      container.insertAdjacentHTML('afterbegin', '<p style="font-size: 12px; color: #ef4444; margin-bottom: 10px;">Showing local prompts only</p>');
    }
  }

  async usePrompt(content) {
    try {
      
      // Send to content script
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) {
        this.showError('No active tab found');
        return;
      }
      
      chrome.tabs.sendMessage(tab.id, {
        action: 'insertPrompt',
        content: content
      }, (response) => {
        if (chrome.runtime.lastError) {
          this.showError('Failed to insert prompt. Try copying manually.');
        } else if (response && response.success) {
          this.showSuccess('Prompt inserted successfully!');
        } else {
          this.showError('Prompt copied to clipboard as fallback');
        }
      });
      
      // Close popup after a short delay
      setTimeout(() => window.close(), 1500);
    } catch (error) {
      console.error('Failed to use prompt:', error);
      this.showError('Failed to use prompt');
    }
  }

  async savePrompt(content, title) {
    if (!content || !content.trim()) {
      this.showError('No content to save');
      return;
    }

    return new Promise((resolve) => {
      chrome.runtime.sendMessage({
        action: 'savePromptToAPI',
        content: content,
        title: title || 'Untitled Prompt',
        site: 'extension-popup'
      }, (response) => {
        try {
          if (response && response.success) {
            if (response.location === 'server') {
              this.showSuccess('Prompt saved to server!');
            } else {
              this.showSuccess('Prompt saved locally!');
            }
            this.loadPrompts(); // Refresh the list
          } else {
            console.error('Failed to save prompt:', response?.error);
            this.showError('Failed to save prompt');
          }
          resolve();
        } catch (error) {
          console.error('Failed to save prompt:', error);
          this.showError('Failed to save prompt');
          resolve();
        }
      });
    });
  }

  logout() {
    this.user = null;
    this.showAuthSection();
    // Clear any stored auth data
    chrome.storage.local.clear();
    this.showSuccess('Logged out successfully');
  }

  setupEventListeners() {
    document.getElementById('login-btn').addEventListener('click', async () => {
      try {
        this.showLoading();
        await this.authenticate();
      } catch (error) {
        console.error('Authentication failed:', error);
        this.showError('Authentication failed. Please try again.');
        this.hideLoading();
      }
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
      this.logout();
    });

    document.getElementById('refresh-prompts').addEventListener('click', async () => {
      this.showLoading();
      await this.loadPrompts();
      this.hideLoading();
    });
  }

  showAuthSection() {
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('user-section').style.display = 'none';
  }

  showUserSection() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('user-section').style.display = 'block';
    document.getElementById('user-email').textContent = this.user.email || 'Unknown user';
  }

  showLoading() {
    document.getElementById('loading').style.display = 'block';
  }

  hideLoading() {
    document.getElementById('loading').style.display = 'none';
  }

  showError(message) {
    const errorEl = document.getElementById('error-message');
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    document.getElementById('success-message').style.display = 'none';
    
    setTimeout(() => {
      errorEl.style.display = 'none';
    }, 5000);
  }

  showSuccess(message) {
    const successEl = document.getElementById('success-message');
    successEl.textContent = message;
    successEl.style.display = 'block';
    document.getElementById('error-message').style.display = 'none';
    
    setTimeout(() => {
      successEl.style.display = 'none';
    }, 3000);
  }

  escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.promptWisp = new PromptWispExtension();
});