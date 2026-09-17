import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      validatorjs: 'validatorjs/dist/validator.js',
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Vite compila Sass con la API moderna desde la v6, que es la que
        // muestra estas deprecaciones. Todas vienen del Bootstrap 4.6.1
        // vendorizado en assets/scss/bootstrap-4.6.1 y de nuestra propia cadena
        // de @import; silenciarlas deja legible la salida del build. Lo que las
        // saca de verdad es portar los estilos a @use, y eso es un trabajo
        // aparte.
        silenceDeprecations: [
          'import',
          'global-builtin',
          'color-functions',
          'if-function',
          'abs-percent'
        ]
      }
    }
  }
})
