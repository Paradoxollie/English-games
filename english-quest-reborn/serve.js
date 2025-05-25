import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  let filePath = join(__dirname, req.url === '/' ? 'index.html' : req.url);
  
  // Sécurité : empêcher l'accès aux fichiers en dehors du dossier
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  
  if (!existsSync(filePath)) {
    res.writeHead(404);
    res.end('File not found');
    return;
  }
  
  const ext = extname(filePath);
  const mimeType = mimeTypes[ext] || 'application/octet-stream';
  
  try {
    const content = readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(content);
  } catch (error) {
    res.writeHead(500);
    res.end('Server error');
    console.error('Error reading file:', error);
  }
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`🚀 Serveur HTTP simple démarré sur http://localhost:${PORT}`);
  console.log(`📁 Servant les fichiers depuis: ${__dirname}`);
  console.log(`🎮 Accédez au jeu: http://localhost:${PORT}/games/enigma-scroll-main.html`);
}); 