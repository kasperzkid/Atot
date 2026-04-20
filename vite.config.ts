import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      '/api/chapa-init': {
        target: 'https://api.chapa.co',
        changeOrigin: true,
        rewrite: () => '/v1/transaction/initialize',
      },
      '/api/chapa-verify': {
        target: 'https://api.chapa.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/chapa-verify/, '/v1/transaction/verify'),
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));