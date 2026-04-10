import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

// Dev-only plugin: POST /__write-situations writes the request body to
// src/data/sampleSituations.js. Only registered in `vite serve` (dev), so
// the production build never exposes it.
function writeSituationsPlugin() {
  return {
    name: 'write-situations',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__write-situations', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method Not Allowed')
          return
        }
        let body = ''
        req.on('data', (chunk) => { body += chunk })
        req.on('end', () => {
          try {
            const target = path.resolve(__dirname, 'src/data/sampleSituations.js')
            // Make a timestamped backup before overwriting
            if (fs.existsSync(target)) {
              const backup = target.replace(/\.js$/, `.autosave-${Date.now()}.js`)
              fs.copyFileSync(target, backup)
            }
            fs.writeFileSync(target, body, 'utf8')
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true }))
          } catch (err) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: false, error: String(err) }))
          }
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), writeSituationsPlugin()],
  base: '/softball/',
})
