const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');

test('Environment Service paths check', () => {
  const homeDir = process.env.HOME || '/home';
  const localBin = path.join(homeDir, '.local/bin');
  const baseDir = path.join(homeDir, '.antigravity-acode');

  assert.strictEqual(typeof homeDir, 'string');
  assert.strictEqual(localBin, path.join(homeDir, '.local/bin'));
  assert.ok(baseDir.includes('.antigravity-acode'));
});

test('Plugin manifest structure validation', () => {
  const manifestPath = path.join(__dirname, '../plugin.json');
  assert.ok(fs.existsSync(manifestPath), 'plugin.json must exist');
  
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.strictEqual(manifest.id, 'com.acode.antigravity');
  assert.strictEqual(manifest.name, 'Acode Antigravity');
  assert.strictEqual(manifest.main, 'dist/main.js');
  assert.ok(Array.isArray(manifest.keywords));
  assert.ok(manifest.keywords.includes('antigravity'));
  assert.ok(manifest.keywords.includes('agy'));
});
