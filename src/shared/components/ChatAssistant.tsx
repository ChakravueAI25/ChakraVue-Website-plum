import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { lockScroll } from "../../motion/lenis";
import { askAssistant, ChatError, type AssistantReply } from "../chat/api";
import { assistant, useAssistant } from "../chat/assistantState";
import "./chat.css";

const WELCOME = "Hi! Welcome to our website. Ask me a question about our products, and I'll search our product document for the answer.";
const MAX_CHARS = 500;
const PHONE = "(max-width: 600px)";

type Message = { role: "user"; text: string } | { role: "assistant"; reply: AssistantReply };

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

const pageList = (pages: number[]) => (pages.length === 1 ? `page ${pages[0]}` : `pages ${pages.slice(0, -1).join(", ")} and ${pages[pages.length - 1]}`);

/** An answer: the document's own sentences, each with its page, plus any fixed message or note. */
function Reply({ reply }: { reply: AssistantReply }) {
  const pages = [...new Set(reply.quotes.map((quote) => quote.page))].sort((a, b) => a - b);
  // Quotes from several sections say which section (product) each comes from.
  const labelled = new Set(reply.quotes.map((quote) => quote.heading)).size > 1;
  return (
    <>
      {reply.message && <p>{reply.message}</p>}
      {reply.quotes.map((quote, i) => (
        <p key={i} className="assist-quote">
          {labelled && quote.heading && quote.heading !== reply.quotes[i - 1]?.heading && (
            <span className="assist-section">{quote.heading}</span>
          )}
          {quote.text} <span className="assist-page">p. {quote.page}</span>
        </p>
      ))}
      {reply.note && <p className="assist-quote-note">{reply.note}</p>}
      {pages.length > 0 && reply.document && (
        <p className="assist-source">
          Source: {reply.document.name}, {pageList(pages)}
        </p>
      )}
    </>
  );
}

/**
 * The Product Assistant's window. The campaign's kid on the growth rail
 * (GrowRail.tsx) hosts it: pressing him opens it, and he shows in its
 * header. Answers are sentences found in the product PDF by the site's own
 * search engine (server/assistant/), with their page numbers.
 */
export function ChatAssistant() {
  const { open } = useAssistant();
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<{ text: string; question: string } | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const request = useRef<AbortController | null>(null);

  // Always show the latest message (and the searching indicator or error).
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTo({ top: log.scrollHeight, behavior: "smooth" });
  }, [messages, pending, error, open]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus({ preventScroll: true });
    // On phones the window fills the screen, so the page behind it stays put.
    const phone = window.matchMedia(PHONE).matches;
    if (phone) lockScroll(true);
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (phone) lockScroll(false);
    };
  }, [open]);

  useEffect(() => () => request.current?.abort(), []);

  function close() {
    assistant.close();
    // Back to the kid who opened it (whichever of his two forms is showing).
    const launchers = [...document.querySelectorAll<HTMLElement>("[data-assistant-launcher]")];
    launchers.find((el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility === "visible")?.focus({ preventScroll: true });
  }

  // The kid looks busy while the document is searched.
  useEffect(() => assistant.searching(pending), [pending]);

  async function ask(question: string) {
    setPending(true);
    setError(null);
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    try {
      const reply = await askAssistant(question, controller.signal);
      setMessages((list) => [...list, { role: "assistant", reply }]);
    } catch (failure) {
      if ((failure as Error).name === "AbortError") return;
      const text = failure instanceof ChatError ? failure.message : "The assistant couldn't answer just now. Please try again.";
      setError({ text, question });
    } finally {
      if (request.current === controller) setPending(false);
    }
  }

  function submit() {
    const question = draft.trim().slice(0, MAX_CHARS);
    if (!question || pending) return;
    setDraft("");
    setMessages((list) => [...list, { role: "user", text: question }]);
    void ask(question);
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends; Shift+Enter starts a new line.
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <div className={`assist${open ? " is-open" : ""}`}>
      <section id="assist-window" className="assist-window" role="dialog" aria-modal="false" aria-labelledby="chat-title">
        <header className="assist-window__head">
          {/* The kid himself, as he is now: the toddler, or the doctor he has grown into. */}
          <span className="assist-window__mark" aria-hidden="true">
            <span className="assist-window__face assist-window__face--kid" />
            <span className="assist-window__face assist-window__face--doctor" />
          </span>
          <div className="assist-window__heading">
            <h2 id="chat-title">Product Assistant</h2>
            <p>Answers from our product document</p>
          </div>
          <button type="button" className="assist-window__close" aria-label="Close the chat" onClick={close}>
            <CloseIcon />
          </button>
        </header>

        <div ref={logRef} className="assist-log" role="log" aria-live="polite" aria-busy={pending} data-lenis-prevent>
          <div className="assist-msg assist-msg--assistant">
            <p>{WELCOME}</p>
          </div>

          {messages.map((message, i) =>
            message.role === "user" ? (
              <div key={i} className="assist-msg assist-msg--user">
                <p>{message.text}</p>
              </div>
            ) : (
              <div key={i} className="assist-msg assist-msg--assistant">
                <Reply reply={message.reply} />
              </div>
            ),
          )}

          {pending && (
            <div className="assist-msg assist-msg--assistant assist-typing" role="status" aria-label="Searching the product document">
              <i />
              <i />
              <i />
            </div>
          )}

          {error && (
            <div className="assist-error" role="alert">
              <p>{error.text}</p>
              <button type="button" onClick={() => void ask(error.question)}>
                Try again
              </button>
            </div>
          )}
        </div>

        <form className="assist-input" onSubmit={onSubmit}>
          <label className="sr-only" htmlFor="chat-draft">
            Your question
          </label>
          <textarea
            ref={inputRef}
            id="chat-draft"
            rows={1}
            value={draft}
            maxLength={MAX_CHARS}
            placeholder="Ask about our products…"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
          />
          <button type="submit" disabled={pending || !draft.trim()}>
            Send
          </button>
        </form>
      </section>
    </div>
  );
}
