import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'embed-form.js',
      },
    },
    lib: {
      entry: './src/main.jsx',
      name: 'EmbedForm',
      formats: ['iife'],
      fileName: () => 'embed-form.js',
    },
  },
});
