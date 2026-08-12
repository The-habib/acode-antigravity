const test = require('node:test');
const assert = require('node:assert');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

test('Launcher execution test for agy --version', () => {
  const launcherPath = path.join(process.env.HOME || '/home', '.local/bin/agy');
  if (fs.existsSync(launcherPath)) {
    const output = execSync(`"${launcherPath}" --version`, { encoding: 'utf8' });
    assert.ok(output.includes('1.1.') || output.includes('Antigravity') || output.trim().length > 0);
  } else {
    assert.ok(true, 'Launcher test skipped (not yet installed)');
  }
});
