import { Fragment, useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { lockScroll } from "../../motion/lenis";
import { askAssistant, ChatError, type ChatMessage } from "../chat/api";
import { BrandText } from "./BrandText";
import { Link } from "./Link";
import "./chat.css";

const SUGGESTIONS = [
  "What products do you offer?",
  "Compare the Surgical Assistant and the Slit Lamp Module",
  "Which product suits an eye clinic?",
  "How do I get pricing or a demo?",
];

const MAX_CHARS = 1000;
const STORE = "cv-chat";
const PHONE = "(max-width: 600px)";

function loadHistory(): ChatMessage[] {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORE) ?? "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

/** **bold** and [links](/path) inside one line of an answer. */
function inline(text: string, onNavigate: () => void): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g);
  return parts.map((part, i) => {
    const bold = part.match(/^\*\*([^*]+)\*\*$/);
    if (bold) return <strong key={i}>{bold[1]}</strong>;
    const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    // Only the site's own pages: the server already drops any other URL.
    if (link && link[2].startsWith("/") && !link[2].startsWith("//")) {
      return (
        <Link key={i} href={link[2]} onClick={onNavigate}>
          {link[1]}
        </Link>
      );
    }
    return <Fragment key={i}>{link ? link[1] : part}</Fragment>;
  });
}

/** An answer's paragraphs and "- " bullet lists. */
function Answer({ text, onNavigate }: { text: string; onNavigate: () => void }) {
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (!list.length) return;
    blocks.push(
      <ul key={blocks.length}>
        {list.map((item, i) => (
          <li key={i}>{inline(item, onNavigate)}</li>
        ))}
      </ul>,
    );
    list = [];
  };
  for (const line of text.split("\n")) {
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    if (bullet) list.push(bullet[1]);
    else {
      flush();
      if (line.trim()) blocks.push(<p key={blocks.length}>{inline(line, onNavigate)}</p>);
    }
  }
  flush();
  return <>{blocks}</>;
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H11l-4.6 3.8c-.5.4-1.2 0-1.2-.6V16h0A2.5 2.5 0 0 1 4 13.5Z" />
      <path className="assist-icon__spark" d="M9 9.5h.01M12 9.5h.01M15 9.5h.01" />
    </svg>
  );
}

function RestartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4v4h4" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

/**
 * The site's AI assistant: a launcher in the bottom-right corner that opens
 * a chat window. Answers come from server/assistant.ts, grounded in the same
 * product data the pages show.
 */
export function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(loadHistory);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const request = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORE, JSON.stringify(messages.slice(-30)));
    } catch {
      // Private mode or storage blocked: the conversation just won't survive a reload.
    }
  }, [messages]);

  // Always show the latest message (and the typing indicator or error).
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
    setOpen(false);
    launcherRef.current?.focus({ preventScroll: true });
  }

  async function send(history: ChatMessage[]) {
    setMessages(history);
    setPending(true);
    setError(null);
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    try {
      const { reply, sources } = await askAssistant(history, controller.signal);
      setMessages([...history, { role: "assistant", content: reply, sources }]);
    } catch (failure) {
      if ((failure as Error).name === "AbortError") return;
      setError(failure instanceof ChatError ? failure.message : "The assistant couldn't answer just now. Please try again.");
    } finally {
      if (request.current === controller) setPending(false);
    }
  }

  function submit(text: string) {
    const question = text.trim().slice(0, MAX_CHARS);
    if (!question || pending) return;
    setDraft("");
    void send([...messages, { role: "user", content: question }]);
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit(draft);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends; Shift+Enter starts a new line.
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit(draft);
    }
  };

  // Following a link on a phone shows the page, not the chat on top of it.
  const onNavigate = () => {
    if (window.matchMedia(PHONE).matches) setOpen(false);
  };

  const restart = () => {
    request.current?.abort();
    setPending(false);
    setError(null);
    setMessages([]);
    inputRef.current?.focus();
  };

  const lastUser = messages[messages.length - 1]?.role === "user";

  return (
    <div className={`assist${open ? " is-open" : ""}`}>
      <button
        ref={launcherRef}
        type="button"
        className="assist-launcher"
        aria-label="Chat with the ChakraVue AI assistant"
        aria-expanded={open}
        aria-controls="assist-window"
        onClick={() => (open ? close() : setOpen(true))}
      >
        <span className="assist-icon">{open ? <CloseIcon /> : <ChatIcon />}</span>
      </button>

      <section id="assist-window" className="assist-window" role="dialog" aria-modal="false" aria-labelledby="chat-title">
        <header className="assist-window__head">
          <span className="assist-window__mark" aria-hidden="true">
            <ChatIcon />
          </span>
          <div className="assist-window__heading">
            <h2 id="chat-title">
              <BrandText text="ChakraVue AI Assistant" />
            </h2>
            <p>Answers from our product pages</p>
          </div>
          {messages.length > 0 && (
            <button type="button" className="assist-window__close" aria-label="Start a new chat" title="New chat" onClick={restart}>
              <RestartIcon />
            </button>
          )}
          <button type="button" className="assist-window__close" aria-label="Close the chat" onClick={close}>
            <CloseIcon />
          </button>
        </header>

        <div ref={logRef} className="assist-log" role="log" aria-live="polite" aria-busy={pending} data-lenis-prevent>
          <div className="assist-msg assist-msg--assistant">
            <p>
              Hi! 👋 I'm the <BrandText text="ChakraVue AI" /> assistant. Ask me anything about our products and services, and I'll help you find
              what you're looking for.
            </p>
          </div>

          {messages.length === 0 && (
            <div className="assist-suggest" aria-label="Suggested questions">
              {SUGGESTIONS.map((suggestion) => (
                <button key={suggestion} type="button" onClick={() => submit(suggestion)}>
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {messages.map((message, i) =>
            message.role === "user" ? (
              <div key={i} className="assist-msg assist-msg--user">
                <p>{message.content}</p>
              </div>
            ) : (
              <div key={i} className="assist-msg assist-msg--assistant">
                <Answer text={message.content} onNavigate={onNavigate} />
                {!!message.sources?.length && (
                  <ul className="assist-sources" aria-label="Pages mentioned">
                    {message.sources.map((source) => (
                      <li key={source.url}>
                        <Link href={source.url} onClick={onNavigate}>
                          <small>{source.kind}</small>
                          <span>
                            <BrandText text={source.name} />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ),
          )}

          {pending && (
            <div className="assist-msg assist-msg--assistant assist-typing" aria-label="The assistant is typing">
              <i />
              <i />
              <i />
            </div>
          )}

          {error && (
            <div className="assist-error" role="alert">
              <p>{error}</p>
              {lastUser && (
                <button type="button" onClick={() => void send(messages)}>
                  Try again
                </button>
              )}
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
        <p className="assist-note">
          AI answers can be wrong. For quotes or demos, <Link href="/contact-us" onClick={onNavigate}>contact us</Link>.
        </p>
      </section>
    </div>
  );
}
