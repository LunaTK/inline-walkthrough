import { useState } from "preact/hooks";
import { executeSnippet } from "../../lib/eval";

export function WalkthroughTool({
  title,
  code,
  ready,
  error: toolError,
  onPlay,
}: {
  title?: string;
  code?: string;
  ready: boolean;
  error?: string;
  onPlay: () => void;
}) {
  const [running, setRunning] = useState(false);
  const [plays, setPlays] = useState(0);
  const [error, setError] = useState<string>();

  async function play() {
    if (!code || running) return;
    onPlay();
    setRunning(true);
    setError(undefined);
    try {
      await executeSnippet(code);
      setPlays((count) => count + 1);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setRunning(false);
    }
  }

  return (
    <div class="walkthrough" aria-label="Walkthrough">
      <div class="walkthrough-row">
        <div>
          <strong>{title || "Walkthrough"}</strong>
          <small>
            {running
              ? "Playing…"
              : plays
                ? `Played ${plays} ${plays === 1 ? "time" : "times"}`
                : "Ready to play"}
          </small>
        </div>
        <button
          type="button"
          onClick={play}
          disabled={!ready || !code || running}
          aria-label={plays ? "Play walkthrough again" : "Play walkthrough"}
        >
          {running ? "Playing…" : plays ? "↻ Play again" : "▶ Play"}
        </button>
      </div>
      <details>
        <summary>
          <svg
            class="disclosure-chevron"
            aria-hidden="true"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m6 3 5 5-5 5" />
          </svg>
          View script
        </summary>
        <pre>{code ?? "Preparing JavaScript…"}</pre>
      </details>
      {(error || toolError) && <p role="alert">{error ?? toolError}</p>}
    </div>
  );
}
