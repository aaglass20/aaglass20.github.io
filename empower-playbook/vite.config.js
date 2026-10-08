import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/empower-playbook/',
  server: { port: 5177 },
  preview: { port: 4177 },
})
