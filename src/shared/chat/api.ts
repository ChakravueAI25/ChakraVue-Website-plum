export type ChatSource = { name: string; kind: string; url: string };

export type ChatMessage =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string; sources?: ChatSource[] };

/** A failure worth showing as it is (the server's own wording) rather than as a generic error. */
export class ChatError extends Error {}

/**
 * Asks the assistant (server/chatHandler.ts). Only the conversation goes up;
 * the instructions, catalogue and API key live on the server.
 */
export async function askAssistant(history: ChatMessage[], signal?: AbortSignal) {
  let response: Response;
  try {
    response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })) }),
      signal,
    });
  } catch (error) {
    if ((error as Error).name === "AbortError") throw error;
    throw new ChatError("You seem to be offline. Check your connection and try again.");
  }

  const data = (await response.json().catch(() => null)) as { reply?: string; sources?: ChatSource[]; error?: string } | null;
  if (!response.ok || !data?.reply) {
    throw new ChatError(data?.error ?? "The assistant couldn't answer just now. Please try again.");
  }
  return { reply: data.reply, sources: data.sources ?? [] };
}
