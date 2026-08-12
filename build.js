const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== BUILDING ACODE ANTIGRAVITY PLUGIN ===');

const projectDir = __dirname;
const distDir = path.join(projectDir, 'dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// 1. Bundle TypeScript into dist/main.js
console.log('[1/3] Bundling TypeScript -> dist/main.js...');
esbuild.buildSync({
  entryPoints: [path.join(projectDir, 'src/main.ts')],
  bundle: true,
  outfile: path.join(distDir, 'main.js'),
  format: 'iife',
  target: 'es2020',
  minify: false,
  sourcemap: false,
});

console.log('Bundled successfully: dist/main.js (Size:', fs.statSync(path.join(distDir, 'main.js')).size, 'bytes)');

// 2. Validate manifest plugin.json
console.log('[2/3] Checking manifest...');
const manifestPath = path.join(projectDir, 'plugin.json');
if (!fs.existsSync(manifestPath)) {
  console.error('Error: plugin.json missing!');
  process.exit(1);
}
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
console.log(`Plugin: ${manifest.name} (${manifest.id}) v${manifest.version}`);

// 3. Package into dist/acode-antigravity.zip and dist/dist.zip
console.log('[3/3] Creating production ZIP archives...');
const zipName = 'acode-antigravity.zip';
const zipPath = path.join(distDir, zipName);
const distZipPath = path.join(distDir, 'dist.zip');

if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
if (fs.existsSync(distZipPath)) fs.unlinkSync(distZipPath);

try {
  execSync(`zip -r "${zipPath}" plugin.json dist/main.js README.md CHANGELOG.md icon.png`, { cwd: projectDir });
  fs.copyFileSync(zipPath, distZipPath);
  console.log(`ZIP created successfully at: ${zipPath}`);
  console.log(`ZIP created successfully at: ${distZipPath}`);
  console.log(`Archive Size: ${fs.statSync(zipPath).size} bytes`);
} catch (err) {
  console.error('Failed to create ZIP archive:', err);
  process.exit(1);
}

console.log('=== BUILD COMPLETE ===');
