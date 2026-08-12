# Android Real-Device Test Checklist for Acode Antigravity Plugin

This checklist verifies the real-device behavior of the **Acode Antigravity** plugin on Android inside Acode.

## Pre-Test Requirements
- [x] Android device (ARM64 / `aarch64`)
- [x] Acode app installed
- [x] Plugin build generated (`dist/acode-antigravity.zip`)

## Step-by-Step Test Procedure

### 1. Plugin Installation
- [ ] Open **Acode** → **Plugins** → **+** → **Remote**
- [ ] Enter URL: `http://127.0.0.1:8765/acode-antigravity.zip`
- [ ] Confirm installation.
- [ ] Verify toast notification: *"Acode Antigravity Plugin loaded. Run 'agy' in terminal to start!"*

### 2. Command Palette Verification
- [ ] Press `Ctrl+Shift+P` (or open Command Palette)
- [ ] Search for `Antigravity`
- [ ] Verify all 7 commands are visible:
  - `Antigravity: Launch`
  - `Antigravity: Setup`
  - `Antigravity: Check Installation`
  - `Antigravity: Repair`
  - `Antigravity: Update`
  - `Antigravity: Show Environment`
  - `Antigravity: Open Terminal`

### 3. Native Terminal Execution
- [ ] Open Acode Terminal tab.
- [ ] Type:
  ```sh
  agy
  ```
- [ ] Verify output:
  - Real Google Antigravity CLI launches.
  - Interactive TUI renders with full color & ANSI controls.
  - Keyboard input, arrow keys, and Ctrl+C work correctly.

### 4. Interactive Setup & Repair Commands
- [ ] Run `agy-check` in terminal → verifies environment details.
- [ ] Run `agy-repair` in terminal → repairs permissions.

### 5. Plugin Teardown & Lifecycle Cleanup
- [ ] Go to **Acode Settings** → **Plugins** → Disable **Acode Antigravity**.
- [ ] Verify all registered commands are removed from Command Palette without errors or memory leaks.
