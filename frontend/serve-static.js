const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const BASE_PATH = '/project-check-point-1-aidee';

const server = http.createServer((req, res) => {
  let filePath = req.url;

  if (filePath.startsWith(BASE_PATH)) {
    filePath = filePath.slice(BASE_PATH.length);
  }

  if (filePath === '/' || filePath === '') {
    filePath = '/index.html';
  }

  filePath = path.join(__dirname, 'out', filePath);

  const extname = path.extname(filePath);
  let contentType = 'text/html';
  switch (extname) {
    case '.js': contentType = 'text/javascript'; break;
    case '.css': contentType = 'text/css'; break;
    case '.json': contentType = 'application/json'; break;
    case '.png': contentType = 'image/png'; break;
    case '.jpg': contentType = 'image/jpg'; break;
    case '.svg': contentType = 'image/svg+xml'; break;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(500);
        res.end('Server error: ' + error.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Static site preview running at:`);
  console.log(`  http://localhost:${PORT}${BASE_PATH}`);
  console.log(`Press Ctrl+C to stop`);
});
