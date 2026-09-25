import { useEffect, useState } from "preact/hooks";

declare global {
  var __screencastCamera: any;
}

type Status = "ready" | "loading" | "error";

const LABEL_MAP = {
  ready: "Guide UI Ready",
  loading: "Guide UI Loading...",
  error: "Guide UI Error",
} as const;

export function ScreencastStatus({ api }: { api: string }) {
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let active = true;
    setStatus("loading");
    load(api)
      .then(() => {
        if (active) setStatus("ready");
      })
      .catch(() => {
        if (active) setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [api]);

  return (
    <span class={`page-badge ${status}`} role="status" aria-live="polite">
      {LABEL_MAP[status]}
    </span>
  );
}

async function load(api: string) {
  if (!globalThis.__screencastCamera) {
    const asset = new URL("/screencast-camera.js", api);
    await import(/* @vite-ignore */ asset.href);
  }
  if (!globalThis.__screencastCamera) {
    throw new Error("Screencast camera not loaded");
  }
  globalThis.__screencastCamera.clear();
}
