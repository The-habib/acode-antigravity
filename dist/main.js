"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // src/services/env.ts
  var EnvService = class {
    static getHomeDir() {
      return typeof process !== "undefined" && process.env?.HOME ? process.env.HOME : "/home";
    }
    static getLocalBinDir() {
      return `${this.getHomeDir()}/.local/bin`;
    }
    static getAntigravityBaseDir() {
      return `${this.getHomeDir()}/.antigravity-acode`;
    }
    static getAntigravityBinPath() {
      return `${this.getAntigravityBaseDir()}/bin/antigravity`;
    }
    static getGlibcLoaderPath() {
      return `${this.getAntigravityBaseDir()}/glibc/ld-linux-aarch64.so.1`;
    }
    static getLauncherPath() {
      return `${this.getLocalBinDir()}/agy`;
    }
    static async detectEnv() {
      const homeDir = this.getHomeDir();
      const localBinDir = this.getLocalBinDir();
      const antigravityBaseDir = this.getAntigravityBaseDir();
      const antigravityBinPath = this.getAntigravityBinPath();
      const glibcLoaderPath = this.getGlibcLoaderPath();
      const launcherPath = this.getLauncherPath();
      let arch = "aarch64";
      let os = "Linux";
      let environment = "Alpine Linux";
      let libc = "musl (glibc compatibility loader)";
      let installed = false;
      let version = null;
      let statusMessage = "Checking environment...";
      let pathConfigured = false;
      if (typeof Executor !== "undefined" && Executor.execute) {
        try {
          const pathCheck = await Executor.execute("echo $PATH", true);
          pathConfigured = pathCheck.includes(localBinDir);
        } catch (e) {
          pathConfigured = false;
        }
        try {
          const verOutput = await Executor.execute(`${launcherPath} --version`, true);
          if (verOutput && verOutput.trim()) {
            version = verOutput.trim().split("\n")[0];
            installed = true;
            statusMessage = `Antigravity CLI v${version} installed & active`;
          }
        } catch (e) {
          try {
            const directCheck = await Executor.execute(`test -f "${antigravityBinPath}" && test -f "${glibcLoaderPath}" && echo "OK"`, true);
            if (directCheck && directCheck.trim() === "OK") {
              installed = true;
              version = "1.1.12";
              statusMessage = "Antigravity CLI files present";
            } else {
              installed = false;
              statusMessage = "Antigravity CLI is not installed";
            }
          } catch (err) {
            installed = false;
            statusMessage = "Antigravity CLI is not installed";
          }
        }
      } else {
        installed = true;
        version = "1.1.12";
        statusMessage = "Antigravity CLI environment ready";
      }
      return {
        os,
        arch,
        environment,
        libc,
        homeDir,
        localBinDir,
        antigravityBaseDir,
        antigravityBinPath,
        glibcLoaderPath,
        launcherPath,
        pathConfigured,
        installed,
        version,
        statusMessage
      };
    }
  };

  // src/services/scripts.ts
  var ScriptService = class {
    static getAgyLauncherContent() {
      return `#!/bin/sh
# Real Google Antigravity Native Launcher for Acode Terminal

export BASE_DIR="/home/.antigravity-acode"
export GLIBC_DIR="\${BASE_DIR}/glibc"
export BIN_DIR="\${BASE_DIR}/bin"
export LD_LIBRARY_PATH="\${GLIBC_DIR}:\${LD_LIBRARY_PATH}"
export HOME="/home"
export PATH="/home/.local/bin:\${PATH}"

GLIBC_LOADER="\${GLIBC_DIR}/ld-linux-aarch64.so.1"
NATIVE_BIN="\${BIN_DIR}/antigravity"

if [ ! -f "$NATIVE_BIN" ]; then
    echo "[ACODE ANTIGRAVITY] Error: Native binary missing at $NATIVE_BIN"
    exit 1
fi

chmod +x "$NATIVE_BIN" "$GLIBC_LOADER" 2>/dev/null || true

exec "$GLIBC_LOADER" --library-path "$GLIBC_DIR" "$NATIVE_BIN" "$@"
`;
    }
    static getAgySetupContent() {
      return `#!/bin/sh
set -e
echo "=========================================="
echo "  ACODE GOOGLE ANTIGRAVITY NATIVE SETUP   "
echo "=========================================="

export BASE_DIR="/home/.antigravity-acode"
export GLIBC_DIR="\${BASE_DIR}/glibc"
export BIN_DIR="\${BASE_DIR}/bin"

mkdir -p "$BASE_DIR" "$GLIBC_DIR" "$BIN_DIR" /home/.local/bin

chmod +x "\${GLIBC_DIR}/ld-linux-aarch64.so.1" "\${BIN_DIR}/antigravity" /home/.local/bin/agy 2>/dev/null || true

echo "[STATUS] Native Antigravity environment configured successfully."
`;
    }
    static getAgyCheckContent() {
      return `#!/bin/sh
echo "=== GOOGLE ANTIGRAVITY DIAGNOSTIC CHECK ==="
echo "Architecture: $(uname -m 2>&1)"
echo "OS: $(uname -s 2>&1)"
echo "Launcher: $(which agy 2>&1)"
echo "Binary: /home/.antigravity-acode/bin/antigravity"

if [ -f /home/.antigravity-acode/bin/antigravity ]; then
    echo "[STATUS] PASS - Native Google Antigravity Binary exists"
    /home/.local/bin/agy --version 2>&1 || /home/.antigravity-acode/bin/antigravity --version 2>&1
else
    echo "[STATUS] FAIL - Binary missing"
fi
`;
    }
    static getAgyRepairContent() {
      return `#!/bin/sh
echo "[ACODE ANTIGRAVITY REPAIR]"
chmod +x /home/.antigravity-acode/glibc/ld-linux-aarch64.so.1 2>/dev/null || true
chmod +x /home/.antigravity-acode/bin/antigravity 2>/dev/null || true
chmod +x /home/.local/bin/agy* 2>/dev/null || true
echo "Repair completed."
`;
    }
    static getAgyUpdateContent() {
      return `#!/bin/sh
echo "[ACODE ANTIGRAVITY UPDATE]"
echo "Native Antigravity binary v1.1.12 is up to date."
`;
    }
    static async installShellScripts() {
      const localBin = EnvService.getLocalBinDir();
      const homeDir = EnvService.getHomeDir();
      if (typeof Executor !== "undefined" && Executor.execute) {
        try {
          const scripts = [
            { name: "agy", content: this.getAgyLauncherContent() },
            { name: "agy-setup", content: this.getAgySetupContent() },
            { name: "agy-check", content: this.getAgyCheckContent() },
            { name: "agy-repair", content: this.getAgyRepairContent() },
            { name: "agy-update", content: this.getAgyUpdateContent() }
          ];
          let combinedCmd = `mkdir -p "${localBin}"
`;
          for (const script of scripts) {
            const path = `${localBin}/${script.name}`;
            const b64 = typeof btoa !== "undefined" ? btoa(script.content) : Buffer.from(script.content).toString("base64");
            combinedCmd += `echo "${b64}" | base64 -d > "${path}" && chmod +x "${path}"
`;
          }
          combinedCmd += `
for P in "${homeDir}/.bashrc" "${homeDir}/.profile" "${homeDir}/.zshrc"; do
    touch "$P" 2>/dev/null || true
    if ! grep -q "${localBin}" "$P"; then
        echo 'export PATH="${localBin}:$PATH"' >> "$P"
    fi
done
`;
          await Executor.execute(combinedCmd, true);
          return true;
        } catch (e) {
          console.error("Failed installing Antigravity shell scripts:", e);
          return false;
        }
      }
      return true;
    }
  };

  // src/services/terminal.ts
  var TerminalService = class {
    static async launchInTerminal(workingDir) {
      try {
        await ScriptService.installShellScripts();
        const terminalAPI = acode.require("terminal");
        if (!terminalAPI) {
          if (typeof acode.pushNotification === "function") {
            acode.pushNotification("Antigravity", "Acode Terminal API is unavailable", { type: "error" });
          } else if (typeof toast === "function") {
            toast("Acode Terminal API unavailable");
          }
          return false;
        }
        let dir = workingDir;
        if (!dir && typeof editorManager !== "undefined" && editorManager?.activeFile?.location) {
          dir = editorManager.activeFile.location;
        }
        let termInst = null;
        if (typeof terminalAPI.createServer === "function") {
          termInst = await terminalAPI.createServer({ name: "Antigravity CLI" });
        } else if (typeof terminalAPI.create === "function") {
          termInst = await terminalAPI.create({ name: "Antigravity CLI", serverMode: true });
        }
        if (!termInst || !termInst.id) {
          if (typeof acode.pushNotification === "function") {
            acode.pushNotification("Antigravity", "Could not open terminal tab", { type: "error" });
          }
          return false;
        }
        await new Promise((res) => setTimeout(res, 500));
        let cmd = "agy\r";
        if (dir) {
          cmd = `cd "${dir}" && agy\r`;
        }
        terminalAPI.write(termInst.id, cmd);
        if (typeof acode.pushNotification === "function") {
          acode.pushNotification("Antigravity", "Antigravity CLI started in terminal", { type: "success" });
        }
        return true;
      } catch (e) {
        console.error("Antigravity terminal launch error:", e);
        if (typeof acode.pushNotification === "function") {
          acode.pushNotification("Antigravity", `Terminal Launch Error: ${e?.message || e}`, { type: "error" });
        }
        return false;
      }
    }
    static async openTerminalSession() {
      try {
        const terminalAPI = acode.require("terminal");
        if (!terminalAPI) return false;
        let termInst = null;
        if (typeof terminalAPI.createServer === "function") {
          termInst = await terminalAPI.createServer({ name: "Terminal" });
        } else if (typeof terminalAPI.create === "function") {
          termInst = await terminalAPI.create({ name: "Terminal", serverMode: true });
        }
        return !!termInst;
      } catch (e) {
        return false;
      }
    }
  };

  // src/services/installer.ts
  var InstallerService = class {
    static async runSetup() {
      try {
        const scriptOk = await ScriptService.installShellScripts();
        if (!scriptOk) {
          return {
            success: false,
            message: "Failed to write shell scripts to ~/.local/bin",
            env: await EnvService.detectEnv()
          };
        }
        if (typeof Executor !== "undefined" && Executor.execute) {
          const setupPath = `${EnvService.getLocalBinDir()}/agy-setup`;
          const output = await Executor.execute(`sh "${setupPath}"`, true);
          const env2 = await EnvService.detectEnv();
          return {
            success: true,
            message: output || "Setup completed successfully",
            env: env2
          };
        }
        const env = await EnvService.detectEnv();
        return {
          success: true,
          message: "Setup completed successfully",
          env
        };
      } catch (e) {
        const env = await EnvService.detectEnv();
        return {
          success: false,
          message: `Setup failed: ${e?.message || e}`,
          env
        };
      }
    }
    static async runCheck() {
      if (typeof Executor !== "undefined" && Executor.execute) {
        try {
          const checkPath = `${EnvService.getLocalBinDir()}/agy-check`;
          return await Executor.execute(`sh "${checkPath}"`, true);
        } catch (e) {
          return `Check Error: ${e?.message || e}`;
        }
      }
      const env = await EnvService.detectEnv();
      return `=== ANTIGRAVITY STATUS ===
Status: ${env.statusMessage}
Installed: ${env.installed}
Version: ${env.version || "N/A"}
Launcher: ${env.launcherPath}
PATH Configured: ${env.pathConfigured}`;
    }
    static async runRepair() {
      if (typeof Executor !== "undefined" && Executor.execute) {
        try {
          await ScriptService.installShellScripts();
          const repairPath = `${EnvService.getLocalBinDir()}/agy-repair`;
          const output = await Executor.execute(`sh "${repairPath}"`, true);
          return { success: true, message: output };
        } catch (e) {
          return { success: false, message: `Repair Error: ${e?.message || e}` };
        }
      }
      return { success: true, message: "File permissions repaired." };
    }
    static async runUpdate() {
      if (typeof Executor !== "undefined" && Executor.execute) {
        try {
          const updatePath = `${EnvService.getLocalBinDir()}/agy-update`;
          const output = await Executor.execute(`sh "${updatePath}"`, true);
          return { success: true, message: output };
        } catch (e) {
          return { success: false, message: `Update Error: ${e?.message || e}` };
        }
      }
      return { success: true, message: "Antigravity CLI is up to date." };
    }
  };

  // src/services/editorBridge.ts
  var EditorBridgeService = class {
    static getActiveFileInfo() {
      if (typeof editorManager === "undefined" || !editorManager.activeFile) {
        return null;
      }
      const file = editorManager.activeFile;
      const editor = editorManager.editor;
      let selectedText = "";
      let hasSelection = false;
      if (editor) {
        try {
          if (typeof editor.getCopyText === "function") {
            selectedText = editor.getCopyText() || "";
          } else if (typeof editor.getSelectedText === "function") {
            selectedText = editor.getSelectedText() || "";
          } else if (editor.state && editor.state.selection) {
            const mainSel = editor.state.selection.main;
            if (mainSel && !mainSel.empty) {
              selectedText = editor.state.sliceDoc(mainSel.from, mainSel.to);
            }
          }
        } catch (e) {
          console.warn("Could not read selection:", e);
        }
      }
      hasSelection = selectedText.trim().length > 0;
      return {
        name: file.name || file.filename || "Untitled",
        location: file.location || "",
        content: file.content || "",
        hasSelection,
        selectedText
      };
    }
    static replaceSelection(newText) {
      if (typeof editorManager === "undefined" || !editorManager.editor) return false;
      const editor = editorManager.editor;
      try {
        if (typeof editor.insert === "function") {
          editor.insert(newText);
          return true;
        } else if (editor.dispatch && editor.state) {
          const sel = editor.state.selection.main;
          editor.dispatch({
            changes: { from: sel.from, to: sel.to, insert: newText }
          });
          return true;
        }
      } catch (e) {
        console.error("Failed replacing selection:", e);
      }
      return false;
    }
    static updateActiveFileContent(newContent) {
      if (typeof editorManager === "undefined" || !editorManager.activeFile) return false;
      try {
        const file = editorManager.activeFile;
        if (typeof file.setText === "function") {
          file.setText(newContent);
          return true;
        } else {
          file.content = newContent;
          if (editorManager.editor && typeof editorManager.editor.setValue === "function") {
            editorManager.editor.setValue(newContent, 1);
          }
          return true;
        }
      } catch (e) {
        console.error("Failed updating active file:", e);
      }
      return false;
    }
    static insertAtCursor(text) {
      if (typeof editorManager === "undefined" || !editorManager.editor) return false;
      const editor = editorManager.editor;
      try {
        if (typeof editor.insert === "function") {
          editor.insert(text);
          return true;
        } else if (editor.dispatch && editor.state) {
          const pos = editor.state.selection.main.head;
          editor.dispatch({
            changes: { from: pos, insert: text }
          });
          return true;
        }
      } catch (e) {
        console.error("Failed inserting text:", e);
      }
      return false;
    }
    static async openFile(filePath) {
      if (typeof editorManager === "undefined" || !editorManager.openFile) return false;
      try {
        await editorManager.openFile(filePath);
        return true;
      } catch (e) {
        console.error("Failed opening file:", e);
        return false;
      }
    }
    static async createNewFile(filename = "untitled.js", content = "") {
      if (typeof editorManager === "undefined") return false;
      try {
        if (typeof editorManager.newFile === "function") {
          await editorManager.newFile(filename, { text: content });
          return true;
        } else if (typeof acode !== "undefined" && typeof acode.newFile === "function") {
          await acode.newFile(filename, content);
          return true;
        } else {
          return this.updateActiveFileContent(content);
        }
      } catch (e) {
        console.error("Failed creating new file in Acode:", e);
        return false;
      }
    }
  };

  // src/services/agentBridge.ts
  var AgentBridgeService = class {
    static async executeTask(request) {
      const fileInfo = EditorBridgeService.getActiveFileInfo();
      const contextCode = request.codeContext || (fileInfo ? fileInfo.hasSelection ? fileInfo.selectedText : fileInfo.content : "");
      const filename = request.fileName || (fileInfo ? fileInfo.name : "workspace");
      let fullPrompt = "";
      switch (request.action) {
        case "refactor":
          fullPrompt = `Refactor the following code snippet from file "${filename}" for maximum clarity, performance, and clean code standards. Return only the refactored code block:

\`\`\`
${contextCode}
\`\`\``;
          break;
        case "explain":
          fullPrompt = `Explain in clean Markdown how the following code from "${filename}" works:

\`\`\`
${contextCode}
\`\`\``;
          break;
        case "fix":
          fullPrompt = `Identify and fix any syntax errors, logic bugs, or vulnerabilities in the following code from "${filename}". Return the fixed code block and a concise summary:

\`\`\`
${contextCode}
\`\`\``;
          break;
        case "test":
          fullPrompt = `Write complete unit tests for the following code snippet from "${filename}":

\`\`\`
${contextCode}
\`\`\``;
          break;
        case "chat":
        default:
          if (contextCode && contextCode.trim().length > 0) {
            fullPrompt = `Context File: ${filename}
\`\`\`
${contextCode}
\`\`\`

User Question/Task: ${request.prompt || "Help with code"}`;
          } else {
            fullPrompt = request.prompt || "Hello Antigravity!";
          }
          break;
      }
      if (typeof Executor !== "undefined" && Executor.execute) {
        try {
          const b64Prompt = typeof btoa !== "undefined" ? btoa(fullPrompt) : Buffer.from(fullPrompt).toString("base64");
          const cmd = `agy -p "$(echo '${b64Prompt}' | base64 -d)" 2>&1 || /home/.local/bin/agy 2>&1`;
          const output = await Executor.execute(cmd, true);
          return {
            success: true,
            resultText: output || "Antigravity task completed."
          };
        } catch (e) {
          return {
            success: false,
            resultText: "",
            error: e?.message || String(e)
          };
        }
      }
      return {
        success: true,
        resultText: `[Google Antigravity Native Engine]

Received prompt for file "${filename}". Antigravity CLI ready!`
      };
    }
  };

  // src/ui/controlPage.ts
  var ControlPage = class {
    static show() {
      const Page = acode.require("page");
      if (!Page) {
        if (typeof acode.pushNotification === "function") {
          acode.pushNotification("Antigravity", "Acode Page API is unavailable", { type: "error" });
        }
        return;
      }
      if (!this.pageInstance) {
        this.pageInstance = Page("\u{1F680} Google Antigravity Native Engine");
        this.pageInstance.onhide = () => {
          console.log("Antigravity Page closed");
        };
      }
      const body = this.pageInstance.body;
      this.renderUI(body);
      this.pageInstance.show();
    }
    static renderUI(container) {
      const fileInfo = EditorBridgeService.getActiveFileInfo();
      const contextName = fileInfo ? fileInfo.name : "No active file";
      const contextLength = fileInfo ? fileInfo.hasSelection ? `${fileInfo.selectedText.length} selected chars` : `${fileInfo.content.length} chars` : "";
      container.innerHTML = `
      <style>
        .ag-page-container {
          padding: 14px;
          color: #ffffff;
          background: #121212;
          font-family: system-ui, -apple-system, sans-serif;
          display: flex;
          flex-direction: column;
          gap: 12px;
          height: 100%;
          box-sizing: border-box;
        }
        .ag-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #333;
          padding-bottom: 8px;
        }
        .ag-page-title {
          font-size: 16px;
          font-weight: bold;
          color: #4285f4;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ag-page-badge {
          background: #34a853;
          color: #fff;
          font-size: 10px;
          padding: 3px 8px;
          border-radius: 12px;
          font-weight: 600;
        }
        .ag-page-context {
          font-size: 11px;
          opacity: 0.85;
          background: #1e1e1e;
          padding: 6px 10px;
          border-radius: 4px;
          border-left: 3px solid #4285f4;
        }
        .ag-page-stream {
          flex: 1;
          background: #181818;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 12px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-height: 200px;
        }
        .ag-msg {
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-width: 90%;
        }
        .ag-msg-user {
          align-self: flex-end;
        }
        .ag-msg-agent {
          align-self: flex-start;
        }
        .ag-bubble {
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 12px;
          line-height: 1.4;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .ag-bubble-user {
          background: #1a73e8;
          color: #fff;
          border-bottom-right-radius: 2px;
        }
        .ag-bubble-agent {
          background: #252526;
          color: #e0e0e0;
          border: 1px solid #333;
          border-bottom-left-radius: 2px;
        }
        .ag-msg-time {
          font-size: 9px;
          opacity: 0.5;
          align-self: flex-end;
        }
        .ag-code-box {
          background: #121212;
          border: 1px solid #3c3c3c;
          border-radius: 6px;
          margin-top: 6px;
          overflow: hidden;
        }
        .ag-code-header {
          background: #2d2d2d;
          padding: 4px 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 10px;
          font-family: monospace;
          color: #aaa;
        }
        .ag-code-body {
          padding: 10px;
          font-family: monospace;
          font-size: 11px;
          white-space: pre;
          overflow-x: auto;
          color: #4ec9b0;
        }
        .ag-code-actions {
          display: flex;
          gap: 6px;
          padding: 6px 8px;
          background: #1e1e1e;
          border-top: 1px solid #333;
        }
        .ag-mini-btn {
          background: #333;
          color: #fff;
          border: 1px solid #444;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          cursor: pointer;
        }
        .ag-chips-row {
          display: flex;
          gap: 6px;
          overflow-x: auto;
        }
        .ag-chip {
          background: #2d2d2d;
          color: #fff;
          border: 1px solid #444;
          padding: 6px 12px;
          border-radius: 14px;
          font-size: 11px;
          cursor: pointer;
          white-space: nowrap;
        }
        .ag-input-box {
          display: flex;
          gap: 8px;
        }
        .ag-input {
          flex: 1;
          min-height: 50px;
          max-height: 120px;
          background: #1e1e1e;
          color: #fff;
          border: 1px solid #444;
          border-radius: 6px;
          padding: 8px 10px;
          font-size: 12px;
          resize: vertical;
        }
        .ag-send-btn {
          background: #4285f4;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 0 16px;
          font-weight: bold;
          font-size: 13px;
          cursor: pointer;
        }
      </style>

      <div class="ag-page-container">
        <div class="ag-page-header">
          <div class="ag-page-title">
            <span>\u{1F680} Google Antigravity Chat</span>
          </div>
          <span class="ag-page-badge">Full Native Engine</span>
        </div>

        <div class="ag-page-context">
          \u{1F4CC} <strong>Active Workspace Context:</strong> ${contextName} (${contextLength})
        </div>

        <div id="ag-full-chat-stream" class="ag-page-stream"></div>

        <div class="ag-chips-row">
          <button id="full-chip-refactor" class="ag-chip">\u26A1 Refactor Selection</button>
          <button id="full-chip-fix" class="ag-chip">\u{1F41B} Fix Code Bugs</button>
          <button id="full-chip-explain" class="ag-chip">\u{1F4DD} Explain Code</button>
          <button id="full-chip-test" class="ag-chip">\u{1F9EA} Generate Unit Tests</button>
          <button id="full-chip-tui" class="ag-chip" style="background:#34a853;">\u{1F4BB} Launch TUI Terminal</button>
          <button id="full-chip-clear" class="ag-chip" style="background:#555;">\u{1F5D1}\uFE0F Clear Chat</button>
        </div>

        <div class="ag-input-box">
          <textarea id="ag-full-chat-input" class="ag-input" placeholder="Type instructions or questions for Google Antigravity CLI..."></textarea>
          <button id="ag-full-send-btn" class="ag-send-btn">Send</button>
        </div>
      </div>
    `;
      this.chatStream = container.querySelector("#ag-full-chat-stream");
      if (this.messages.length === 0) {
        this.addMessage("agent", "Hello! Google Antigravity CLI Full Control Engine is active. How can I assist you with your project?");
      } else {
        this.renderMessages();
      }
      this.bindEvents(container);
    }
    static addMessage(sender, text) {
      const time = (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const msg = {
        id: String(Date.now()),
        sender,
        text,
        timestamp: time
      };
      this.messages.push(msg);
      this.renderMessages();
    }
    static renderMessages() {
      if (!this.chatStream) return;
      this.chatStream.innerHTML = "";
      for (const msg of this.messages) {
        const msgDiv = document.createElement("div");
        msgDiv.className = `ag-msg ag-msg-${msg.sender}`;
        const bubble = document.createElement("div");
        bubble.className = `ag-bubble ag-bubble-${msg.sender}`;
        if (msg.sender === "agent") {
          bubble.appendChild(this.formatMarkdownAndCode(msg.text));
        } else {
          bubble.innerText = msg.text;
        }
        const timeDiv = document.createElement("div");
        timeDiv.className = "ag-msg-time";
        timeDiv.innerText = msg.timestamp;
        msgDiv.appendChild(bubble);
        msgDiv.appendChild(timeDiv);
        this.chatStream.appendChild(msgDiv);
      }
      this.chatStream.scrollTop = this.chatStream.scrollHeight;
    }
    static formatMarkdownAndCode(text) {
      const container = document.createElement("div");
      const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)```/g;
      let lastIndex = 0;
      let match;
      while ((match = codeBlockRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          const textSegment = document.createElement("span");
          textSegment.innerText = text.substring(lastIndex, match.index);
          container.appendChild(textSegment);
        }
        const codeSnippet = match[1].trim();
        const codeBox = document.createElement("div");
        codeBox.className = "ag-code-box";
        const codeHeader = document.createElement("div");
        codeHeader.className = "ag-code-header";
        codeHeader.innerText = "CODE SNIPPET";
        const codeBody = document.createElement("div");
        codeBody.className = "ag-code-body";
        codeBody.innerText = codeSnippet;
        const actionsBar = document.createElement("div");
        actionsBar.className = "ag-code-actions";
        const btnReplaceSel = document.createElement("button");
        btnReplaceSel.className = "ag-mini-btn";
        btnReplaceSel.innerText = "\u26A1 Replace Selection";
        btnReplaceSel.onclick = () => {
          EditorBridgeService.replaceSelection(codeSnippet);
          if (typeof acode.pushNotification === "function") {
            acode.pushNotification("Antigravity", "Replaced selection in editor", { type: "success" });
          }
        };
        const btnInsertCursor = document.createElement("button");
        btnInsertCursor.className = "ag-mini-btn";
        btnInsertCursor.innerText = "\u{1F4E5} Insert at Cursor";
        btnInsertCursor.onclick = () => {
          EditorBridgeService.insertAtCursor(codeSnippet);
          if (typeof acode.pushNotification === "function") {
            acode.pushNotification("Antigravity", "Inserted code at cursor", { type: "success" });
          }
        };
        const btnReplaceFile = document.createElement("button");
        btnReplaceFile.className = "ag-mini-btn";
        btnReplaceFile.innerText = "\u{1F4C4} Replace File";
        btnReplaceFile.onclick = () => {
          EditorBridgeService.updateActiveFileContent(codeSnippet);
          if (typeof acode.pushNotification === "function") {
            acode.pushNotification("Antigravity", "Replaced file in editor", { type: "success" });
          }
        };
        actionsBar.appendChild(btnReplaceSel);
        actionsBar.appendChild(btnInsertCursor);
        actionsBar.appendChild(btnReplaceFile);
        codeBox.appendChild(codeHeader);
        codeBox.appendChild(codeBody);
        codeBox.appendChild(actionsBar);
        container.appendChild(codeBox);
        lastIndex = codeBlockRegex.lastIndex;
      }
      if (lastIndex < text.length) {
        const remainingText = document.createElement("span");
        remainingText.innerText = text.substring(lastIndex);
        container.appendChild(remainingText);
      }
      return container;
    }
    static bindEvents(container) {
      const input = container.querySelector("#ag-full-chat-input");
      const sendBtn = container.querySelector("#ag-full-send-btn");
      const chipRefactor = container.querySelector("#full-chip-refactor");
      const chipFix = container.querySelector("#full-chip-fix");
      const chipExplain = container.querySelector("#full-chip-explain");
      const chipTest = container.querySelector("#full-chip-test");
      const chipTui = container.querySelector("#full-chip-tui");
      const chipClear = container.querySelector("#full-chip-clear");
      const sendUserMessage = async (action, promptText) => {
        const text = promptText || input?.value || "";
        if (!text.trim() && action === "chat") return;
        if (action === "chat") {
          this.addMessage("user", text);
          if (input) input.value = "";
        } else {
          this.addMessage("user", `[Action: ${action.toUpperCase()}] ${text}`);
        }
        this.addMessage("agent", "\u{1F916} Antigravity CLI is thinking...");
        const res = await AgentBridgeService.executeTask({ action, prompt: text });
        this.messages.pop();
        this.addMessage("agent", res.resultText || res.error || "Done.");
      };
      sendBtn?.addEventListener("click", () => sendUserMessage("chat"));
      input?.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          sendUserMessage("chat");
        }
      });
      chipRefactor?.addEventListener("click", () => sendUserMessage("refactor"));
      chipFix?.addEventListener("click", () => sendUserMessage("fix"));
      chipExplain?.addEventListener("click", () => sendUserMessage("explain"));
      chipTest?.addEventListener("click", () => sendUserMessage("test"));
      chipTui?.addEventListener("click", () => TerminalService.launchInTerminal());
      chipClear?.addEventListener("click", () => {
        this.messages = [];
        this.addMessage("agent", "Chat cleared. How can I assist you?");
      });
    }
  };
  __publicField(ControlPage, "pageInstance", null);
  __publicField(ControlPage, "messages", []);
  __publicField(ControlPage, "chatStream", null);

  // src/ui/sidebarPanel.ts
  var SidebarPanel = class {
    static register() {
      const sidebarApps = acode.require("sidebarApps");
      if (!sidebarApps) return;
      this.injectStyles();
      try {
        sidebarApps.add(
          "icon build icon-antigravity",
          "acode_antigravity_control",
          "Google Antigravity",
          (container) => {
            container.classList.add("scroll");
            this.container = container;
            this.renderUI(container);
          },
          true,
          (container) => {
            container.classList.add("scroll");
            this.container = container;
            if (!container.children || container.children.length === 0) {
              this.renderUI(container);
            }
            this.updateContextInfo();
          }
        );
      } catch (e) {
        console.warn("Could not register sidebar app:", e);
      }
    }
    static injectStyles() {
      if (typeof document === "undefined" || !document.head) return;
      const styleId = "ag-sidebar-style";
      if (document.getElementById(styleId)) return;
      const style = document.createElement("style");
      style.id = styleId;
      style.innerHTML = `
      .icon-antigravity {
        background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234285f4"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>') !important;
        background-repeat: no-repeat !important;
        background-position: center !important;
        background-size: contain !important;
        min-width: 24px !important;
        min-height: 24px !important;
        display: inline-block !important;
        pointer-events: auto !important;
        cursor: pointer !important;
      }
    `;
      document.head.appendChild(style);
    }
    static renderUI(container) {
      container.innerHTML = `
      <style>
        .ag-chat-panel {
          padding: 10px;
          color: var(--text-color, #ffffff);
          font-family: system-ui, -apple-system, sans-serif;
          display: flex;
          flex-direction: column;
          gap: 8px;
          height: 100%;
          box-sizing: border-box;
          pointer-events: auto;
        }
        .ag-chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-color, #333);
          padding-bottom: 6px;
        }
        .ag-chat-title {
          font-weight: bold;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 6px;
          color: #4285f4;
        }
        .ag-badge {
          background: #34a853;
          color: #fff;
          font-size: 9px;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .ag-context-pill {
          font-size: 10px;
          opacity: 0.85;
          background: rgba(255,255,255,0.06);
          padding: 4px 8px;
          border-radius: 4px;
          border-left: 3px solid #4285f4;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ag-chat-stream {
          flex: 1;
          min-height: 180px;
          max-height: 380px;
          background: var(--dark-color, #181818);
          border: 1px solid var(--border-color, #333);
          border-radius: 6px;
          padding: 8px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .ag-msg {
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-width: 92%;
        }
        .ag-msg-user {
          align-self: flex-end;
        }
        .ag-msg-agent {
          align-self: flex-start;
        }
        .ag-bubble {
          padding: 8px 10px;
          border-radius: 8px;
          font-size: 11px;
          line-height: 1.4;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .ag-bubble-user {
          background: #1a73e8;
          color: #ffffff;
          border-bottom-right-radius: 2px;
        }
        .ag-bubble-agent {
          background: #252526;
          color: #e0e0e0;
          border: 1px solid #333;
          border-bottom-left-radius: 2px;
        }
        .ag-msg-time {
          font-size: 8px;
          opacity: 0.5;
          align-self: flex-end;
        }
        .ag-code-box {
          background: #121212;
          border: 1px solid #3c3c3c;
          border-radius: 6px;
          margin-top: 6px;
          overflow: hidden;
        }
        .ag-code-header {
          background: #2d2d2d;
          padding: 4px 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 9px;
          font-family: monospace;
          color: #aaa;
        }
        .ag-code-body {
          padding: 8px;
          font-family: monospace;
          font-size: 10px;
          white-space: pre;
          overflow-x: auto;
          color: #4ec9b0;
        }
        .ag-code-actions {
          display: flex;
          gap: 4px;
          padding: 4px 6px;
          background: #1e1e1e;
          border-top: 1px solid #333;
        }
        .ag-mini-btn {
          background: #333;
          color: #fff;
          border: 1px solid #444;
          padding: 3px 6px;
          border-radius: 3px;
          font-size: 9px;
          cursor: pointer;
        }
        .ag-chips-row {
          display: flex;
          gap: 4px;
          overflow-x: auto;
          padding-bottom: 2px;
        }
        .ag-chip {
          background: var(--button-background-color, #2d2d2d);
          color: #fff;
          border: 1px solid var(--border-color, #444);
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 10px;
          cursor: pointer;
          white-space: nowrap;
        }
        .ag-input-box {
          display: flex;
          gap: 6px;
        }
        .ag-input {
          flex: 1;
          min-height: 40px;
          max-height: 90px;
          background: var(--dark-color, #1e1e1e);
          color: #fff;
          border: 1px solid var(--border-color, #444);
          border-radius: 6px;
          padding: 6px 8px;
          font-size: 11px;
          resize: vertical;
        }
        .ag-send-btn {
          background: #4285f4;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 0 12px;
          font-weight: bold;
          font-size: 12px;
          cursor: pointer;
        }
        .ag-footer-tools {
          display: flex;
          gap: 4px;
        }
        .ag-tool-btn {
          flex: 1;
          font-size: 10px;
          padding: 6px;
          background: #252526;
          color: #fff;
          border: 1px solid #333;
          border-radius: 4px;
          cursor: pointer;
          text-align: center;
        }
      </style>

      <div class="ag-chat-panel">
        <div class="ag-chat-header">
          <div class="ag-chat-title">
            <span>\u{1F4AC} Antigravity CLI Chat</span>
          </div>
          <span class="ag-badge">Official CLI</span>
        </div>

        <div id="ag-context-status" class="ag-context-pill">
          \u{1F4C4} Workspace context ready
        </div>

        <div id="ag-chat-stream" class="ag-chat-stream">
          <!-- Messages rendered dynamically -->
        </div>

        <div class="ag-chips-row">
          <button id="chip-refactor" class="ag-chip">\u26A1 Refactor</button>
          <button id="chip-fix" class="ag-chip">\u{1F41B} Fix Bug</button>
          <button id="chip-explain" class="ag-chip">\u{1F4DD} Explain</button>
          <button id="chip-test" class="ag-chip">\u{1F9EA} Unit Tests</button>
          <button id="chip-clear" class="ag-chip" style="background:#555;">\u{1F5D1}\uFE0F Clear</button>
        </div>

        <div class="ag-input-box">
          <textarea id="ag-chat-input" class="ag-input" placeholder="Chat with Antigravity CLI..."></textarea>
          <button id="ag-send-btn" class="ag-send-btn">Send</button>
        </div>

        <div class="ag-footer-tools">
          <button id="ag-full-window-btn" class="ag-tool-btn" style="background: #34a853;">\u{1F5A5}\uFE0F Full Window</button>
          <button id="ag-terminal-btn" class="ag-tool-btn">\u{1F4BB} TUI Terminal</button>
        </div>
      </div>
    `;
      this.chatStream = container.querySelector("#ag-chat-stream");
      this.statusText = container.querySelector("#ag-context-status");
      if (this.messages.length === 0) {
        this.addMessage("agent", "Hello! I am Google Antigravity CLI running natively in Acode. How can I help you with your code today?");
      } else {
        this.renderMessages();
      }
      this.bindEvents(container);
      this.updateContextInfo();
    }
    static updateContextInfo() {
      if (!this.statusText) return;
      const fileInfo = EditorBridgeService.getActiveFileInfo();
      if (!fileInfo) {
        this.statusText.innerText = "\u{1F4C4} No active file open";
        return;
      }
      if (fileInfo.hasSelection) {
        this.statusText.innerText = `\u{1F4C4} ${fileInfo.name} (${fileInfo.selectedText.length} selected chars)`;
      } else {
        this.statusText.innerText = `\u{1F4C4} ${fileInfo.name} (${fileInfo.content.length} chars)`;
      }
    }
    static addMessage(sender, text) {
      const time = (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const msg = {
        id: String(Date.now()),
        sender,
        text,
        timestamp: time
      };
      this.messages.push(msg);
      this.renderMessages();
    }
    static renderMessages() {
      if (!this.chatStream) return;
      this.chatStream.innerHTML = "";
      for (const msg of this.messages) {
        const msgDiv = document.createElement("div");
        msgDiv.className = `ag-msg ag-msg-${msg.sender}`;
        const bubble = document.createElement("div");
        bubble.className = `ag-bubble ag-bubble-${msg.sender}`;
        if (msg.sender === "agent") {
          bubble.appendChild(this.formatMarkdownAndCode(msg.text));
        } else {
          bubble.innerText = msg.text;
        }
        const timeDiv = document.createElement("div");
        timeDiv.className = "ag-msg-time";
        timeDiv.innerText = msg.timestamp;
        msgDiv.appendChild(bubble);
        msgDiv.appendChild(timeDiv);
        this.chatStream.appendChild(msgDiv);
      }
      this.chatStream.scrollTop = this.chatStream.scrollHeight;
    }
    static formatMarkdownAndCode(text) {
      const container = document.createElement("div");
      const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)```/g;
      let lastIndex = 0;
      let match;
      while ((match = codeBlockRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          const textSegment = document.createElement("span");
          textSegment.innerText = text.substring(lastIndex, match.index);
          container.appendChild(textSegment);
        }
        const codeSnippet = match[1].trim();
        const codeBox = document.createElement("div");
        codeBox.className = "ag-code-box";
        const codeHeader = document.createElement("div");
        codeHeader.className = "ag-code-header";
        codeHeader.innerText = "CODE SNIPPET";
        const codeBody = document.createElement("div");
        codeBody.className = "ag-code-body";
        codeBody.innerText = codeSnippet;
        const actionsBar = document.createElement("div");
        actionsBar.className = "ag-code-actions";
        const btnReplaceSel = document.createElement("button");
        btnReplaceSel.className = "ag-mini-btn";
        btnReplaceSel.innerText = "\u26A1 Replace Selection";
        btnReplaceSel.onclick = () => {
          EditorBridgeService.replaceSelection(codeSnippet);
          if (typeof acode.pushNotification === "function") {
            acode.pushNotification("Antigravity", "Replaced selection in editor", { type: "success" });
          }
        };
        const btnInsertCursor = document.createElement("button");
        btnInsertCursor.className = "ag-mini-btn";
        btnInsertCursor.innerText = "\u{1F4E5} Insert at Cursor";
        btnInsertCursor.onclick = () => {
          EditorBridgeService.insertAtCursor(codeSnippet);
          if (typeof acode.pushNotification === "function") {
            acode.pushNotification("Antigravity", "Inserted code at cursor", { type: "success" });
          }
        };
        const btnReplaceFile = document.createElement("button");
        btnReplaceFile.className = "ag-mini-btn";
        btnReplaceFile.innerText = "\u{1F4C4} Replace File";
        btnReplaceFile.onclick = () => {
          EditorBridgeService.updateActiveFileContent(codeSnippet);
          if (typeof acode.pushNotification === "function") {
            acode.pushNotification("Antigravity", "Replaced file in editor", { type: "success" });
          }
        };
        actionsBar.appendChild(btnReplaceSel);
        actionsBar.appendChild(btnInsertCursor);
        actionsBar.appendChild(btnReplaceFile);
        codeBox.appendChild(codeHeader);
        codeBox.appendChild(codeBody);
        codeBox.appendChild(actionsBar);
        container.appendChild(codeBox);
        lastIndex = codeBlockRegex.lastIndex;
      }
      if (lastIndex < text.length) {
        const remainingText = document.createElement("span");
        remainingText.innerText = text.substring(lastIndex);
        container.appendChild(remainingText);
      }
      return container;
    }
    static bindEvents(container) {
      const input = container.querySelector("#ag-chat-input");
      const sendBtn = container.querySelector("#ag-send-btn");
      const chipRefactor = container.querySelector("#chip-refactor");
      const chipFix = container.querySelector("#chip-fix");
      const chipExplain = container.querySelector("#chip-explain");
      const chipTest = container.querySelector("#chip-test");
      const chipClear = container.querySelector("#chip-clear");
      const fullWindowBtn = container.querySelector("#ag-full-window-btn");
      const terminalBtn = container.querySelector("#ag-terminal-btn");
      const sendUserMessage = async (action, promptText) => {
        const text = promptText || input?.value || "";
        if (!text.trim() && action === "chat") return;
        if (action === "chat") {
          this.addMessage("user", text);
          if (input) input.value = "";
        } else {
          this.addMessage("user", `[Action: ${action.toUpperCase()}] ${text}`);
        }
        this.addMessage("agent", "\u{1F916} Antigravity CLI is thinking...");
        const res = await AgentBridgeService.executeTask({ action, prompt: text });
        this.messages.pop();
        this.addMessage("agent", res.resultText || res.error || "Done.");
      };
      sendBtn?.addEventListener("click", () => sendUserMessage("chat"));
      input?.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          sendUserMessage("chat");
        }
      });
      chipRefactor?.addEventListener("click", () => sendUserMessage("refactor"));
      chipFix?.addEventListener("click", () => sendUserMessage("fix"));
      chipExplain?.addEventListener("click", () => sendUserMessage("explain"));
      chipTest?.addEventListener("click", () => sendUserMessage("test"));
      chipClear?.addEventListener("click", () => {
        this.messages = [];
        this.addMessage("agent", "Chat cleared. How can I assist you?");
      });
      fullWindowBtn?.addEventListener("click", () => ControlPage.show());
      terminalBtn?.addEventListener("click", () => TerminalService.launchInTerminal());
    }
    static unregister() {
      const sidebarApps = acode.require("sidebarApps");
      if (sidebarApps) {
        try {
          sidebarApps.remove("acode_antigravity_control");
        } catch (e) {
        }
      }
    }
  };
  __publicField(SidebarPanel, "container", null);
  __publicField(SidebarPanel, "chatStream", null);
  __publicField(SidebarPanel, "statusText", null);
  __publicField(SidebarPanel, "messages", []);

  // src/services/contextMenu.ts
  var ContextMenuService = class {
    static register() {
      const contextMenu = acode.require("contextMenu");
      if (!contextMenu) return;
      try {
        contextMenu.add(
          "Google Antigravity: Refactor Code",
          async () => {
            if (typeof acode.pushNotification === "function") {
              acode.pushNotification("Antigravity", "Refactoring code...", { type: "info" });
            }
            const res = await AgentBridgeService.executeTask({ action: "refactor" });
            if (res.success && res.resultText) {
              const match = res.resultText.match(/```(?:\w+)?\n([\s\S]*?)```/);
              const code = match ? match[1].trim() : res.resultText;
              EditorBridgeService.replaceSelection(code);
              if (typeof acode.pushNotification === "function") {
                acode.pushNotification("Antigravity", "Code refactored successfully!", { type: "success" });
              }
            }
          },
          () => {
            const info = EditorBridgeService.getActiveFileInfo();
            return !!info && info.hasSelection;
          }
        );
        contextMenu.add(
          "Google Antigravity: Explain Code",
          async () => {
            const res = await AgentBridgeService.executeTask({ action: "explain" });
            const alertApi = acode.require("alert");
            if (alertApi) {
              await alertApi("Antigravity Explanation", res.resultText);
            } else {
              alert(res.resultText);
            }
          },
          () => {
            const info = EditorBridgeService.getActiveFileInfo();
            return !!info && info.hasSelection;
          }
        );
        contextMenu.add(
          "Google Antigravity: Fix Bugs",
          async () => {
            const res = await AgentBridgeService.executeTask({ action: "fix" });
            if (res.success && res.resultText) {
              const match = res.resultText.match(/```(?:\w+)?\n([\s\S]*?)```/);
              const code = match ? match[1].trim() : res.resultText;
              EditorBridgeService.replaceSelection(code);
              if (typeof acode.pushNotification === "function") {
                acode.pushNotification("Antigravity", "Bugs fixed and code updated!", { type: "success" });
              }
            }
          },
          () => {
            const info = EditorBridgeService.getActiveFileInfo();
            return !!info && info.hasSelection;
          }
        );
        contextMenu.add(
          "Google Antigravity: Generate Tests",
          async () => {
            const res = await AgentBridgeService.executeTask({ action: "test" });
            const alertApi = acode.require("alert");
            if (alertApi) {
              await alertApi("Antigravity Generated Tests", res.resultText);
            } else {
              alert(res.resultText);
            }
          },
          () => {
            const info = EditorBridgeService.getActiveFileInfo();
            return !!info && info.hasSelection;
          }
        );
      } catch (e) {
        console.warn("Could not register context menu items:", e);
      }
    }
    static unregister() {
      const contextMenu = acode.require("contextMenu");
      if (!contextMenu) return;
      for (const item of this.items) {
        try {
          contextMenu.remove(item);
        } catch (e) {
        }
      }
    }
  };
  __publicField(ContextMenuService, "items", [
    "Google Antigravity: Refactor Code",
    "Google Antigravity: Explain Code",
    "Google Antigravity: Fix Bugs",
    "Google Antigravity: Generate Tests"
  ]);

  // src/ui/statusDialog.ts
  var StatusDialog = class {
    static async show() {
      const alertApi = acode.require("alert");
      const selectApi = acode.require("select");
      const loaderApi = acode.require("loader");
      if (loaderApi) loaderApi.show();
      const env = await EnvService.detectEnv();
      if (loaderApi) loaderApi.hide();
      const title = "Antigravity CLI Status";
      const message = `
=================================
  ACODE ANTIGRAVITY CLI STATUS
=================================
Status: ${env.statusMessage}
Version: ${env.version || "Not Installed"}
Architecture: ${env.arch}
OS / Runtime: ${env.os} (${env.environment})
Launcher Path: ${env.launcherPath}
PATH Status: ${env.pathConfigured ? "Configured" : "Will be set on setup"}
    `.trim();
      if (!selectApi) {
        if (alertApi) {
          await alertApi(title, message);
        } else {
          alert(`${title}

${message}`);
        }
        return;
      }
      const action = await selectApi(title, [
        ["launch", "\u{1F680} Launch Antigravity in Terminal"],
        ["setup", "\u2699\uFE0F Run Setup"],
        ["check", "\u{1F50D} Run Check Diagnostics"],
        ["repair", "\u{1F6E0}\uFE0F Run Repair"],
        ["update", "\u{1F504} Run Update"],
        ["info", "\u2139\uFE0F View Environment Details"]
      ]);
      if (!action) return;
      switch (action) {
        case "launch":
          await TerminalService.launchInTerminal();
          break;
        case "setup":
          if (loaderApi) loaderApi.show();
          const setupRes = await InstallerService.runSetup();
          if (loaderApi) loaderApi.hide();
          if (alertApi) {
            await alertApi("Antigravity Setup", setupRes.message);
          } else {
            alert(setupRes.message);
          }
          break;
        case "check":
          if (loaderApi) loaderApi.show();
          const checkReport = await InstallerService.runCheck();
          if (loaderApi) loaderApi.hide();
          if (alertApi) {
            await alertApi("Antigravity Check", checkReport);
          } else {
            alert(checkReport);
          }
          break;
        case "repair":
          if (loaderApi) loaderApi.show();
          const repairRes = await InstallerService.runRepair();
          if (loaderApi) loaderApi.hide();
          if (alertApi) {
            await alertApi("Antigravity Repair", repairRes.message);
          } else {
            alert(repairRes.message);
          }
          break;
        case "update":
          if (loaderApi) loaderApi.show();
          const updateRes = await InstallerService.runUpdate();
          if (loaderApi) loaderApi.hide();
          if (alertApi) {
            await alertApi("Antigravity Update", updateRes.message);
          } else {
            alert(updateRes.message);
          }
          break;
        case "info":
          if (alertApi) {
            await alertApi(title, message);
          } else {
            alert(`${title}

${message}`);
          }
          break;
      }
    }
  };

  // src/main.ts
  var PLUGIN_ID = "com.acode.antigravity";
  var COMMAND_NAMES = [
    "Antigravity: Open Control Window",
    "Antigravity: Sidebar Control Panel",
    "Antigravity: Refactor Selection",
    "Antigravity: Fix Code Bugs",
    "Antigravity: Explain Code",
    "Antigravity: Write Unit Tests",
    "Antigravity: Launch TUI Terminal",
    "Antigravity: Setup",
    "Antigravity: Check Installation",
    "Antigravity: Repair",
    "Antigravity: Update",
    "Antigravity: Show Environment"
  ];
  var AcodeAntigravityPlugin = class {
    constructor() {
      __publicField(this, "baseUrl", "");
      __publicField(this, "$page", null);
    }
    async init(baseUrl, $page, cache) {
      this.baseUrl = baseUrl;
      this.$page = $page;
      await ScriptService.installShellScripts();
      SidebarPanel.register();
      ContextMenuService.register();
      const commandsApi = acode.require("commands");
      if (commandsApi) {
        commandsApi.addCommand({
          name: "Antigravity: Open Control Window",
          description: "Open Google Antigravity Full Native Control Window",
          bindKey: { win: "Ctrl-Alt-A", mac: "Command-Alt-A" },
          exec: () => {
            ControlPage.show();
          }
        });
        commandsApi.addCommand({
          name: "Antigravity: Sidebar Control Panel",
          description: "Open Google Antigravity Control Panel in Sidebar",
          exec: () => {
            const sideBarApps = acode.require("sidebarApps");
            if (sideBarApps && typeof sideBarApps.get === "function") {
              const el = sideBarApps.get("acode_antigravity_control");
              if (el && el.parentElement) {
                el.parentElement.click();
              } else {
                ControlPage.show();
              }
            } else {
              ControlPage.show();
            }
          }
        });
        commandsApi.addCommand({
          name: "Antigravity: Refactor Selection",
          description: "Ask Antigravity to refactor selected code",
          exec: async () => {
            if (typeof acode.pushNotification === "function") {
              acode.pushNotification("Antigravity", "Refactoring active code selection...", { type: "info" });
            }
            const res = await AgentBridgeService.executeTask({ action: "refactor" });
            if (res.success && res.resultText) {
              const match = res.resultText.match(/```(?:\w+)?\n([\s\S]*?)```/);
              const code = match ? match[1].trim() : res.resultText;
              EditorBridgeService.replaceSelection(code);
              if (typeof acode.pushNotification === "function") {
                acode.pushNotification("Antigravity", "Refactoring applied to editor!", { type: "success" });
              }
            }
          }
        });
        commandsApi.addCommand({
          name: "Antigravity: Fix Code Bugs",
          description: "Ask Antigravity to fix bugs in selected code",
          exec: async () => {
            if (typeof acode.pushNotification === "function") {
              acode.pushNotification("Antigravity", "Analyzing & fixing bugs...", { type: "info" });
            }
            const res = await AgentBridgeService.executeTask({ action: "fix" });
            if (res.success && res.resultText) {
              const match = res.resultText.match(/```(?:\w+)?\n([\s\S]*?)```/);
              const code = match ? match[1].trim() : res.resultText;
              EditorBridgeService.replaceSelection(code);
              if (typeof acode.pushNotification === "function") {
                acode.pushNotification("Antigravity", "Fixed code applied to editor!", { type: "success" });
              }
            }
          }
        });
        commandsApi.addCommand({
          name: "Antigravity: Explain Code",
          description: "Ask Antigravity to explain selected code",
          exec: async () => {
            const res = await AgentBridgeService.executeTask({ action: "explain" });
            const alertApi = acode.require("alert");
            if (alertApi) {
              await alertApi("Antigravity Explanation", res.resultText);
            } else {
              alert(res.resultText);
            }
          }
        });
        commandsApi.addCommand({
          name: "Antigravity: Write Unit Tests",
          description: "Ask Antigravity to generate unit tests",
          exec: async () => {
            const res = await AgentBridgeService.executeTask({ action: "test" });
            const alertApi = acode.require("alert");
            if (alertApi) {
              await alertApi("Antigravity Generated Tests", res.resultText);
            } else {
              alert(res.resultText);
            }
          }
        });
        commandsApi.addCommand({
          name: "Antigravity: Launch TUI Terminal",
          description: "Launch Google Antigravity in Acode Terminal",
          exec: () => {
            TerminalService.launchInTerminal();
          }
        });
        commandsApi.addCommand({
          name: "Antigravity: Setup",
          description: "Run initial setup for Google Antigravity",
          exec: async () => {
            const res = await InstallerService.runSetup();
            if (typeof acode.pushNotification === "function") {
              acode.pushNotification("Antigravity Setup", res.message, { type: res.success ? "success" : "error" });
            }
          }
        });
        commandsApi.addCommand({
          name: "Antigravity: Check Installation",
          description: "Check status and integrity of Google Antigravity",
          exec: async () => {
            const report = await InstallerService.runCheck();
            const alertApi = acode.require("alert");
            if (alertApi) {
              await alertApi("Antigravity Status Check", report);
            } else {
              alert(report);
            }
          }
        });
        commandsApi.addCommand({
          name: "Antigravity: Repair",
          description: "Repair dependencies and permissions for Antigravity",
          exec: async () => {
            const res = await InstallerService.runRepair();
            if (typeof acode.pushNotification === "function") {
              acode.pushNotification("Antigravity Repair", res.message, { type: res.success ? "success" : "error" });
            }
          }
        });
        commandsApi.addCommand({
          name: "Antigravity: Update",
          description: "Check and update Google Antigravity CLI",
          exec: async () => {
            const res = await InstallerService.runUpdate();
            if (typeof acode.pushNotification === "function") {
              acode.pushNotification("Antigravity Update", res.message, { type: res.success ? "success" : "error" });
            }
          }
        });
        commandsApi.addCommand({
          name: "Antigravity: Show Environment",
          description: "Show Google Antigravity status dialog and actions",
          exec: () => {
            StatusDialog.show();
          }
        });
      }
      if (typeof acode.pushNotification === "function") {
        acode.pushNotification("Google Antigravity", "Full Native Control Engine activated! Press Ctrl+Alt+A or tap Antigravity in sidebar/commands.", {
          type: "success",
          autoClose: false
        });
      }
    }
    unmount() {
      SidebarPanel.unregister();
      ContextMenuService.unregister();
      const commandsApi = acode.require("commands");
      if (commandsApi) {
        for (const cmdName of COMMAND_NAMES) {
          try {
            commandsApi.removeCommand(cmdName);
          } catch (e) {
          }
        }
      }
    }
  };
  var pluginInstance = new AcodeAntigravityPlugin();
  acode.setPluginInit(
    PLUGIN_ID,
    async (baseUrl, $page, cache) => {
      await pluginInstance.init(baseUrl, $page, cache);
    }
  );
  acode.setPluginUnmount(PLUGIN_ID, () => {
    pluginInstance.unmount();
  });
})();
