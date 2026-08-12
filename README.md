# Acode Antigravity

Native Google Antigravity CLI integration plugin for Acode editor on Android.

## Features

- **Native Execution**: Runs the real Google Antigravity CLI (`agy`) executable directly inside Acode's native terminal.
- **Auto-Setup**: Automated setup script (`agy-setup`) for Android ARM64 environments.
- **Terminal Integration**: Launches Antigravity directly in an interactive server terminal tab using Acode's official Terminal API (`acode.require('terminal')`).
- **Commands API**: Full set of Acode commands for Launch, Setup, Check, Repair, Update, and Diagnostics.
- **Interactive Launcher**: Pre-configures environment variables and dynamic linker search paths while passing full stdin/stdout/stderr to the Antigravity TUI.
- **Persistent PATH Configuration**: Automatically configures `$HOME/.local/bin` in shell profiles (`~/.bashrc`, `~/.profile`, `~/.zshrc`).

## Installation

1. In Acode, open **Plugins** → **+** → **Remote**.
2. Paste the plugin ZIP URL (e.g. `http://127.0.0.1:8765/acode-antigravity.zip` or GitHub Release URL).
3. Tap **Install**.

## Usage

### Option 1: Acode Terminal Command Line
Open Acode Terminal and run:

```sh
agy
```

If not yet initialized, `agy` will automatically run first-time setup and start the CLI.

### Option 2: Command Palette
Open Acode Command Palette (`Ctrl+Shift+P` / menu) and search for:
- `Antigravity: Launch`
- `Antigravity: Setup`
- `Antigravity: Check Installation`
- `Antigravity: Repair`
- `Antigravity: Update`
- `Antigravity: Show Environment`

## Commands Installed in Shell

- `agy` - Main launcher for Google Antigravity CLI
- `agy-setup` - Runs system setup & binary permission configuration
- `agy-check` - Runs environment diagnostic tests
- `agy-repair` - Repairs permissions and runtime linkages
- `agy-update` - Checks and applies updates

## Requirements

- Android ARM64 (`aarch64`)
- Acode v1.9.0+ / VersionCode 292+

## Developer & Credit

- **Author**: Antigravity Team
- **Repository**: [github.com/google-antigravity/acode-antigravity](https://github.com/google-antigravity/acode-antigravity)
- **License**: MIT
