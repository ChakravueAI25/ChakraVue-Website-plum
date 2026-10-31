import type { IncomingMessage, ServerResponse } from "node:http";
import { handleAdminPage, handleDocument } from "./assistant/admin.ts";
import { handleChat } from "./assistant/chatHandler.ts";
import { handleEnquiryRoute } from "./enquiries/api.ts";

/**
 * The server's API routes, shared by the production server (server/index.ts)
 * and the dev server (vite.config.ts): the enquiries backend (every website
 * form, and the admin dashboard's API) and the Product Assistant. Returns
 * false for anything else.
 */
export async function handleAssistantRoute(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  if (await handleEnquiryRoute(req, res)) return true;
  const { pathname } = new URL(req.url ?? "/", "http://localhost");
  if (pathname === "/api/chat") await handleChat(req, res);
  else if (pathname === "/api/admin/document") await handleDocument(req, res);
  else if (pathname === "/admin" || pathname === "/admin/") await handleAdminPage(req, res);
  else return false;
  return true;
}
