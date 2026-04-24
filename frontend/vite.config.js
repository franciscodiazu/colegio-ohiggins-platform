import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@colegio-ohiggins/ui': resolve(__dirname, '../packages/ui/src/index.js'),
    },
  },
})
