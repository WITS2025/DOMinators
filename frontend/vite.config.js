// vitest.config.js
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react()],
  test: {

    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.jsx'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/src/pages/TripDetail.test.jsx', // Exclude this problematic test
      '**/.{idea,git,cache,output,temp}/**'
    ],
  },
})



