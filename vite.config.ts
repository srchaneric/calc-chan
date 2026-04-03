import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; // Importação correta para v4
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    // Caminho para o seu subdomínio na Hostinger
    base: '/calc/', 
    plugins: [
      react(),
      tailwindcss(), // Ativa o Tailwind v4 no processo de build
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    build: {
      // Evita problemas de cache com nomes fixos
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name].js`,
          chunkFileNames: `assets/[name].js`,
          assetFileNames: `assets/[name].[ext]`
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
