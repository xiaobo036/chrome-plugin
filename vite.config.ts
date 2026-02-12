import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        background: path.resolve(__dirname, 'src/background/index.ts'),
        contentScript: path.resolve(__dirname, 'src/contentScript.ts')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') {
            return 'background.js';
          } else if (chunkInfo.name === 'contentScript') {
            return 'contentScript.js';
          } else {
            return 'assets/[name].[hash].js';
          }
        }
      }
    },
    assetsInlineLimit: 0,
    cssCodeSplit: false 
  },
  base: './'
});