import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Minify html in production
import { ViteMinifyPlugin } from 'vite-plugin-minify'

//! Для Vite с версией 5+
import pluginPurgeCss from 'vite-plugin-purgecss-updated-v5'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    ViteMinifyPlugin({}),
    pluginPurgeCss({
      variables: true
    })
  ],
  optimizeDeps: {
    // include: ['vue']
  },
  base: './',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    rollupOptions: {
      // Кэширование и сжатие JS
      // output: {
      //   entryFileNames: 'assets/[name].[hash].js',
      //   chunkFileNames: 'assets/[name].[hash].js',
      //   assetFileNames: 'assets/[name].[hash].[ext]'
      // }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        // ПЕРЕМЕННЫЕ SCSS + отдельный файл с mixins и функциями 👀
        additionalData:
          '@import "@/assets/_variables.scss"; @import "@/assets/_mixins_functions.scss";'
        // additionalData: `@use "@/assets/_variables.scss";`
      }
    }
  }
})
