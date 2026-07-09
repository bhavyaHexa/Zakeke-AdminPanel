import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/upload-to-shopify': 'http://127.0.0.1:5000',
      '/upload-file': 'http://127.0.0.1:5000'
    }
  }
})
