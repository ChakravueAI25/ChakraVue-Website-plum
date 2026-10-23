import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Serves the chat assistant's API (server/chatHandler.ts) inside the dev
 * server, so `npm run dev` is the whole site. Production uses server/index.ts.
 */
function chatApi(): Plugin {
  return {
    name: "chat-api",
    configureServer(server) {
      server.middlewares.use("/api/chat", async (req, res) => {
        const { handleChat } = await server.ssrLoadModule("/server/chatHandler.ts");
        await handleChat(req, res);
      });
    },
  };
}

// 5175 so this runs beside the main site (5173) and the colour lab (5174).
export default defineConfig(({ mode }) => {
  // Server-only settings from .env (the API key never reaches the browser:
  // only VITE_-prefixed variables are exposed to client code).
  Object.assign(process.env, loadEnv(mode, process.cwd(), ["ANTHROPIC_", "CHAT_"]));

  return {
    plugins: [react(), chatApi()],
    server: { port: 5175 },
    preview: { port: 4175 },
    build: {
      // three.js is its own lazy chunk, loaded only by the home hero after first paint.
      chunkSizeWarningLimit: 700,
    },
  };
});
