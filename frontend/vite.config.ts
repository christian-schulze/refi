/// <reference types="vitest" />
import path from 'node:path';
import { defineConfig } from 'vite';
import reactPlugin from '@vitejs/plugin-react';
import babelMacrosPlugin from 'vite-plugin-babel-macros';

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [
    babelMacrosPlugin(),
    reactPlugin({
      babel: {
        plugins: [
          [
            'babel-plugin-styled-components',
            { ssr: false, pure: true, displayName: true, fileName: true },
          ],
        ],
      },
    }),
  ],

  resolve: {
    alias: {
      assets: path.resolve(__dirname, 'src/assets'),
      components: path.resolve(__dirname, 'src/components'),
      routes: path.resolve(__dirname, 'src/routes'),
      screens: path.resolve(__dirname, 'src/screens'),
      services: path.resolve(__dirname, 'src/services'),
      stores: path.resolve(__dirname, 'src/stores'),
      themes: path.resolve(__dirname, 'src/themes'),
    },
  },

  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['src/setupTest.ts'],
    reporters: ['default', 'html'],
  },
}));
