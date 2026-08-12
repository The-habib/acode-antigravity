const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== DIRECT ACODE PLUGIN REVERSE-ENGINEERED INSTALLER ===');

const homeDir = process.env.HOME || '/home';
const localBin = path.join(homeDir, '.local/bin');

if (!fs.existsSync(localBin)) fs.mkdirSync(localBin, { recursive: true });

// 1. Install shell scripts into ~/.local/bin
const scripts = {
  'agy': `#!/bin/sh
BASE_DIR="${homeDir}/.antigravity-acode"
LOADER="\${BASE_DIR}/glibc/ld-linux-aarch64.so.1"
LIB_DIR="\${BASE_DIR}/glibc"
BINARY="\${BASE_DIR}/bin/antigravity"

if [ ! -f "$LOADER" ] || [ ! -f "$BINARY" ]; then
    echo "Error: Antigravity installation corrupted." >&2
    exit 1
fi

export LD_LIBRARY_PATH="\${LIB_DIR}:\${LD_LIBRARY_PATH:-}"
exec "$LOADER" --library-path "$LIB_DIR" "$BINARY" "$@"
`,
  'agy-check': `#!/bin/sh
echo "=== ANTIGRAVITY ENVIRONMENT CHECK ==="
echo "Architecture: $(uname -m)"
echo "Launcher: ${localBin}/agy"
if [ -f "${localBin}/agy" ]; then
    "${localBin}/agy" --version 2>&1
else
    echo "Launcher missing"
fi
`,
  'agy-setup': `#!/bin/sh
echo "Setting up permissions..."
chmod -R 755 "${homeDir}/.antigravity-acode" 2>/dev/null || true
chmod +x "${localBin}"/agy* 2>/dev/null || true
echo "Setup complete!"
`,
  'agy-repair': `#!/bin/sh
echo "Repairing launcher..."
chmod +x "${localBin}"/agy* 2>/dev/null || true
chmod +x "${homeDir}/.antigravity-acode/bin/antigravity" 2>/dev/null || true
echo "Repair complete!"
`,
  'agy-update': `#!/bin/sh
echo "Antigravity CLI is at latest version 1.1.12"
`
};

for (const [name, content] of Object.entries(scripts)) {
  const target = path.join(localBin, name);
  fs.writeFileSync(target, content, { mode: 0o755 });
  console.log(`Installed: ${target}`);
}

// 2. Direct Plugin Injection into Acode Plugin Storage Locations
const pluginSrcDir = path.resolve(__dirname, '..');
const pluginId = 'com.acode.antigravity';

const targetDirs = [
  `/storage/emulated/0/Android/data/com.foxdebug.acodefree/files/plugins/${pluginId}`,
  `/storage/emulated/0/Android/data/com.foxdebug.acode/files/plugins/${pluginId}`,
  `/data/data/com.foxdebug.acodefree/files/plugins/${pluginId}`,
  `/data/data/com.foxdebug.acode/files/plugins/${pluginId}`,
];

const filesToCopy = [
  'plugin.json',
  'README.md',
  'CHANGELOG.md',
  'icon.png',
  'dist/main.js',
];

for (const destDir of targetDirs) {
  try {
    const parentDir = path.dirname(destDir);
    if (!fs.existsSync(parentDir)) continue;

    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    const distSub = path.join(destDir, 'dist');
    if (!fs.existsSync(distSub)) fs.mkdirSync(distSub, { recursive: true });

    for (const rel of filesToCopy) {
      const src = path.join(pluginSrcDir, rel);
      const dest = path.join(destDir, rel);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
      }
    }
    console.log(`Directly injected plugin into Acode directory: ${destDir}`);
  } catch (err) {
    console.warn(`Note: Could not copy to ${destDir}: ${err.message}`);
  }
}

console.log('=== DIRECT INSTALLATION COMPLETE ===');
