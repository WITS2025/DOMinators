
// vitest.config.js
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';


export default defineConfig({
  plugins: [react()],
  test: {

    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js', 
  },
})





    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js', 
  },
});

