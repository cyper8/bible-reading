/** @type {import('vite').UserConfig} */

import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/bolls': {
        target: "https://bolls.life/",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/bolls/, '')
      },
      '/reading': {
        target: 'https://script.google.com/macros/s/AKfycbzD_7_x61neJrufGhik97z2TWwFaTAzF9NRaAkThkszX1dJTq7JyUkujKmG9dJ3q-qdiQ/exec',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/reading/, '')
      }
    }
  }
})