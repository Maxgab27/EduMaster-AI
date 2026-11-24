/**
 * Servidor estático mínimo para el build de Vite en Railway.
 *
 * - Sirve `frontend/dist` respetando la variable PORT que inyecta Railway.
 * - `/health` responde JSON para el healthcheck del servicio.
 * - Cualquier ruta sin archivo vuelve a `index.html` (SPA).
 * - Sin dependencias nuevas: usa solo módulos nativos de Node.js.
 */
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('../dist', import.meta.url)));
const parsedPort = Number.parseInt(process.env.PORT ?? '', 10);
const port = Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : 4173;
const host = '0.0.0.0';

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function send(res, status, body, contentType) {
  res.writeHead(status, {
    'Content-Type': contentType,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(body);
}

/** Devuelve un archivo dentro de `root`, o null si no existe / sale del directorio. */
async function resolveFile(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  const candidate = path.resolve(root, decoded.replace(/^\/+/, ''));
  if (candidate !== root && !candidate.startsWith(root + path.sep)) return null;
  try {
    const info = await stat(candidate);
    return info.isFile() ? candidate : null;
  } catch {
    return null;
  }
}

const server = createServer(async (req, res) => {
  let pathname;
  try {
    pathname = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`).pathname;
  } catch {
    send(res, 400, 'Solicitud inválida', 'text/plain; charset=utf-8');
    return;
  }

  if (pathname === '/health') {
    send(
      res,
      200,
      JSON.stringify({ status: 'ok', service: 'edumaster-ai-frontend', mode: 'DEMO' }),
      'application/json; charset=utf-8',
    );
    return;
  }

  const file = (await resolveFile(pathname)) ?? (await resolveFile('/index.html'));
  if (!file) {
    send(
      res,
      404,
      'No hay build disponible. Ejecuta npm run build antes de npm run start.',
      'text/plain; charset=utf-8',
    );
    return;
  }

  const isEntry = path.basename(file) === 'index.html';
  res.writeHead(200, {
    'Content-Type': MIME_TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream',
    'Cache-Control': isEntry ? 'no-cache' : 'public, max-age=3600',
    'X-Content-Type-Options': 'nosniff',
  });
  createReadStream(file)
    .on('error', () => {
      if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('No se pudo leer el archivo solicitado.');
    })
    .pipe(res);
});

server.listen(port, host, () => {
  console.log(`Frontend DEMO sirviendo ${root} en http://${host}:${port} (healthcheck /health)`);
});
