const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('==================================================');
console.log('  AUTOMATED ACODE PLUGIN VALIDATOR (PHASE 10)     ');
console.log('==================================================');

const projectDir = path.resolve(__dirname, '..');
const distDir = path.join(projectDir, 'dist');
const zipPath = path.join(distDir, 'acode-antigravity.zip');

let errors = 0;
let warnings = 0;

function logPass(msg) {
  console.log(` [PASS] ${msg}`);
}

function logFail(msg) {
  console.error(` [FAIL] ${msg}`);
  errors++;
}

function logWarn(msg) {
  console.warn(` [WARN] ${msg}`);
  warnings++;
}

// Check 1: plugin.json manifest
const manifestPath = path.join(projectDir, 'plugin.json');
if (!fs.existsSync(manifestPath)) {
  logFail('plugin.json file is missing!');
} else {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (!manifest.id || typeof manifest.id !== 'string') logFail('manifest: missing or invalid "id"');
    else logPass(`Manifest ID: ${manifest.id}`);

    if (!manifest.name) logFail('manifest: missing "name"');
    else logPass(`Manifest Name: ${manifest.name}`);

    if (!manifest.version) logFail('manifest: missing "version"');
    else logPass(`Manifest Version: ${manifest.version}`);

    if (!manifest.main) logFail('manifest: missing "main"');
    else logPass(`Manifest Main: ${manifest.main}`);

    if (!manifest.readme) logFail('manifest: missing "readme"');
    if (!manifest.icon) logFail('manifest: missing "icon"');
    if (!manifest.changelogs) logFail('manifest: missing "changelogs"');
  } catch (e) {
    logFail(`plugin.json is invalid JSON: ${e.message}`);
  }
}

// Check 2: Icon size <= 50KB
const iconPath = path.join(projectDir, 'icon.png');
if (!fs.existsSync(iconPath)) {
  logFail('icon.png is missing!');
} else {
  const iconSize = fs.statSync(iconPath).size;
  if (iconSize > 50 * 1024) {
    logFail(`icon.png exceeds 50KB limit: ${iconSize} bytes`);
  } else {
    logPass(`Icon size valid: ${iconSize} bytes (<= 50KB)`);
  }
}

// Check 3: Required files existence
const requiredFiles = ['plugin.json', 'README.md', 'CHANGELOG.md', 'icon.png', 'dist/main.js'];
for (const reqFile of requiredFiles) {
  const p = path.join(projectDir, reqFile);
  if (!fs.existsSync(p)) {
    logFail(`Required file missing: ${reqFile}`);
  } else {
    logPass(`File exists: ${reqFile} (${fs.statSync(p).size} bytes)`);
  }
}

// Check 4: Main JS syntax validation
const mainJsPath = path.join(distDir, 'main.js');
if (fs.existsSync(mainJsPath)) {
  try {
    execSync(`node -c "${mainJsPath}"`);
    logPass('Main entry file (dist/main.js) syntax check passed');
  } catch (e) {
    logFail('dist/main.js contains syntax errors');
  }
}

// Check 5: ZIP archive structure
if (!fs.existsSync(zipPath)) {
  logFail(`Production ZIP missing: ${zipPath}`);
} else {
  try {
    const zipListing = execSync(`unzip -l "${zipPath}"`, { encoding: 'utf8' });
    if (zipListing.includes('plugin.json') && zipListing.includes('main.js')) {
      logPass(`ZIP archive valid & structured: ${fs.statSync(zipPath).size} bytes`);
    } else {
      logFail('ZIP archive missing plugin.json or main.js inside');
    }
  } catch (e) {
    logFail(`Failed to inspect ZIP archive: ${e.message}`);
  }
}

console.log('==================================================');
console.log(`SUMMARY: ${errors} errors, ${warnings} warnings`);
if (errors > 0) {
  console.error('Validation FAILED!');
  process.exit(1);
} else {
  console.log('Validation PASSED SUCCESSFULLY!');
  process.exit(0);
}
