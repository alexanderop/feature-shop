export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  devtools: { enabled: false },
  colorMode: { preference: 'light', fallback: 'light' },
  ui: {
    fonts: false,
  },
  typescript: {
    strict: true,
    typeCheck: true,
  },
})
