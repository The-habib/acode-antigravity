const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== PUBLISHING TO GITHUB ===');

const projectDir = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(projectDir, 'plugin.json'), 'utf8'));
const repoName = manifest.name.toLowerCase().replace(/[^a-z0-9]/g, '-');

try {
  console.log(`[1/3] Creating repository ${repoName}...`);
  execSync(`gh repo create "${repoName}" --public --source="${projectDir}" --push`, { cwd: projectDir, stdio: 'inherit' });
} catch (e) {
  console.log('Repository may already exist or push was performed.');
}

try {
  console.log('[2/3] Creating GitHub Release...');
  const zipPath = path.join(projectDir, 'dist', 'acode-antigravity.zip');
  execSync(`gh release create "v${manifest.version}" "${zipPath}" --title "Release v${manifest.version}" --notes "Production release of ${manifest.name}"`, { cwd: projectDir, stdio: 'inherit' });

  const ghUser = execSync('gh api user -q .login', { encoding: 'utf8' }).trim();
  const releaseUrl = `https://github.com/${ghUser}/${repoName}/releases/download/v${manifest.version}/acode-antigravity.zip`;
  const rawUrl = `https://raw.githubusercontent.com/${ghUser}/${repoName}/main/dist/acode-antigravity.zip`;

  console.log('==================================================');
  console.log('  SUCCESSFULLY PUBLISHED TO GITHUB!');
  console.log('==================================================');
  console.log('Acode Remote Plugin Release URL:');
  console.log(releaseUrl);
  console.log('\nAlternative Raw URL:');
  console.log(rawUrl);
  console.log('==================================================');
} catch (err) {
  console.error('Failed to create release:', err.message);
}
