import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Escucha en todas las interfaces para que el celular pueda abrir el QR
  // desde la misma Wi-Fi usando la IP local de la PC.
  server: {
    host: '0.0.0.0',
  },
})
