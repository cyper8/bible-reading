/** @type {import('vite').UserConfig} */

import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  server: {
    cors: false,
  }
})