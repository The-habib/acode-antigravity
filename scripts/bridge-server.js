const http = require('http');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const PORT = 8765;

const server = http.createServer((req, res) => {
  // CORS Headers
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
          fullPrompt = `Refactor the following code snippet from file "${fileName}" for maximum clarity and clean code standards. Return only the refactored code block:\n\n\`\`\`\n${contextCode}\n\`\`\``;
        } else if (action === 'explain') {
          fullPrompt = `Explain in clean Markdown how the following code from "${fileName}" works:\n\n\`\`\`\n${contextCode}\n\`\`\``;
        } else if (action === 'fix') {
          fullPrompt = `Identify and fix any syntax errors or logic bugs in the following code from "${fileName}". Return the fixed code block:\n\n\`\`\`\n${contextCode}\n\`\`\``;
        } else if (action === 'test') {
          fullPrompt = `Write complete unit tests for the code snippet from "${fileName}":\n\n\`\`\`\n${contextCode}\n\`\`\``;
        } else {
          if (contextCode && contextCode.trim().length > 0) {
            fullPrompt = `Context File: ${fileName}\n\`\`\`\n${contextCode}\n\`\`\`\n\nUser Prompt: ${prompt}`;
          } else {
            fullPrompt = prompt;
          }
        }

        const b64 = Buffer.from(fullPrompt).toString('base64');
        const cmd = `/home/.local/bin/agy -p "$(echo '${b64}' | base64 -d)" 2>&1 || /home/.antigravity-acode/bin/antigravity -p "$(echo '${b64}' | base64 -d)" 2>&1`;

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
  console.log(`[ANTIGRAVITY BRIDGE SERVER] Listening on http://127.0.0.1:${PORT}`);
});
