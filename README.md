<div align="center">
  <img src="icons/icon128.png" width="68" height="68" alt="Readmark logo" />
  <h1>Readmark</h1>
  <p>An ultra-lightweight, privacy-first, high-performance, and multilingual open-source Reading List extension for Chromium-based browsers (<em>Google Chrome, Microsoft Edge, Brave, Opera, Vivaldi, etc.</em>).</p>

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
    <a href="https://github.com/selimelmas/readmark"><img src="https://img.shields.io/badge/Languages-60%20Locales-orange.svg" alt="60 Languages"></a>
    <a href="https://github.com/selimelmas/readmark"><img src="https://img.shields.io/badge/Platform-Chromium-purple.svg" alt="Platform"></a>
  </p>
</div>

---

## Features & Highlights

| Feature | Description |
|---|---|
| **High-Performance Architecture** | Blazing-fast popup opening (`< 15ms`) with hardware-accelerated rendering, zero background bloat, and minimal memory footprint. |
| **Ergonomic 6-Item View** | Snug, pixel-perfect popup layout displaying 6 full items with tags and metadata without triggering unnecessary scrollbars. |
| **Clean Full-Width Divider Layout** | Minimalist edge-to-edge list rows separated by a crisp single divider line. |
| **Favicon Contrast & Drop-Shadow** | Intelligent drop-shadow and container badge ensuring white/transparent site icons (e.g., GitHub, Steam) remain clearly visible on light backgrounds. |
| **Crystal-Clear Legibility** | High-contrast typography in both Light and Dark themes, keeping read titles 100% readable without washed-out opacity or aggressive strike-throughs. |
| **Ergonomic 2×2 Action Grid** | Intuitive 2-row button cluster on each item card (*Read/Unread*, *Favorite*, *Open Tab*, *Delete*). |
| **Worldwide 60-Language Localization** | Fully localized in **60 languages** worldwide matching native regional spellings and scripts with real-time switching. |
| **Smart Estimated Reading Time** | Automatically analyzes article content length and displays clean `~X min` reading time badges. |
| **Drag & Drop Reordering** | Organize reading order by dragging and dropping items directly in the list. |
| **Tagging & Instant Filter** | Add `#tags` to any reading list item and filter by tag chips with a single click. |
| **Inline Title Editing** | Double-click any item's title to rename and save it instantly. |
| **Full-Tab Settings Page** | Clean and organized options dashboard with General, Backup, Statistics, and About panels. |
| **Theme Customization** | Supports **System Default** (`prefers-color-scheme`), **Light Mode**, and **Dark Mode** with live switching. |
| **Export & Backup** | Export your reading list as **JSON** (Full backup), **HTML** (Browser-compatible Netscape bookmarks), or **Markdown**. Import from JSON and HTML files. |
| **Configurable Badge Counter** | Toggle the unread items count badge on the extension toolbar icon on/off from settings. |
| **100% Local & Private** | All data is stored locally in your browser using `chrome.storage.local`. Zero tracking, zero telemetry, no external servers. |
| **Open Source & Licensed** | Distributed under the **GNU General Public License v3 (GPL-3.0)** with license viewer in the About tab. |

---

## Supported Languages (60 Locales)

Readmark is natively localized in 60 languages (ordered by worldwide speaker population):

> **English**, **English (United Kingdom)**, **中文（中国）**, **हिन्दी**, **español**, **العربية**, **français**, **বাংলা**, **português (Brasil)**, **русский**, **اردو**, **Indonesia**, **Deutsch**, **日本語**, **मराठी**, **తెలుగు**, **Türkçe**, **தமிழ்**, **Tiếng Việt**, **中文（台灣）**, **Filipino**, **한국어**, **فارسی**, **Kiswahili**, **italiano**, **ગુજરાતી**, **ไทย**, **ਪੰਜਾਬੀ**, **ಕನ್ನಡ**, **polski**, **മലയാളം**, **Melayu**, **українська**, **Nederlands**, **português (Portugal)**, **română**, **azərbaycan**, **සිංහල**, **Ελληνικά**, **magyar**, **čeština**, **svenska**, **עברית**, **български**, **српски**, **català**, **dansk**, **suomi**, **norsk**, **slovenčina**, **hrvatski**, **shqip**, **ქართული**, **հայերեն**, **lietuvių**, **slovenščina**, **македонски**, **latviešu**, **eesti**, **euskara**.

---

## Project Structure

```
readmark/
├── manifest.json            # Manifest V3 extension configuration
├── _locales/                # 60 Chrome Web Store & browser i18n locales
│   ├── en/messages.json    # English (Default)
│   ├── en_GB/messages.json # English (UK)
│   ├── de/messages.json    # German
│   ├── tr/messages.json    # Turkish
│   └── ... (60 locales)
├── background/
│   └── service_worker.js   # Background service worker (badge, context menus, shortcuts)
├── popup/
│   ├── popup.html          # High-performance popup layout
│   ├── popup.css           # Popup styles with theme tokens & layout optimizations
│   └── popup.js            # Reading list logic, search, filter, and tab capture
├── options/
│   ├── options.html        # Options, Statistics & About dashboard
│   ├── options.css         # Options styling with theme tokens
│   └── options.js          # Settings persistence, i18n, import/export, license
├── shared/
│   ├── storage.js          # Local storage engine, statistics & CRUD helpers
│   ├── utils.js            # URL validation & smart title derivation
│   ├── i18n.js             # Multilingual translation engine (60 languages)
│   ├── theme.js            # System / Light / Dark theme controller
│   ├── icons.js            # Minimal vector SVG icon set
│   ├── fonts.css           # Shared Literata font-face declarations
│   └── fonts/
│       ├── literata-latin.woff2       # Literata Latin subset
│       └── literata-latin-ext.woff2   # Literata Latin-ext subset
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

Get **Readmark** directly from the Chrome Web Store for any Chromium-based browser (*Chrome, Edge, Brave, Opera, Vivaldi*):

<p>
  <a href="https://chromewebstore.google.com/detail/readmark/cpinnkflldgoiepnogmabahaphfjmckc" target="_blank">
    <img src="https://img.shields.io/badge/Add_to_Chrome-Free-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Add to Chrome">
  </a>
</p>

---

### Developer Mode Installation (Local / Manual)

To run Readmark locally from source in developer mode:

1. Open the Extensions management page in your browser:
   - **Chrome / Brave:** `chrome://extensions`
   - **Microsoft Edge:** `edge://extensions`
   - **Opera:** `opera://extensions`
2. Enable **"Developer mode"** in the top right corner.
3. Click the **"Load unpacked"** button in the top left corner.
4. Select the project directory (`readmark`).
5. Readmark will be installed immediately. Pin it to your toolbar for quick access.

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
| **`f`** / **`s`** | Add to / Remove from Favorites |
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

Contributions, translations, and feature suggestions are warmly welcome!
