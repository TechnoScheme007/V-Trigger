# V-Trigger — Firefox Extension

> Take full control of your Facebook feed. Block posts containing any word you choose — instantly, silently, and persistently.

---

## Overview

**V-Trigger** is a Firefox extension that hides Facebook posts based on a keyword blocklist you define. It works in real time — posts are filtered as they load, including dynamically fetched content from infinite scroll. No page reload required after adding a word.

The extension runs entirely in your browser. No data is collected, no network requests are made, and nothing leaves your machine.

---

## Features

- **Keyword blocklist** — add as many words as you need
- **Two match modes:**
  - `Contains` — hides any post where the word appears anywhere (e.g. `cool` also blocks `coolest`)
  - `Exact` — hides posts only where the word appears as a standalone word
- **Real-time filtering** — new posts loaded by infinite scroll are caught and hidden automatically
- **Persistent storage** — your word list survives page refreshes and browser restarts
- **Live stats** — the popup shows how many words are active and how many posts are currently hidden
- **Clean, modern UI** — red and white design, fully keyboard accessible

---

## Screenshots

> Coming soon — the extension is currently in private testing.

---

## Installation (Developer / Temporary)

The extension is not yet listed on the Firefox Add-ons store. To use it now:

1. Clone or download this repository
   ```
   git clone https://github.com/TechnoScheme007/V-Trigger.git
   ```

2. Open Firefox and navigate to:
   ```
   about:debugging
   ```

3. Click **This Firefox** in the left sidebar

4. Click **Load Temporary Add-on…**

5. Open the project folder and select `manifest.json`

6. The V-Trigger icon will appear in your Firefox toolbar

> **Note:** Temporary add-ons are removed when Firefox is closed. Re-load via `about:debugging` each session until the extension is published to the store.

---

## Usage

1. Click the **V-Trigger** icon in your Firefox toolbar
2. Type a word into the input field and press **Enter** or click **+**
3. Open (or refresh) Facebook — all posts containing that word in their text will be hidden
4. Toggle between **Contains** and **Exact** match mode depending on how strict you want the filter to be
5. Remove individual words by clicking **×** on their chip, or wipe everything with **Clear All Words**

---

## Project Structure

```
v-trigger/
├── manifest.json       # Extension manifest (Firefox MV2)
├── popup.html          # Popup UI
├── popup.js            # Popup logic — word management, storage, stats
├── content.js          # Content script — post detection and filtering
├── icons/
│   ├── icon48.svg      # Toolbar icon (48px)
│   └── icon96.svg      # Toolbar icon (96px)
└── README.md
```

---

## How It Works

### Content Script (`content.js`)
Injected into every `facebook.com` page. On load it:
1. Reads the saved word list from `browser.storage.local`
2. Queries all `div[role="article"]` elements (Facebook's post container)
3. Hides any that contain a filtered word using `display: none`
4. Starts a `MutationObserver` to catch new posts added by infinite scroll
5. Listens for storage changes so the filter updates live when the popup is open

### Popup (`popup.js` + `popup.html`)
Communicates with the content script via `browser.runtime.sendMessage` to fetch the live hidden-post count. Saves state immediately on every change via `browser.storage.local`.

---

## Roadmap

- [ ] Publish to Firefox Add-ons (AMO)
- [ ] Per-word match type (instead of global toggle)
- [ ] Import / export word list
- [ ] Support for additional platforms
- [ ] Hide-count breakdown per word

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

*Built with vanilla JS, no dependencies, no build step required.*
