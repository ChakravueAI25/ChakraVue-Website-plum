/** `heading` is the PDF's own heading for the section the sentence is in. */
export type Quote = { text: string; page: number; heading: string | null };

export type AssistantReply = {
  status: "answer" | "ambiguous" | "not_found" | "no_document";
  /** Sentences quoted word for word from the product PDF, with their pages. */
  quotes: Quote[];
  message?: string;
  note?: string;
  document: { name: string } | null;
};

/** A failure worth showing as it is (the server's own wording) rather than as a generic error. */
export class ChatError extends Error {}

/**
 * Asks the Product Assistant (server/assistant/chatHandler.ts). The answer is
 * found by search on the site's own server, in the uploaded product PDF.
 */
export async function askAssistant(question: string, signal?: AbortSignal): Promise<AssistantReply> {
  let response: Response;
  try {
    response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
      signal,
    });
  } catch (error) {
    if ((error as Error).name === "AbortError") throw error;
    throw new ChatError("You seem to be offline. Check your connection and try again.");
  }

  const data = (await response.json().catch(() => null)) as (AssistantReply & { error?: string }) | null;
  if (!response.ok || !data || !Array.isArray(data.quotes)) {
    throw new ChatError(data?.error ?? "The assistant couldn't answer just now. Please try again.");
  }
  return data;
}
