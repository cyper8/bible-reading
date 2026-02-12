/** @type {import('vite').UserConfig} */

import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  server: {
    base: "./",
    cors: false,
    fs: {
      allow: ['..','../..']
    }
  },
  resolve: {
    alias: {
      '@bible-reading': '../../packages/bible-reading/index.js'
    }
  }
})