import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // All requests starting with '/api' will be proxied
      '/api': {
        // The target is your backend server
        target: 'http://localhost:5000',
        // This is important for virtual hosts
        changeOrigin: true,
      }
    }
  }
})
