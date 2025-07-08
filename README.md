> 📖 🇪🇸 También disponible en español: [README.es.md](README.es.md)
# Prompt Wisp Browser Extension

![JavaScript](https://img.shields.io/badge/Language-JavaScript-f7df1e?logo=javascript&logoColor=white)
![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Available-4285f4?logo=googlechrome&logoColor=white)
![Manifest](https://img.shields.io/badge/Manifest-V3-green)
![Field](https://img.shields.io/badge/Field-Web%Extensions-white)
![License](https://img.shields.io/badge/License-MIT-brown)

Effortlessly access and manage your favorite AI prompts right from your browser. This Chrome extension connects with famous AI platforms, letting you save, organize, and use your ```prompt wisp``` library in just a few clicks-no more copy-pasting or losing track of your best ideas.

**[Install from Chrome Web Store](https://chromewebstore.google.com/detail/prompt-wisp/jfnnlgpcdjjfkhlngolanneflbgpekeo)** • **[Main Platform](https://prompt-wisp.vercel.app/)** • **[LinkedIn](https://www.linkedin.com/in/leonardocerv/)** • **[Contact](mailto:Leocerva29@gmail.com)**


## Overview
The Prompt Wisp Browser Extension makes it easy to use your favorite AI prompts anywhere. With just a click, you can save, organize, and send prompts from your ```prompt wisp``` library directly into popular AI chat platforms, no more copying and pasting. It works smoothly in your browser, helping you stay organized and get more done with less hassle.

## Key Features

### **Cross-Platform AI Integration**
- **Native support** for ChatGPT, Claude AI, Google Gemini, and DeepSeek
- **Intelligent input detection** that automatically identifies prompt input fields
- **Seamless prompt injection** with proper event handling and cursor positioning

### **Prompt Library Management**
- **Real-time synchronization** with your Prompt Wisp account
- **Local storage fallback** ensures functionality even when offline
- **Organized prompt collections** accessible through an intuitive popup interface
- **Quick search and filtering** to find the right prompt instantly

### **Secure Authentication**
- **OAuth integration** with the main Prompt Wisp platform
- **Secure session management** with automatic token refresh
- **Privacy-focused design** with minimal required permissions

### **Enhanced Productivity Features**
- **One-click prompt deployment** to any supported AI platform
- **Save current conversations** as new prompts for future use
- **Copy-to-clipboard fallback** for unsupported sites
- **Intelligent context preservation** maintains formatting and structure

## Supported AI Platforms

| Platform | Status | Integration Level |
|----------|--------|-------------------|
| **ChatGPT** | ✅ Full Support | Native textarea injection |
| **Claude AI** | ✅ Full Support | ProseMirror content handling |
| **Google Gemini** | ✅ Full Support | Rich text editor integration |
| **DeepSeek** | ✅ Full Support | Standard input field handling |
| **Other platforms** | 🔄 Fallback | Clipboard copy functionality |

## Technical Architecture

### Manifest V3 Compliance
Built using the latest Chrome extension standards with:
- **Service Worker background script** for efficient resource management
- **Content script injection** for seamless DOM manipulation
- **Secure host permissions** limited to essential AI platforms
- **Modern web APIs** including Clipboard API and Chrome Storage API

### Core Components

#### Background Service Worker (`background.js`)
- Handles authentication state management
- Manages API communication with Prompt Wisp platform
- Provides cross-tab synchronization of prompt data
- Implements secure storage and session management

#### Content Scripts (`content.js`)
- Platform-specific input field detection and manipulation
- Intelligent prompt injection with proper event triggering
- Fallback mechanisms for unsupported input types
- Real-time DOM monitoring for dynamic interfaces

#### Popup Interface (`popup.html`, `popup.js`)
- Clean, professional UI for prompt management
- Real-time search and filtering capabilities
- User authentication flow integration
- Responsive design optimized for extension popup constraints

### Security & Privacy
- **Minimal permissions** model following principle of least privilege
- **No data collection** beyond what's necessary for functionality
- **Secure API communication** with proper authentication headers
- **Local data encryption** for sensitive information

## Installation & Setup

### From Chrome Web Store (Recommended)
1. Visit the [Prompt Wisp Extension page](https://chromewebstore.google.com/detail/prompt-wisp/jfnnlgpcdjjfkhlngolanneflbgpekeo)
2. Click "Add to Chrome"
3. Confirm the installation and required permissions
4. Access the extension through the browser toolbar

### Manual Installation (Development)
1. **Clone the repository**
   ```bash
   git clone https://github.com/LeonardoCerv/prompt-wisp-web-extension.git
   cd prompt-wisp-web-extension
   ```

2. **Load as unpacked extension**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the cloned directory
   - The extension icon should appear in your browser toolbar

3. **Configure authentication**
   - Click the extension icon to open the popup
   - Sign in with your Prompt Wisp account
   - Grant necessary permissions for cross-platform integration

## Usage Guide

### Getting Started
1. **Authentication**: Click the extension icon and log in with your Prompt Wisp credentials
2. **Browse Prompts**: View your organized prompt library in the popup interface
3. **Deploy Prompts**: Navigate to any supported AI platform and click a prompt to inject it
4. **Save New Prompts**: Use the "Save Current" feature to add new prompts from your conversations

### Advanced Features
- **Quick Search**: Use the search bar in the popup to filter prompts by title or content
- **Collection Organization**: Browse prompts by collections for better organization
- **Offline Mode**: Access locally cached prompts even when disconnected
- **Keyboard Shortcuts**: Right-click context menu for additional prompt actions

## Development

### Prerequisites
- Chrome Browser (latest version)
- Basic understanding of Chrome Extension APIs
- Prompt Wisp account for testing

### Project Structure
```
prompt-wisp-web-extension/
├── manifest.json          # Extension manifest and permissions
├── background.js           # Service worker for API and state management
├── content.js             # Content script for AI platform integration
├── popup.html             # Extension popup interface
├── popup.js               # Popup functionality and UI logic
├── styles.css             # Extension styling
└── icons/                 # Extension icons and assets
```

### Key APIs and Technologies
- **Chrome Extensions API**: Core extension functionality
- **Chrome Storage API**: Local and sync storage management
- **Chrome Runtime API**: Message passing and lifecycle management
- **Clipboard API**: Fallback prompt copying functionality
- **DOM Manipulation**: Platform-specific input field handling

### Testing
- Test across all supported AI platforms (ChatGPT, Claude, Gemini, DeepSeek)
- Verify authentication flow with Prompt Wisp platform
- Validate offline functionality with cached prompts
- Check responsive design in various popup sizes

## Browser Compatibility

| Browser | Support Status | Notes |
|---------|---------------|-------|
| **Chrome** | ✅ Full Support | Primary target platform |
| **Edge** | ✅ Compatible | Chromium-based compatibility |
| **Brave** | ✅ Compatible | Chrome extension support |
| **Firefox** | 🔄 Planned | Manifest V2 version in development |
| **Safari** | ❌ Not Supported | Platform limitations |

## Contributing

We welcome contributions from the developer community! This extension is built to professional standards and we maintain high code quality expectations.

### Development Workflow
1. **Fork the repository** and create your feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Follow coding standards**
   - Use modern JavaScript (ES6+) conventions
   - Maintain Chrome Manifest V3 compliance
   - Implement proper error handling and fallbacks
   - Add comprehensive comments for complex logic

3. **Test thoroughly**
   - Verify functionality across all supported AI platforms
   - Test authentication flow integration
   - Validate offline/online state transitions
   - Check cross-browser compatibility where applicable

4. **Submit your contribution**
   ```bash
   git commit -m 'feat: add support for new AI platform'
   git push origin feature/your-feature-name
   ```
   Then open a Pull Request with a detailed description of your changes.

### Areas for Contribution
- **New AI Platform Support**: Add integration for additional AI chat platforms
- **Enhanced UI/UX**: Improve the popup interface and user experience
- **Performance Optimization**: Optimize content script injection and API calls
- **Accessibility**: Improve keyboard navigation and screen reader support
- **Security Enhancements**: Strengthen authentication and data handling

## Troubleshooting

### Common Issues

**Authentication Problems**
- Ensure you have a valid Prompt Wisp account
- Check that popup blockers aren't interfering with the auth flow
- Verify the extension has proper permissions enabled

**Prompt Injection Failures**
- Confirm the AI platform interface hasn't changed recently
- Check browser console for content script errors
- Try refreshing the AI platform page

**Sync Issues**
- Verify internet connectivity for cloud sync
- Check local storage isn't full or corrupted
- Re-authenticate if sync continues to fail

### Debug Mode
Enable Chrome Developer Tools to inspect extension behavior:
1. Right-click the extension icon → "Inspect popup"
2. Navigate to `chrome://extensions/` → Click "Inspect views: service worker"
3. Check browser console on AI platforms for content script logs

## Security & Privacy

### Data Handling
- **No personal data collection** beyond necessary authentication
- **Local storage encryption** for cached prompt data
- **Secure API communication** with proper token management
- **Minimal permissions** following Chrome's security best practices

### Permissions Explained
- `storage`: Required for local prompt caching and user preferences
- `activeTab`: Needed to inject prompts into AI platform input fields
- `clipboardWrite`: Fallback functionality for unsupported platforms
- `host_permissions`: Limited to specific AI platforms for security

## Roadmap

### Short-term Enhancements
- **Firefox compatibility** with Manifest V2 adaptation
- **Enhanced search** with fuzzy matching and tag filtering
- **Keyboard shortcuts** for power user efficiency
- **Prompt templates** with variable substitution

### Long-term Vision
- **Team collaboration** features for shared prompt libraries
- **Analytics integration** for prompt usage tracking
- **AI platform API integration** for enhanced functionality
- **Mobile browser support** for cross-device consistency

## Support & Community

- **Issues**: Report bugs and feature requests via [GitHub Issues](https://github.com/LeonardoCerv/prompt-wisp-web-extension/issues)
- **Discussions**: Join the conversation in [GitHub Discussions](https://github.com/LeonardoCerv/prompt-wisp-web-extension/discussions)