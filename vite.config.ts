/// <reference types="vitest/config" />
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

/**
 * Emits sw.js from pwa/sw.js with the full list of built files to precache
 * (bundle output + everything in public/), versioned by a hash of that list.
 */
function serviceWorker(): Plugin {
  return {
    name: 'memory-service-worker',
    apply: 'build',
    enforce: 'post',
    generateBundle(_, bundle) {
      const publicFiles = readdirSync(path.resolve(import.meta.dirname, 'public'))
      const files = [
        './',
        ...Object.keys(bundle).filter((f) => f !== 'index.html'),
        ...publicFiles,
      ].sort()
      const version = createHash('sha256').update(files.join('\n')).digest('hex').slice(0, 10)
      const source = readFileSync(path.resolve(import.meta.dirname, 'pwa/sw.js'), 'utf8')
        .replace('__VERSION__', version)
        .replace('__PRECACHE__', JSON.stringify(files, null, 2))
      this.emitFile({ type: 'asset', fileName: 'sw.js', source })
    },
  }
}

// Flat build with relative paths: works under the GitHub Pages sub-path (/memory-game/) or any host.
export default defineConfig({
  base: './',
  plugins: [react(), serviceWorker()],
  build: {
    assetsDir: '',
    assetsInlineLimit: 0, // keep every image and sound as its own file
  },
})
