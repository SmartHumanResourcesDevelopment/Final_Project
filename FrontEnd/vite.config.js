// FrontEnd/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "tailwindcss";
import { screenGraphPlugin } from "@animaapp/vite-plugin-screen-graph";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === "development" && screenGraphPlugin()
  ].filter(Boolean),
  publicDir: "./public",
  root: '.', 
  base: "./",
  css: {
    postcss: { plugins: [tailwind()] },
  },
  server: {
    proxy: {
      // 기존 API proxy
      '/zal': 'http://localhost:8095',

      // ★ 이걸 proxy 객체 안으로 옮겨야 합니다
      '/uploads': {
        target: 'http://localhost:8095',
        changeOrigin: true,
      },
    },
  },
}));
