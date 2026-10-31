import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // lets us write "@/components/..." instead of long "../../" paths
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})