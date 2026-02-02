import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { syncTokensPlugin } from './scripts/vite-plugin-sync-tokens'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    syncTokensPlugin(),
  ],
})