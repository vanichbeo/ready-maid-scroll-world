import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const port = Number(process.env.PORT || 4173);
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css', '.js':'text/javascript', '.mjs':'text/javascript', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.xml':'application/xml', '.txt':'text/plain' };

http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, `http://127.0.0.1:${port}`).pathname);
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '').replace(/\/$/, '') + (pathname.endsWith('/') ? '/index.html' : '');
  const file = path.resolve(root, relative);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404, {'content-type':'text/plain'}).end('Not found');
    return;
  }
  res.writeHead(200, {'content-type':types[path.extname(file).toLowerCase()] || 'application/octet-stream'});
  fs.createReadStream(file).pipe(res);
}).listen(port, '127.0.0.1', () => console.log(`Static QA server listening on ${port}`));
