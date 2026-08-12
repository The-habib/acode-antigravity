<div align="center">

# 🚀 Acode Antigravity — Full Native App Control Engine

**Full-Featured Native Google Antigravity AI Engine for Acode Editor on Android**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg?style=for-the-badge)](https://github.com/The-habib/acode-antigravity)
[![Acode Version](https://img.shields.io/badge/Acode-v1.9.0%2B-blue.svg?style=for-the-badge)](https://acode.app)
[![Architecture](https://img.shields.io/badge/Architecture-ARM64%2Faarch64-orange.svg?style=for-the-badge)](https://alpinelinux.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![GitHub Release](https://img.shields.io/github/v/release/The-habib/acode-antigravity?style=for-the-badge)](https://github.com/The-habib/acode-antigravity/releases)

<p align="center">
  <b>Google Antigravity now takes FULL NATIVE CONTROL of the entire Acode Editor app—featuring a Sidebar Control Panel, Context Menu Actions, Direct Editor Selection Manipulation, and Interactive TUI Terminal!</b>
</p>

[Quick Install](#-installation) • [Key Features](#-key-features) • [Native Control Features](#-native-app-control-capabilities) • [Usage](#-usage) • [Architecture](#-architecture)

---

</div>

## 🌟 Overview

**Acode Antigravity** transforms Google Antigravity from a simple terminal tool into a **native AI engine driving the entire Acode app**. 

Instead of remaining confined to a command line tab, Antigravity now connects directly to Acode's **Sidebar App API (`sideBarApps`)**, **Editor Context Menu API (`contextMenu`)**, **Editor Selection Manager (`editorManager`)**, and **Commands API**.

---

## ✨ Native App Control Capabilities

- 🎨 **Sidebar Control Center**: A dedicated Google Antigravity GUI panel right inside Acode's sidebar (`sideBarApps`) with instant prompt submission, agent progress, and 1-click code application buttons.
- ⚡ **Direct Editor Control (`editorManager`)**:
  - `Replace Selection`: Replace highlighted code directly in editor tabs.
  - `Insert at Cursor`: Insert AI-generated code snippets at cursor position.
  - `Replace Entire File`: Overwrite active document with refactored code.
  - `Open Workspace File`: Open generated files in new Acode tabs.
- 🛠️ **Editor Context Menu Integration**: Highlight code → Right click → Choose:
  - ⚡ *Google Antigravity: Refactor Code*
  - 🐛 *Google Antigravity: Fix Code Bugs*
  - 📝 *Google Antigravity: Explain Code*
  - 🧪 *Google Antigravity: Generate Unit Tests*
- ⌨️ **Keyboard Shortcut (`Ctrl+Alt+A`)**: Instant 1-key toggle to open the Antigravity Control Center.
- 📺 **Interactive TUI Terminal**: Full terminal experience powered by Acode's native xterm.js server (`acode.require('terminal')`).

---

## 📦 Installation

### Option 1: 1-Click Remote Installation in Acode (Recommended)

1. Open **Acode** on your Android device.
2. Navigate to **Settings** → **Plugins** → **`+`** → **Remote**.
3. Paste the official release URL:
   ```
   https://github.com/The-habib/acode-antigravity/releases/download/v1.0.0/acode-antigravity.zip
   ```
4. Tap **Install** and enjoy!

---

## 🎮 Usage

### 1. Sidebar Control Panel
Click the **🚀 Google Antigravity** icon in Acode's left sidebar (or press `Ctrl+Alt+A`) to open the native AI Control Panel.

### 2. Editor Context Menu
Highlight any block of code in Acode editor, right-click, and select any Antigravity action!

### 3. Terminal Command Line
Open Acode Terminal tab and run:

```sh
agy
```

---

## 🏗️ Architecture

```
 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │                            ACODE EDITOR MAIN DOM                                 │
 ├───────────────────┬───────────────────┬───────────────────┬──────────────────────┤
 │ 🎨 Sidebar Panel  │ 🛠️ Context Menu   │ ⚡ Editor Manager │ 📺 Terminal xterm.js │
 │ (sideBarApps)     │ (contextMenu)     │ (editorManager)   │ (acode.terminal)     │
 └─────────┬─────────┴─────────┬─────────┴─────────┬─────────┴──────────┬───────────┘
           │                   │                   │                    │
           └───────────────────┴─────────┬─────────┴────────────────────┘
                                         ▼
 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │                    Antigravity Agent Native Bridge Service                       │
 ├──────────────────────────────────────────────────────────────────────────────────┤
 │                glibc ld-linux-aarch64 ──► Google Antigravity Engine              │
 └──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📄 License & Attribution

- **Plugin License**: [MIT License](LICENSE)
- **Developer & Maintainer**: Habib ([@The-habib](https://github.com/The-habib))
- **Core Platform**: [Google Antigravity](https://antigravity.google) (Google DeepMind)
