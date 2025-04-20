import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allows external network access
    port: 5173,
    https: false, // Let Nginx handle HTTPS
    hmr: {
      protocol: 'wss', // Ensure HMR uses secure WebSocket (wss)
      host: 'auth.localhost', // Correct domain where Vite is being accessed
      port: 443 // Use the correct HTTPS port (443)
    }
  }
})
