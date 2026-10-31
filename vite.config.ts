import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Serves the Product Assistant (the chat API and the /admin upload page,
 * server/routes.ts) inside the dev server, so `npm run dev` is the whole site.
 * Production uses server/index.ts.
 */
function productAssistant(): Plugin {
  return {
    name: "product-assistant",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const { pathname } = new URL(req.url ?? "/", "http://localhost");
        // The uploaded document lives in data/, which must never be served.
        if (/^\/(@fs\/.*\/)?data(\/|$)/i.test(decodeURIComponent(pathname))) {
          res.statusCode = 404;
          return res.end();
        }
        try {
          const { handleAssistantRoute } = await server.ssrLoadModule("/server/routes.ts");
          if (!(await handleAssistantRoute(req, res))) next();
        } catch (error) {
          next(error);
        }
      });
    },
  };
}

// 5175 so this runs beside the main site (5173) and the colour lab (5174).
export default defineConfig(({ mode }) => {
  // Server-only settings from .env (the admin password never reaches the
  // browser: only VITE_-prefixed variables are exposed to client code).
  Object.assign(process.env, loadEnv(mode, process.cwd(), ["CHAT_", "ADMIN_", "PDF_", "DATA_", "TRUST_", "MONGODB_", "SESSION_", "ALLOWED_", "ENQUIRY_"]));

  return {
    plugins: [react(), productAssistant()],
    server: { port: 5175, fs: { deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "data/**"] } },
    preview: { port: 4175 },
    build: {
      // three.js is its own lazy chunk, loaded only by the home hero after first paint.
      chunkSizeWarningLimit: 700,
    },
  };
});
