<div align="center">

# 🚀 Acode Antigravity

**Production-grade Google Antigravity CLI Integration for Acode on Android**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg?style=for-the-badge)](https://github.com/The-habib/acode-antigravity)
[![Acode Version](https://img.shields.io/badge/Acode-v1.9.0%2B-blue.svg?style=for-the-badge)](https://acode.app)
[![Architecture](https://img.shields.io/badge/Architecture-ARM64%2Faarch64-orange.svg?style=for-the-badge)](https://alpinelinux.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![GitHub Release](https://img.shields.io/github/v/release/The-habib/acode-antigravity?style=for-the-badge)](https://github.com/The-habib/acode-antigravity/releases)

<p align="center">
  <b>Run Google's flagship Agentic AI coding platform directly inside Acode's native terminal environment with zero desktop setup.</b>
</p>

[Quick Install](#-installation) • [Key Features](#-key-features) • [Usage](#-usage) • [Command Reference](#-command-palette-commands) • [Architecture](#-architecture--compatibility-engine) • [Troubleshooting](#-troubleshooting--diagnostics)

---

</div>

## 🌟 Overview

**Acode Antigravity** bridges the official **Google Antigravity CLI (`agy`)** and **Acode Editor** on Android. It bundles a high-performance native ARM64 glibc compatibility layer allowing the real, un-emulated `antigravity` binary to run inside Acode's xterm.js terminal with full interactive TUI, ANSI colors, keyboard controls, and active workspace binding.

---

## ✨ Key Features

- ⚡ **Native Execution**: Runs the authentic Google Antigravity binary (`1.1.12`) directly on Android ARM64—no PRoot, Docker, SSH, or cloud servers.
- 📺 **Interactive TUI**: Full interactive terminal user interface powered by Acode's native xterm.js Terminal API (`acode.require('terminal')`).
- 📂 **Workspace Binding**: Automatically opens Antigravity bound to your active project workspace directory.
- ⌨️ **Keyboard Shortcuts**: Launch Antigravity instantly using `Ctrl+Alt+A` (`Cmd+Alt+A` on macOS).
- 🛠️ **Built-in Self-Healing**: Includes automated diagnostic (`agy-check`), repair (`agy-repair`), and update (`agy-update`) commands.
- 📌 **Persistent PATH Hooks**: Automatically configures `$HOME/.local/bin` in `~/.bashrc`, `~/.profile`, and `~/.zshrc`.

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

### 1. Terminal Command Line
Open Acode Terminal tab and run:

```sh
agy
```

If initializing for the first time, `agy` will automatically set binary permissions and launch the interactive agent session.

### 2. Acode Command Palette (`Ctrl+Shift+P`)
Search for **`Antigravity`** to access all integrated actions:

| Command | Shortcut | Description |
| :--- | :--- | :--- |
| **`Antigravity: Launch`** | `Ctrl+Alt+A` | Launches `agy` in an interactive Acode Terminal tab |
| **`Antigravity: Setup`** | — | Runs initial binary setup & PATH configuration |
| **`Antigravity: Check Installation`** | — | Displays environment diagnostic status |
| **`Antigravity: Repair`** | — | Repairs broken binary linkages or file permissions |
| **`Antigravity: Update`** | — | Checks for and installs latest Antigravity CLI updates |
| **`Antigravity: Show Environment`** | — | Opens interactive status and settings dialog |

---

## ⚙️ Command Line Tooling Included

The plugin installs 5 helper utilities into `$HOME/.local/bin`:

| Utility | Description |
| :--- | :--- |
| `agy` | Primary launcher for Google Antigravity CLI |
| `agy-setup` | Configures glibc dynamic loader paths & file modes |
| `agy-check` | Performs deep environment diagnostic tests |
| `agy-repair` | Self-healing script for permission or loader recovery |
| `agy-update` | Manages atomic binary updates |

---

## 🏗️ Architecture & Compatibility Engine

```
 ┌───────────────────────────────────────────────────────────┐
 │                   Acode Android Editor                    │
 ├─────────────────────────────┬─────────────────────────────┤
 │    Acode Terminal API       │   Commands & Status Dialog  │
 └──────────────┬──────────────┴──────────────┬──────────────┘
                │                             │
                ▼                             ▼
 ┌───────────────────────────────────────────────────────────┐
 │                 Alpine Linux Container                    │
 ├───────────────────────────────────────────────────────────┤
 │  $HOME/.local/bin/agy  ──►  glibc ld-linux-aarch64 loader │
 │                                     │                     │
 │                                     ▼                     │
 │                        Native Antigravity Binary          │
 └───────────────────────────────────────────────────────────┘
```

| Component | Technical Detail |
| :--- | :--- |
| **Target Architecture** | ARM64 (`aarch64`) |
| **Runtime Loader** | `ld-linux-aarch64.so.1` (glibc compatibility bundle) |
| **Terminal Integration** | `acode.require('terminal')` -> `createServer()` |
| **Manifest Spec** | Acode Plugin Standard v2 (minVersionCode: `292`) |

---

## 🔍 Troubleshooting & Diagnostics

If `agy` ever fails to execute, run the diagnostic suite in terminal:

```sh
agy-check
```

To automatically repair file permissions and loader links, run:

```sh
agy-repair
```

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests on our [GitHub Repository](https://github.com/The-habib/acode-antigravity).

```sh
# Clone project
git clone https://github.com/The-habib/acode-antigravity.git
cd acode-antigravity

# Install dependencies & build
npm install
npm run build
npm run test
```

---

## 📄 License & Attribution

- **Plugin License**: [MIT License](LICENSE)
- **Developer & Maintainer**: Habib ([@The-habib](https://github.com/The-habib))
- **Core Platform**: [Google Antigravity](https://antigravity.google) (Google DeepMind)
