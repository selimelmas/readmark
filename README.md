<div align="center">
  <img src="icons/icon128.png" width="68" height="68" alt="readmark logo" />
  <h1>readmark</h1>
  <p>An ultra-lightweight, privacy-first, modern, and multilingual open-source Reading List extension for Chromium-based browsers (<em>Google Chrome, Microsoft Edge, Brave, Opera, Vivaldi, etc.</em>).</p>

  <p>
    <a href="https://chromewebstore.google.com/detail/readmark/cpinnkflldgoiepnogmabahaphfjmckc" target="_blank">
      <img src="https://img.shields.io/badge/Chrome_Web_Store-Available_Now-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Available in the Chrome Web Store">
    </a>
  </p>

  <p>
    <a href="manifest.json"><img src="https://img.shields.io/badge/version-v1.2.0-blue?style=flat-square" alt="Version: v1.2.0"></a>
    <a href="https://chromewebstore.google.com/detail/readmark/cpinnkflldgoiepnogmabahaphfjmckc" target="_blank"><img src="https://img.shields.io/badge/Chrome_Web_Store-Available-4285F4?logo=googlechrome&logoColor=white" alt="Chrome Web Store"></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-GPLv3-blue.svg" alt="License: GNU GPLv3"></a>
    <a href="manifest.json"><img src="https://img.shields.io/badge/Manifest-V3-success.svg" alt="Manifest V3"></a>
    <a href="https://github.com/selimelmas/readmark"><img src="https://img.shields.io/badge/Platform-Chromium-purple.svg" alt="Platform"></a>
  </p>
</div>

---

## Features & Highlights

| Feature | Description |
|---|---|
| **Popup-Only Architecture** | Opens instantly on toolbar icon click with zero background bloat. |
| **Full-Tab Settings Page** | Clean and organized options dashboard opened in a comfortable new tab. |
| **Theme Customization** | Supports **System Default** (`prefers-color-scheme`), **Light Mode**, and **Dark Mode** with live switching. |
| **Smart Date Groups & Sorting** | Automatically groups reading list by *Today*, *This Week*, and *Earlier*. Sort by *Newest*, *Oldest*, or *A–Z*. |
| **Drag & Drop Reordering** | Organize reading order by dragging and dropping items directly in the list. |
| **Tagging & Tag Filtering** | Add `#tags` to any reading list item and click tags to filter instantly. |
| **Inline Title Editing** | Double-click any item's title to rename and save it instantly. |
| **Mark All as Read** | One-click button in the footer to batch-mark all unread items as completed. |
| **Ultra-Minimal Design** | Modern typography, clean spacing, glassmorphic accents, and smooth micro-animations. |
| **Export & Backup** | Export your reading list as **JSON** (Full backup), **HTML** (Browser-compatible Netscape bookmarks), or **Markdown**. Import from JSON and HTML files. |
| **Multilingual Support** | Fully localized in **20 languages**: English, Turkish, German, French, Spanish, Italian, Portuguese (BR), Russian, Chinese (Simp/Trad), Japanese, Korean, Arabic, Hindi, Dutch, Polish, Ukrainian, Swedish, Indonesian, Vietnamese. |
| **Estimated Reading Time** | Automatically analyzes article content length and displays clean `~X min` reading time badges. |
| **Compact & Button-First UI** | Comfortable view showing 5+ items with custom sleek scrolling and intuitive SVG action buttons (*Read/Unread, Favorite, Open, Delete*). |
| **Configurable Badge Counter** | Toggle the unread items count badge on the extension toolbar icon on/off from settings. |
| **100% Local & Private** | All data is stored locally in your browser using `chrome.storage.local`. Zero tracking, zero telemetry, no external servers. |
| **Open Source & Licensed** | Distributed under the **GNU General Public License v3 (GPL-3.0)** with license viewer in the About tab. |

---

## Project Structure

```
readmark/
├── manifest.json            # Manifest V3 extension configuration
├── _locales/                # 20 Chrome Web Store & browser i18n locales
│   ├── en/messages.json    # English (Default)
│   ├── tr/messages.json    # Turkish
│   ├── de/messages.json    # German
│   ├── fr/messages.json    # French
│   ├── es/messages.json    # Spanish
│   ├── it/messages.json    # Italian
│   ├── pt_BR/messages.json # Portuguese (Brazil)
│   ├── ru/messages.json    # Russian
│   ├── zh_CN/messages.json # Simplified Chinese
│   ├── zh_TW/messages.json # Traditional Chinese
│   ├── ja/messages.json    # Japanese
│   ├── ko/messages.json    # Korean
│   ├── ar/messages.json    # Arabic
│   ├── hi/messages.json    # Hindi
│   ├── nl/messages.json    # Dutch
│   ├── pl/messages.json    # Polish
│   ├── uk/messages.json    # Ukrainian
│   ├── sv/messages.json    # Swedish
│   ├── id/messages.json    # Indonesian
│   └── vi/messages.json    # Vietnamese
├── popup/
│   ├── popup.html          # Minimal popup layout
│   ├── popup.css           # Popup styles with theme tokens
│   └── popup.js            # Reading list logic, search, filter, and tab capture
├── options/
│   ├── options.html        # Options & About dashboard in a new tab
│   ├── options.css         # Options styling (compact & responsive)
│   └── options.js          # Settings persistence, i18n, import/export, license
├── shared/
│   ├── storage.js          # Local storage engine & CRUD helpers
│   ├── utils.js            # URL validation & smart title derivation
│   ├── i18n.js             # Multilingual translation engine (20 languages)
│   ├── theme.js            # System / Light / Dark theme controller
│   ├── icons.js            # Minimal vector SVG icon set
│   ├── fonts.css           # Shared Literata font-face declarations
│   └── fonts/
│       ├── literata-latin.woff2       # Literata Latin subset
│       └── literata-latin-ext.woff2   # Literata Latin-ext subset (Turkish chars)
├── icons/
│   ├── icon16.png          # 16x16 icon
│   ├── icon32.png          # 32x32 icon
│   ├── icon48.png          # 48x48 icon
│   ├── icon128.png         # 128x128 store & dashboard icon
│   └── icon.svg            # Source vector icon
├── LICENSE                 # GNU General Public License v3 (GPLv3)
├── .gitignore              # Git ignore rules
└── README.md               # Project documentation
```

---

## Installation

### Install from Chrome Web Store (Recommended)

Get **readmark** directly from the Chrome Web Store for any Chromium-based browser (*Chrome, Edge, Brave, Opera, Vivaldi*):

<p>
  <a href="https://chromewebstore.google.com/detail/readmark/cpinnkflldgoiepnogmabahaphfjmckc" target="_blank">
    <img src="https://img.shields.io/badge/Add_to_Chrome-Free-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Add to Chrome">
  </a>
</p>

---

### Developer Mode Installation (Local / Manual)

To run readmark locally from source in developer mode:

1. Open the Extensions management page in your browser:
   - **Chrome / Brave:** `chrome://extensions`
   - **Microsoft Edge:** `edge://extensions`
   - **Opera:** `opera://extensions`
2. Enable **"Developer mode"** in the top right corner.
3. Click the **"Load unpacked"** button in the top left corner.
4. Select the project directory (`readmark`).
5. readmark will be installed immediately. Pin it to your toolbar for quick access.

---

## Keyboard Shortcuts

### Global Browser Shortcut
- **`Alt + Shift + R`**: Instantly add the current active tab to your reading list. *(Customizable at `chrome://extensions/shortcuts`)*.

### In-Popup Keyboard Navigation
| Shortcut | Action |
|---|---|
| **`↓` / `j`** or **`↑` / `k`** | Navigate between reading list items |
| **`Enter`** | Open focused item in browser |
| **`Space`** | Toggle Read / Unread status |
| **`f`** / **`s`** | Add to / Remove from Favorites (❤️) |
| **`Delete` / `Backspace`** | Delete focused item |
| **`/`** or **`Ctrl+F`** | Focus and open search bar |
| **`1`, `2`, `3`, `4`** | Switch filter tabs (*All, Unread, Read, Favorites*) |
| **`Escape`** | Close search bar or dismiss confirmation modal |

---

## License & Open Source

This project is licensed under the [GNU General Public License v3.0 (GNU GPLv3)](LICENSE).

```
Copyright (C) 2026 Readmark Open Source Contributors

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
```

Contributions, feature suggestions, and pull requests are warmly welcome!
