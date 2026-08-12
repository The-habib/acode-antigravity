const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8765;
const distDir = path.resolve(__dirname, '../dist');

const server = http.createServer((req, res) => {
  console.log(`[HTTP SERVE] ${req.method} ${req.url}`);

  let filePath = path.join(distDir, req.url === '/' ? 'acode-antigravity.zip' : req.url);

  if (!fs.existsSync(filePath)) {
    // Fallback to acode-antigravity.zip if requesting root or dist.zip
    filePath = path.join(distDir, 'acode-antigravity.zip');
  }

  if (fs.existsSync(filePath)) {
    const stat = fs.statSync(filePath);
    res.writeHead(200, {
      'Content-Type': 'application/zip',
      'Content-Length': stat.size,
      'Access-Control-Allow-Origin': '*',
    });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found - Plugin ZIP missing. Run `npm run build` first.');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('==================================================');
  console.log(`  LOCAL PLUGIN DEV SERVER RUNNING ON PORT ${PORT}`);
  console.log('==================================================');
  console.log(`  Install URL (Acode Remote Plugin):`);
  console.log(`  http://127.0.0.1:${PORT}/acode-antigravity.zip`);
  console.log('==================================================');
});
