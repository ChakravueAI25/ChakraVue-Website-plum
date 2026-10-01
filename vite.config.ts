import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 5175 so this runs beside the main site (5173) and the colour lab (5174).
export default defineConfig({
  plugins: [react()],
  server: { port: 5175 },
  preview: { port: 4175 },
  build: {
    // three.js is its own lazy chunk, loaded only by the home hero after first paint.
    chunkSizeWarningLimit: 700,
  },
});
