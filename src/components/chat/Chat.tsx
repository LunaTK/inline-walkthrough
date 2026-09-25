import { useEffect, useRef, useState } from "preact/hooks";
import { Streamdown } from "streamdown";
import { BotAvatar } from "bot-avatars";
import { ThinkingOrb } from "thinking-orbs";
import { ScreencastStatus } from "../ScreencastStatus";
import { AskUserChoice } from "../tools/AskUserChoice";
import { RunJavascriptTool } from "../tools/RunJavascriptTool";
import { WalkthroughTool } from "../tools/WalkthroughTool";
import { useDragToResize } from "../../hooks/useDragToResize";
import { useWalkthroughChat } from "../../hooks/useWalkthroughChat";
import { Onboarding } from "./Onboarding";

export function ChatPanel({ api }: { api: string }) {
  const [open, setOpen] = useState(true);
  const [input, setInput] = useState("");
  const drawer = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);
  const { size, startResize } = useDragToResize(panel);
  const composer = useRef<HTMLTextAreaElement>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const {
    messages,
    status,
    error,
    busy,
    limitReached,
    send: sendChatMessage,
    stopRun,
    retry,
    answerChoice,
  } = useWalkthroughChat(api);
  useEffect(() => {
    if (open) composer.current?.focus();
  }, [open]);
  useEffect(() => {
    if (open) bottom.current?.scrollIntoView({ block: "nearest" });
  }, [messages, status, open]);
  function close() {
    setOpen(false);
    requestAnimationFrame(() => drawer.current?.focus());
  }
  function send() {
    if (!input.trim() || busy) return;
    sendChatMessage(input.trim());
    setInput("");
  }
  return (
    <>
      <button
        ref={drawer}
        class="drawer"
        aria-expanded={open}
        aria-controls="inline-chat-panel"
        onClick={() => (open ? close() : setOpen(true))}
      >
        {busy ? (
          <ThinkingOrb state="working" size={20} theme="dark" aria-hidden="true" />
        ) : (
          <span class="drawer-mark" aria-hidden="true">
            ✳
          </span>
        )}
        {busy ? "Working..." : "Agent"}
        <span class="drawer-arrow" aria-hidden="true">
          {open ? "›" : "‹"}
        </span>
      </button>
      <section
        ref={panel}
        id="inline-chat-panel"
        class="panel"
        hidden={!open}
        style={size ? { width: `${size.width}px`, height: `${size.height}px` } : undefined}
        role="dialog"
        aria-label="Page assistant"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            close();
          }
        }}
      >
        <div
          class="resize"
          role="separator"
          aria-label="Drag to resize chat"
          onPointerDown={startResize}
        />
        <header class="panel-header">
          <BotAvatar
            type="clover"
            state={busy ? "working" : "default"}
            size={40}
            theme="dark"
            paused={!open}
            interactive={false}
          />
          <div class="panel-title">
            <strong>Walkthrough Agent</strong>
          </div>
          <ScreencastStatus api={api} />
          <button class="icon" onClick={close} aria-label="Close chat">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            >
              <path d="m18 6-12 12M6 6l12 12" />
            </svg>
          </button>
        </header>
        <div class="messages" role="log" aria-live="polite" aria-relevant="additions text">
          {!messages.length && (
            <Onboarding
              onSelect={(prompt) => {
                setInput(prompt);
                composer.current?.focus();
              }}
            />
          )}
          {messages.map((message) => (
            <article class={`message ${message.role}`} key={message.id}>
              <span class="author">{message.role === "user" ? "You" : "Assistant"}</span>
              {message.parts.map((part, index) => {
                if (part.type === "text")
                  return message.role === "assistant" ? (
                    <Streamdown
                      key={index}
                      className="markdown"
                      skipHtml
                      controls={false}
                      linkSafety={{ enabled: false }}
                      isAnimating={busy && message.id === messages.at(-1)?.id}
                    >
                      {part.text}
                    </Streamdown>
                  ) : (
                    <p key={index}>{part.text}</p>
                  );
                if (part.type === "tool-run_javascript")
                  return (
                    <RunJavascriptTool
                      key={index}
                      state={part.state}
                      code={part.input?.code}
                      output={part.output}
                      error={part.errorText}
                    />
                  );
                if (part.type === "tool-walkthrough")
                  return (
                    <WalkthroughTool
                      key={part.toolCallId}
                      title={part.input?.title}
                      code={part.input?.code}
                      ready={part.state === "output-available"}
                      error={part.state === "output-error" ? part.errorText : undefined}
                      onPlay={close}
                    />
                  );
                if (part.type === "tool-ask_user_choices")
                  return (
                    <AskUserChoice
                      key={part.toolCallId}
                      question={part.input?.question}
                      choices={part.input?.choices?.flatMap((choice) =>
                        typeof choice === "string" ? [choice] : [],
                      )}
                      state={part.state}
                      answer={part.output}
                      error={part.state === "output-error" ? part.errorText : undefined}
                      onChoose={(choice) => answerChoice(part.toolCallId, choice)}
                    />
                  );
                return null;
              })}
            </article>
          ))}
          {busy && (
            <p class="status" role="status">
              <span class="thinking-shimmer">Thinking…</span>
            </p>
          )}
          {limitReached && <p class="status">Tool limit reached. Send a message to continue.</p>}
          {error && (
            <div class="error" role="alert">
              <p>{error.message}</p>
              <button
                onClick={() => {
                  retry();
                }}
              >
                Retry
              </button>
            </div>
          )}
          <div ref={bottom} />
        </div>
        <div class="composer-wrap">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              send();
            }}
          >
            <textarea
              ref={composer}
              aria-label="Message"
              placeholder="Ask about this page…"
              rows={3}
              value={input}
              onInput={(event) => setInput(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
                  event.preventDefault();
                  send();
                }
              }}
            />
            <div class="compose-footer">
              {busy ? (
                <button type="button" class="icon-action" aria-label="Stop" onClick={stopRun}>
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                </button>
              ) : (
                <button
                  type="submit"
                  class="icon-action"
                  aria-label="Send"
                  disabled={!input.trim()}
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M12 19V5m-6 6 6-6 6 6" />
                  </svg>
                </button>
              )}
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
