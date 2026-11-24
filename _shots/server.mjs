/* Static host for the screenshot harness: the real client.js, the vendor React
   builds, and the captured /api/today answer, so the card renders offline. */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '..')
const PORT = Number(process.env.SHOT_PORT || 8791)

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.css': 'text/css; charset=utf-8',
}

const ROUTES = {
  '/client.js': path.join(ROOT, 'lib', 'client.js'),
  '/plugins/dshjieqi-card/api/today': path.join(HERE, 'today.json'),
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1')
  const file = ROUTES[url.pathname] || path.join(HERE, url.pathname === '/' ? 'index.html' : url.pathname)
  if (!file.startsWith(HERE) && !file.startsWith(path.join(ROOT, 'lib'))) {
    response.writeHead(403).end('no')
    return
  }
  fs.readFile(file, (error, body) => {
    if (error) {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('missing ' + url.pathname)
      return
    }
    response.writeHead(200, {
      'content-type': TYPES[path.extname(file)] || 'application/octet-stream',
      'cache-control': 'no-store',
    }).end(body)
  })
})

server.listen(PORT, '127.0.0.1', () => {
  console.log('harness on http://127.0.0.1:' + PORT)
})
