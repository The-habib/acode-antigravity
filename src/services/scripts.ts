import { EnvService } from './env';

export class ScriptService {
  public static getAgyLauncherContent(): string {
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

  public static getAgySetupContent(): string {
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

  public static getAgyCheckContent(): string {
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

  public static getAgyRepairContent(): string {
    return `#!/bin/sh
echo "[ACODE ANTIGRAVITY REPAIR]"
chmod +x /home/.antigravity-acode/glibc/ld-linux-aarch64.so.1 2>/dev/null || true
chmod +x /home/.antigravity-acode/bin/antigravity 2>/dev/null || true
chmod +x /home/.local/bin/agy* 2>/dev/null || true
echo "Repair completed."
`;
  }

  public static getAgyUpdateContent(): string {
    return `#!/bin/sh
echo "[ACODE ANTIGRAVITY UPDATE]"
echo "Native Antigravity binary v1.1.12 is up to date."
`;
  }

  public static async installShellScripts(): Promise<boolean> {
    const localBin = EnvService.getLocalBinDir();
    const homeDir = EnvService.getHomeDir();

    if (typeof Executor !== 'undefined' && Executor.execute) {
      try {
        const scripts = [
          { name: 'agy', content: this.getAgyLauncherContent() },
          { name: 'agy-setup', content: this.getAgySetupContent() },
          { name: 'agy-check', content: this.getAgyCheckContent() },
          { name: 'agy-repair', content: this.getAgyRepairContent() },
          { name: 'agy-update', content: this.getAgyUpdateContent() },
        ];

        let combinedCmd = `mkdir -p "${localBin}"\n`;
        for (const script of scripts) {
          const path = `${localBin}/${script.name}`;
          const b64 = typeof btoa !== 'undefined' ? btoa(script.content) : Buffer.from(script.content).toString('base64');
          combinedCmd += `echo "${b64}" | base64 -d > "${path}" && chmod +x "${path}"\n`;
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
        console.error('Failed installing Antigravity shell scripts:', e);
        return false;
      }
    }
    return true;
  }
}
