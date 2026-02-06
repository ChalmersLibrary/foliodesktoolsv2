// https://nuxt.com/docs/api/configuration/nuxt-config
import path from 'path'

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ["@pinia/nuxt"],
  nitro: {
    devProxy: {
      '/api': {
        target: 'http://localhost:8080/api',
        changeOrigin: true
      }
    },
    output: {
      publicDir: '../public'
    }
  },
  app: {
    head: {
      title: "FOLIO Desk Tools",
      link: [
        { rel: 'icon', type: 'image/png', href: '/assets/foliobee.png' },
        { rel: 'manifest', href: '/manifest.json'},
      ]
    }
  }
})