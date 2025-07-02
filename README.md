# Prompt Wisp - Chrome Extension

A Chrome extension for [Prompt Wisp](https://prompt-wisp.vercel.app/) to save and paste AI prompts across popular AI platforms like ChatGPT, Claude, Gemini, and DeepSeek.

## Installation Instructions

### Method 1: Install from Source (Developer Mode)

#### Step 1: Download the Extension
1. Download or clone this repository to your computer
2. Extract the files if downloaded as a ZIP
3. Make sure all files are in a single folder

#### Step 2: Enable Developer Mode in Chrome
1. Open Google Chrome
2. Type `chrome://extensions/` in the address bar and press Enter
3. In the top-right corner, toggle the **"Developer mode"** switch to ON
   - You'll see it turn blue when enabled
   - New options will appear: "Load unpacked", "Pack extension", "Update"

#### Step 3: Load the Extension
1. Click the **"Load unpacked"** button (appears after enabling Developer mode)
2. Browse to the folder containing your extension files
3. Select the folder and click **"Select Folder"** (or "Open" on some systems)
4. The extension should now appear in your extensions list

#### Step 4: Verify Installation
1. Look for "Prompt Wisp" in your extensions list
2. Make sure the toggle switch next to it is ON (blue)
3. You should see the Prompt Wisp icon in your Chrome toolbar
   - If you don't see it, click the puzzle piece icon (Extensions) in the toolbar
   - Find "Prompt Wisp" and click the pin icon to pin it to your toolbar

#### Step 5: Test the Extension
1. Visit one of the supported AI platforms:
   - ChatGPT: `https://chatgpt.com`
   - Claude: `https://claude.ai`
   - Gemini: `https://gemini.google.com`
   - DeepSeek: `https://chat.deepseek.com`
2. Click on the Prompt Wisp icon in your toolbar
3. The extension popup should open, allowing you to save and manage prompts

### Troubleshooting

#### Extension Not Loading
- **Error: "Manifest file is missing or unreadable"**
  - Make sure `manifest.json` is in the root folder
  - Check that the file isn't corrupted

- **Error: "This extension may have been corrupted"**
  - Re-download the extension files
  - Make sure all files are present: `manifest.json`, `background.js`, `content.js`, `popup.html`, `popup.js`, `styles.css`

#### Extension Not Working on AI Sites
- Make sure you're on a supported domain (listed above)
- Refresh the page after installing the extension
- Check that the extension is enabled in `chrome://extensions/`

#### Can't See Extension Icon
- Click the puzzle piece icon in Chrome's toolbar
- Find "Prompt Wisp" and click the pin icon
- The icon should now be visible in your toolbar

### Permissions Explained

This extension requires the following permissions:
- **Storage**: To save your prompts locally
- **Active Tab**: To interact with the current AI chat page
- **Scripting**: To inject functionality into supported websites
- **Clipboard Write**: To copy prompts to your clipboard

### Supported Platforms

- ✅ ChatGPT (`chatgpt.com`)
- ✅ Claude (`claude.ai`)
- ✅ Gemini (`gemini.google.com`)
- ✅ DeepSeek (`chat.deepseek.com`)

### Uninstalling

1. Go to `chrome://extensions/`
2. Find "Prompt Wisp"
3. Click the **"Remove"** button
4. Confirm the removal

---

**Note**: This extension runs in developer mode. Chrome may show warnings about developer mode extensions. This is normal for unpacked extensions.
