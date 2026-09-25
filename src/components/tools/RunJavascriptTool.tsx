export function RunJavascriptTool({
  state,
  code,
  output,
  error,
}: {
  state: string;
  code?: string;
  output?: unknown;
  error?: string;
}) {
  return (
    <details class="tool" data-state={state}>
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
        run_javascript{" "}
        <span>
          {state === "output-available"
            ? "Complete"
            : state === "output-error"
              ? "Failed"
              : "Running…"}
        </span>
      </summary>
      <pre>{code ?? "Preparing JavaScript…"}</pre>
      {state === "output-available" && <pre>{String(output)}</pre>}
      {state === "output-error" && <p role="alert">{error}</p>}
    </details>
  );
}
