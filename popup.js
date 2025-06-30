// Professional AI Prompt Saver - Popup Script

class PromptManager {
  constructor() {
    this.init();
  }

  async init() {
    await this.loadPrompts();
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.getElementById('savePrompt').addEventListener('click', () => {
      this.saveCurrentPrompt();
    });

    document.getElementById('clearAll').addEventListener('click', () => {
      this.clearAllPrompts();
    });

    document.getElementById('exportPrompts').addEventListener('click', () => {
      this.exportPrompts();
    });
  }

  async saveCurrentPrompt() {
    const saveBtn = document.getElementById('savePrompt');
    const originalContent = saveBtn.innerHTML;
    
    try {
      // Show loading state
      saveBtn.innerHTML = `
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
        Saving...
      `;
      saveBtn.disabled = true;
      saveBtn.classList.add('loading');

      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab) {
        this.showStatus('No active tab found', 'error');
        return;
      }

      // Check if this is a supported site
      const supportedSites = [
        'chat.deepseek.com',
        'chatgpt.com',
        'gemini.google.com',
        'claude.ai',
        'grok.com',
        'meta.ai',
        'copilot.microsoft.com'
      ];

      const isSupported = supportedSites.some(site => tab.url.includes(site));

      if (!isSupported) {
        this.showStatus('This site is not supported yet', 'error');
        return;
      }

      // Inject content script and get current prompt
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'getCurrentPrompt'
      });

      if (!response || !response.prompt) {
        this.showStatus('No prompt found on current page', 'error');
        return;
      }

      await this.savePrompt(response.prompt, response.site, response.url);
      this.showStatus('Prompt saved successfully!', 'success');

    } catch (error) {
      console.error('Error saving prompt:', error);
      this.showStatus('Failed to save prompt', 'error');
    } finally {
      // Restore button state
      saveBtn.innerHTML = originalContent;
      saveBtn.disabled = false;
      saveBtn.classList.remove('loading');
    }
  }

  async savePrompt(text, site, url) {
    try {
      const result = await chrome.storage.local.get(['prompts']);
      const prompts = result.prompts || [];

      const newPrompt = {
        id: Date.now(),
        text: text,
        site: site,
        url: url,
        timestamp: new Date().toISOString(),
        autoSaved: false
      };

      prompts.unshift(newPrompt);

      // Keep only last 200 prompts
      if (prompts.length > 200) {
        prompts.splice(200);
      }

      await chrome.storage.local.set({ prompts });
      await this.loadPrompts();

    } catch (error) {
      console.error('Error saving prompt to storage:', error);
      throw error;
    }
  }

  async loadPrompts() {
    try {
      const result = await chrome.storage.local.get(['prompts']);
      const prompts = result.prompts || [];

      this.renderPrompts(prompts);

    } catch (error) {
      console.error('Error loading prompts:', error);
    }
  }

  renderPrompts(prompts) {
    const container = document.getElementById('promptsList');

    if (prompts.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
          </svg>
          <div class="empty-state-text">No prompts saved yet</div>
          <div class="empty-state-subtext">Click "Save Current Prompt" to get started</div>
        </div>
      `;
      return;
    }

    container.innerHTML = prompts.map(prompt => {
      const date = new Date(prompt.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      const time = new Date(prompt.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });

      const truncatedText = prompt.text.length > 120
          ? prompt.text.substring(0, 120) + '...'
          : prompt.text;

      const siteIcon = this.getSiteIcon(prompt.site);

      return `
        <div class="prompt-item" data-prompt-id="${prompt.id}" tabindex="0">
          <div class="prompt-meta">
            <div class="prompt-site">
              ${siteIcon}
              ${prompt.site}
              ${prompt.autoSaved ? '<span class="auto-saved-badge">Auto</span>' : ''}
            </div>
            <div class="prompt-date">${date} ${time}</div>
          </div>
          <div class="prompt-text">${this.escapeHtml(truncatedText)}</div>
        </div>
      `;
    }).join('');

    // Add click and keyboard listeners to prompt items
    container.querySelectorAll('.prompt-item').forEach(item => {
      const clickHandler = () => {
        const promptId = parseInt(item.dataset.promptId);
        this.showPromptDetails(promptId, prompts);
      };

      item.addEventListener('click', clickHandler);
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          clickHandler();
        }
      });
    });
  }

  getSiteIcon(site) {
    const icons = {
      'chatgpt.com': '🤖',
      'claude.ai': '🧠',
      'gemini.google.com': '✨',
      'copilot.microsoft.com': '🚀',
      'chat.deepseek.com': '🔮',
      'grok.com': '⚡',
      'meta.ai': '🌐'
    };
    
    for (const [domain, icon] of Object.entries(icons)) {
      if (site.includes(domain)) return icon;
    }
    return '💬';
  }

  showPromptDetails(promptId, prompts) {
    const prompt = prompts.find(p => p.id === promptId);
    if (!prompt) return;

    // Create modal overlay using CSS classes
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    const date = new Date(prompt.timestamp).toLocaleString();

    modalContent.innerHTML = `
      <div class="modal-header">
        <div class="modal-title">${this.getSiteIcon(prompt.site)} ${prompt.site}</div>
        <button id="closeModal" class="modal-close" title="Close">
          <img class="icon" src="icons/circle-x.svg" alt="Close Icon" />
        </button>
      </div>
      <div class="prompt-date" style="margin-bottom: var(--space-md); color: var(--muted-foreground); font-size: 13px;">${date}</div>
      <div class="modal-text">${this.escapeHtml(prompt.text)}</div>
      <div class="btn-group">
        <button id="copyPrompt" class="btn btn-primary btn-full">
          <img class="icon" src="icons/copy.svg" alt="Copy Icon" />
          Copy
        </button>
        <button id="deletePrompt" class="btn btn-destructive btn-full">
          <img class="icon" src="icons/trash.svg" alt="Delete Icon" />
          Delete
        </button>
      </div>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Event listeners
    document.getElementById('closeModal').addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    document.getElementById('copyPrompt').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(prompt.text);
        this.showStatus('Copied to clipboard!', 'success');
        document.body.removeChild(modal);
      } catch (error) {
        this.showStatus('Copy failed', 'error');
      }
    });

    document.getElementById('deletePrompt').addEventListener('click', async () => {
      await this.deletePrompt(promptId);
      document.body.removeChild(modal);
      this.showStatus('Prompt deleted', 'success');
    });

    // Close modal when clicking overlay
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });

    // Close modal with Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        document.body.removeChild(modal);
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }

  async deletePrompt(promptId) {
    try {
      const result = await chrome.storage.local.get(['prompts']);
      const prompts = result.prompts || [];

      const filteredPrompts = prompts.filter(p => p.id !== promptId);

      await chrome.storage.local.set({ prompts: filteredPrompts });
      await this.loadPrompts();

    } catch (error) {
      console.error('Error deleting prompt:', error);
    }
  }

  async clearAllPrompts() {
    if (!confirm('Are you sure you want to delete all saved prompts?')) {
      return;
    }

    try {
      await chrome.storage.local.set({ prompts: [] });
      await this.loadPrompts();
      this.showStatus('All prompts cleared', 'success');

    } catch (error) {
      console.error('Error clearing prompts:', error);
      this.showStatus('Failed to clear prompts', 'error');
    }
  }

  async exportPrompts() {
    try {
      const result = await chrome.storage.local.get(['prompts']);
      const prompts = result.prompts || [];

      if (prompts.length === 0) {
        this.showStatus('No prompts to export', 'error');
        return;
      }

      const exportData = {
        exportDate: new Date().toISOString(),
        promptCount: prompts.length,
        prompts: prompts
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-prompts-${new Date().toISOString().split('T')[0]}.json`;
      a.click();

      URL.revokeObjectURL(url);
      this.showStatus('Prompts exported successfully!', 'success');

    } catch (error) {
      console.error('Export failed:', error);
      this.showStatus('Export failed', 'error');
    }
  }

  showStatus(message, type) {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;
    statusEl.classList.remove('hidden');
    setTimeout(() => {
      statusEl.classList.add('hidden');
    }, 3000);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PromptManager();
});