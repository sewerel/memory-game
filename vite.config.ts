/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Build is flat (no subfolders) with relative paths, so dist/ can be dropped into a gist as-is.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    assetsDir: '',
    assetsInlineLimit: 0, // keep every image as its own file
  },
})
