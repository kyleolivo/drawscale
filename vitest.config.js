import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
    include: ['tests/unit/**/*.test.{js,ts,tsx}', 'tests/integration/**/*.test.{js,ts,tsx}'],
    exclude: ['**/node_modules/**', '**/tests/e2e/**'],
  },
  define: {
    'process.env.IS_PREACT': JSON.stringify('false'),
  },
  optimizeDeps: {
    include: ['@excalidraw/excalidraw'],
  },
})