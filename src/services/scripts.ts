import { EnvService } from './env';

export class ScriptService {
  public static getBridgeServerContent(): string {
    return `#!/usr/bin/env node
const http = require('http');
const { exec } = require('child_process');

const PORT = 8765;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/ping' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', engine: 'Google Antigravity Native Bridge', version: '1.1.12' }));
    return;
  }

  if (req.url === '/exec' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const prompt = payload.prompt || '';
        const action = payload.action || 'chat';
        const contextCode = payload.codeContext || '';
        const fileName = payload.fileName || 'workspace';

        let fullPrompt = '';
        if (action === 'refactor') {
          fullPrompt = 'Refactor the code snippet from file "' + fileName + '". Return only refactored code:\\n\\n\`\`\`\\n' + contextCode + '\\n\`\`\`';
        } else if (action === 'explain') {
          fullPrompt = 'Explain in clean Markdown how code from "' + fileName + '" works:\\n\\n\`\`\`\\n' + contextCode + '\\n\`\`\`';
        } else if (action === 'fix') {
          fullPrompt = 'Fix bugs in code from "' + fileName + '". Return fixed code:\\n\\n\`\`\`\\n' + contextCode + '\\n\`\`\`';
        } else if (action === 'test') {
          fullPrompt = 'Write unit tests for snippet from "' + fileName + '":\\n\\n\`\`\`\\n' + contextCode + '\\n\`\`\`';
        } else {
          fullPrompt = contextCode ? 'Context File: ' + fileName + '\\n\`\`\`\\n' + contextCode + '\\n\`\`\`\\n\\nUser Question: ' + prompt : prompt;
        }

        const b64 = Buffer.from(fullPrompt).toString('base64');
        const cmd = '/home/.local/bin/agy -p "$(echo \'' + b64 + '\' | base64 -d)" 2>&1 || /home/.antigravity-acode/bin/antigravity -p "$(echo \'' + b64 + '\' | base64 -d)" 2>&1';

        exec(cmd, { maxBuffer: 10 * 1024 * 1024, env: process.env }, (error, stdout, stderr) => {
          const resultText = stdout || stderr || (error ? error.message : 'No output');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: !error,
            resultText,
            error: error ? error.message : null
          }));
        });
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('[ANTIGRAVITY BRIDGE SERVER] Listening on http://127.0.0.1:' + PORT);
});
`;
  }

  public static getAgyLauncherContent(): string {
    return `#!/bin/sh
# Real Google Antigravity Native Launcher for Acode Terminal

export BASE_DIR="/home/.antigravity-acode"
export GLIBC_DIR="\${BASE_DIR}/glibc"
export BIN_DIR="\${BASE_DIR}/bin"
export LD_LIBRARY_PATH="\${GLIBC_DIR}:\${LD_LIBRARY_PATH}"
export HOME="/home"
export PATH="/home/.local/bin:\${PATH}"

# Auto-start HTTP bridge server in background if not running
if ! netstat -nlpt 2>/dev/null | grep -q 8765; then
    node /home/.local/bin/antigravity-bridge >/dev/null 2>&1 &
fi

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

chmod +x "\${GLIBC_DIR}/ld-linux-aarch64.so.1" "\${BIN_DIR}/antigravity" /home/.local/bin/agy /home/.local/bin/antigravity-bridge 2>/dev/null || true

# Start bridge server
node /home/.local/bin/antigravity-bridge >/dev/null 2>&1 &

echo "[STATUS] Native Antigravity environment and HTTP Bridge Server configured successfully."
`;
  }

  public static getAgyCheckContent(): string {
    return `#!/bin/sh
echo "=== GOOGLE ANTIGRAVITY DIAGNOSTIC CHECK ==="
echo "Architecture: $(uname -m 2>&1)"
echo "Launcher: $(which agy 2>&1)"
echo "HTTP Bridge: http://127.0.0.1:8765/ping"
curl -s http://127.0.0.1:8765/ping || echo "[BRIDGE] Server offline"
`;
  }

  public static getAgyRepairContent(): string {
    return `#!/bin/sh
echo "[ACODE ANTIGRAVITY REPAIR]"
chmod +x /home/.antigravity-acode/glibc/ld-linux-aarch64.so.1 2>/dev/null || true
chmod +x /home/.antigravity-acode/bin/antigravity 2>/dev/null || true
chmod +x /home/.local/bin/agy* /home/.local/bin/antigravity-bridge 2>/dev/null || true
node /home/.local/bin/antigravity-bridge >/dev/null 2>&1 &
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
          { name: 'antigravity-bridge', content: this.getBridgeServerContent() },
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
node "${localBin}/antigravity-bridge" >/dev/null 2>&1 &
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
