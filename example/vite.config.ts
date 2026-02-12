import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    fs: {
      allow: [__dirname, path.resolve(__dirname, "../src")]
    }
  },
  resolve: {
    alias: {
      "@shtbox/boop": path.resolve(__dirname, "../src/index.ts")
    },
    dedupe: ["react", "react-dom"]
  }
});
