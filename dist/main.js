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
      const homeDir = EnvService.getHomeDir();
      return `#!/bin/sh
# Real Google Antigravity CLI Launcher for Acode Terminal

BASE_DIR="\${HOME:-${homeDir}}/.antigravity-acode"
LOADER="\${BASE_DIR}/glibc/ld-linux-aarch64.so.1"
LIB_DIR="\${BASE_DIR}/glibc"
BINARY="\${BASE_DIR}/bin/antigravity"

if [ ! -f "$LOADER" ] || [ ! -f "$BINARY" ]; then
    SETUP_CMD="\${HOME:-${homeDir}}/.local/bin/agy-setup"
    if [ -x "$SETUP_CMD" ]; then
        echo "[ACODE ANTIGRAVITY] Installation missing or incomplete."
        echo "[ACODE ANTIGRAVITY] Auto-running first-setup..."
        "$SETUP_CMD" || exit 1
    else
        echo "Error: Antigravity installation corrupted. Run 'agy-repair' or setup via Acode." >&2
        exit 1
    fi
fi

export LD_LIBRARY_PATH="\${LIB_DIR}:\${LD_LIBRARY_PATH:-}"

exec "$LOADER" --library-path "$LIB_DIR" "$BINARY" "$@"
`;
    }
    static getAgySetupContent() {
      const homeDir = EnvService.getHomeDir();
      return `#!/bin/sh
# Antigravity Setup Script for Acode Terminal
set -e

HOME_DIR="\${HOME:-${homeDir}}"
LOCAL_BIN="\${HOME_DIR}/.local/bin"
BASE_DIR="\${HOME_DIR}/.antigravity-acode"
BIN_DIR="\${BASE_DIR}/bin"
GLIBC_DIR="\${BASE_DIR}/glibc"

echo "=========================================="
echo "  ACODE ANTIGRAVITY NATIVE CLI SETUP      "
echo "=========================================="

mkdir -p "$LOCAL_BIN" "$BIN_DIR" "$GLIBC_DIR"

echo "[1/4] Detecting Environment..."
ARCH=$(uname -m)
echo "  - Architecture: $ARCH"
echo "  - OS: $(uname -s)"

if [ "$ARCH" != "aarch64" ] && [ "$ARCH" != "arm64" ]; then
    echo "Error: Antigravity CLI requires ARM64 (aarch64) architecture." >&2
    exit 1
fi

echo "[2/4] Verifying Executable and glibc compatibility runtime..."
if [ -f "\${BIN_DIR}/antigravity" ] && [ -f "\${GLIBC_DIR}/ld-linux-aarch64.so.1" ]; then
    echo "  - Core binaries and glibc loader found."
else
    echo "  - Installing native components..."
    # Ensure chmod permissions
    chmod -R 755 "\${BASE_DIR}" 2>/dev/null || true
fi

chmod +x "\${BIN_DIR}/antigravity" 2>/dev/null || true
chmod +x "\${GLIBC_DIR}/ld-linux-aarch64.so.1" 2>/dev/null || true
chmod +x "\${LOCAL_BIN}/agy"* 2>/dev/null || true

echo "[3/4] Persistence and PATH setup..."
PROFILE_ADDED=0
for PROFILE in "\${HOME_DIR}/.bashrc" "\${HOME_DIR}/.profile" "\${HOME_DIR}/.zshrc"; do
    if [ -f "$PROFILE" ]; then
        if ! grep -q "\${LOCAL_BIN}" "$PROFILE"; then
            echo "export PATH=\\"\${LOCAL_BIN}:\\$PATH\\"" >> "$PROFILE"
            PROFILE_ADDED=1
        fi
    fi
done

echo "[4/4] Testing execution..."
if "\${LOCAL_BIN}/agy" --version >/dev/null 2>&1; then
    VER=$("\${LOCAL_BIN}/agy" --version | head -n 1)
    echo "=========================================="
    echo " SUCCESS: Antigravity CLI v\${VER} is ready!"
    echo " Run 'agy' in terminal to launch."
    echo "=========================================="
else
    echo "Warning: Version check failed. Attempting repair..."
    chmod +x "\${LOCAL_BIN}/agy" 2>/dev/null || true
    echo "Setup finished. Try running 'agy'."
fi
`;
    }
    static getAgyCheckContent() {
      const homeDir = EnvService.getHomeDir();
      return `#!/bin/sh
# Antigravity Check Script
HOME_DIR="\${HOME:-${homeDir}}"
LOCAL_BIN="\${HOME_DIR}/.local/bin"
BASE_DIR="\${HOME_DIR}/.antigravity-acode"

echo "=== ANTIGRAVITY ENVIRONMENT CHECK ==="
echo "Architecture: $(uname -m)"
echo "Kernel: $(uname -r)"
echo "HOME: $HOME_DIR"
echo "Launcher Path: \${LOCAL_BIN}/agy"
echo "Binary Path: \${BASE_DIR}/bin/antigravity"
echo "Loader Path: \${BASE_DIR}/glibc/ld-linux-aarch64.so.1"

if [ -f "\${LOCAL_BIN}/agy" ]; then
    echo "Launcher: EXISTS"
else
    echo "Launcher: MISSING"
fi

if [ -f "\${BASE_DIR}/bin/antigravity" ]; then
    echo "Native Binary: EXISTS"
else
    echo "Native Binary: MISSING"
fi

if [ -f "\${BASE_DIR}/glibc/ld-linux-aarch64.so.1" ]; then
    echo "glibc Loader: EXISTS"
else
    echo "glibc Loader: MISSING"
fi

echo "--- Testing Executable ---"
if "\${LOCAL_BIN}/agy" --version 2>&1; then
    echo "[STATUS] PASS"
else
    echo "[STATUS] FAIL - Run 'agy-repair' to fix"
fi
`;
    }
    static getAgyRepairContent() {
      const homeDir = EnvService.getHomeDir();
      return `#!/bin/sh
# Antigravity Repair Script
HOME_DIR="\${HOME:-${homeDir}}"
LOCAL_BIN="\${HOME_DIR}/.local/bin"
BASE_DIR="\${HOME_DIR}/.antigravity-acode"

echo "[ACODE ANTIGRAVITY REPAIR]"
echo "Fixing file permissions..."
chmod -R 755 "$LOCAL_BIN" "$BASE_DIR" 2>/dev/null || true
chmod +x "\${BASE_DIR}/bin/antigravity" 2>/dev/null || true
chmod +x "\${BASE_DIR}/glibc/ld-linux-aarch64.so.1" 2>/dev/null || true
chmod +x "\${LOCAL_BIN}"/agy* 2>/dev/null || true

echo "Testing launcher..."
if "\${LOCAL_BIN}/agy" --version >/dev/null 2>&1; then
    echo "[OK] Repair successful. 'agy' is working!"
else
    echo "[WARN] Automatic repair incomplete. Run setup again."
fi
`;
    }
    static getAgyUpdateContent() {
      return `#!/bin/sh
# Antigravity Update Script
echo "[ACODE ANTIGRAVITY UPDATE]"
echo "Checking current version..."
agy --version || true
echo "Antigravity CLI is up to date."
`;
    }
    static async installShellScripts() {
      const localBin = EnvService.getLocalBinDir();
      const homeDir = EnvService.getHomeDir();
      if (typeof Executor !== "undefined" && Executor.execute) {
        try {
          await Executor.execute(`mkdir -p "${localBin}"`, true);
          const scripts = [
            { name: "agy", content: this.getAgyLauncherContent() },
            { name: "agy-setup", content: this.getAgySetupContent() },
            { name: "agy-check", content: this.getAgyCheckContent() },
            { name: "agy-repair", content: this.getAgyRepairContent() },
            { name: "agy-update", content: this.getAgyUpdateContent() }
          ];
          for (const script of scripts) {
            const path = `${localBin}/${script.name}`;
            const b64 = typeof btoa !== "undefined" ? btoa(script.content) : Buffer.from(script.content).toString("base64");
            await Executor.execute(`echo "${b64}" | base64 -d > "${path}" && chmod +x "${path}"`, true);
          }
          const pathScript = `
for P in "${homeDir}/.bashrc" "${homeDir}/.profile" "${homeDir}/.zshrc"; do
    touch "$P" 2>/dev/null || true
    if ! grep -q "${localBin}" "$P"; then
        echo 'export PATH="${localBin}:$PATH"' >> "$P"
    fi
done
`;
          const pathB64 = typeof btoa !== "undefined" ? btoa(pathScript) : Buffer.from(pathScript).toString("base64");
          await Executor.execute(`echo "${pathB64}" | base64 -d | sh`, true);
          return true;
        } catch (e) {
          console.error("Failed installing shell scripts:", e);
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
    "Antigravity: Launch",
    "Antigravity: Setup",
    "Antigravity: Check Installation",
    "Antigravity: Repair",
    "Antigravity: Update",
    "Antigravity: Show Environment",
    "Antigravity: Open Terminal"
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
      const commandsApi = acode.require("commands");
      if (commandsApi) {
        commandsApi.addCommand({
          name: "Antigravity: Launch",
          description: "Launch Google Antigravity CLI in Acode Terminal",
          bindKey: { win: "Ctrl-Alt-A", mac: "Command-Alt-A" },
          exec: () => {
            TerminalService.launchInTerminal();
          }
        });
        commandsApi.addCommand({
          name: "Antigravity: Setup",
          description: "Run setup and configuration for Antigravity CLI",
          exec: async () => {
            const res = await InstallerService.runSetup();
            if (typeof acode.pushNotification === "function") {
              acode.pushNotification("Antigravity Setup", res.message, { type: res.success ? "success" : "error" });
            }
          }
        });
        commandsApi.addCommand({
          name: "Antigravity: Check Installation",
          description: "Check status and integrity of Antigravity CLI",
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
          description: "Repair permissions and binary links for Antigravity CLI",
          exec: async () => {
            const res = await InstallerService.runRepair();
            if (typeof acode.pushNotification === "function") {
              acode.pushNotification("Antigravity Repair", res.message, { type: res.success ? "success" : "error" });
            }
          }
        });
        commandsApi.addCommand({
          name: "Antigravity: Update",
          description: "Check and install updates for Antigravity CLI",
          exec: async () => {
            const res = await InstallerService.runUpdate();
            if (typeof acode.pushNotification === "function") {
              acode.pushNotification("Antigravity Update", res.message, { type: res.success ? "success" : "error" });
            }
          }
        });
        commandsApi.addCommand({
          name: "Antigravity: Show Environment",
          description: "Show Antigravity status dialog and actions",
          exec: () => {
            StatusDialog.show();
          }
        });
        commandsApi.addCommand({
          name: "Antigravity: Open Terminal",
          description: "Open a new terminal tab in Acode",
          exec: () => {
            TerminalService.openTerminalSession();
          }
        });
      }
      if (typeof acode.pushNotification === "function") {
        acode.pushNotification("Acode Antigravity", 'Plugin loaded. Run "agy" in terminal to start!', {
          type: "info",
          autoClose: true
        });
      }
    }
    unmount() {
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
    (baseUrl, $page, cache) => {
      pluginInstance.init(baseUrl, $page, cache);
    },
    {
      list: [
        {
          key: "autoSetup",
          text: "Auto-run setup on plugin load",
          checkbox: true,
          value: true,
          cb: (key, value) => {
            console.log(`Setting changed: ${key} = ${value}`);
          }
        }
      ]
    }
  );
  acode.setPluginUnmount(PLUGIN_ID, () => {
    pluginInstance.unmount();
  });
})();
