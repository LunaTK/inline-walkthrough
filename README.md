# 💬 Walkthrough Agent

Vite + Preact · AI SDK + Vercel AI Gateway

---

A single injected script adds a right-edge tab and a floating chat panel. The assistant can inspect the page with `run_javascript` and create a replayable `walkthrough`.

## Run locally

Use Node.js 22.12+ and pnpm 12.

```sh
pnpm install
cp .env.example .env
# Set AI_GATEWAY_API_KEY in .env.
pnpm dev
```

Open **http://127.0.0.1:5173**. The API listens on **127.0.0.1:3001**. Set `AI_MODEL` to another Gateway model ID if desired. Credentials stay in the Node server.

## Inject into a page

```sh
pnpm build
pnpm start
```

Set `VITE_CHAT_API_URL` in the deployment environment before building; Vite embeds it into the injected script. For another deployment, build with `VITE_CHAT_API_URL=https://your-server.example/api/chat pnpm build`. Development mode defaults to the local API. Inject the bundle using DevTools:

Deploy the **repository root** to Vercel (not `dist/`). `vercel.json` builds the Vite bundle into `dist/`; `api/chat.ts` runs the same Express app as the local server as a Vercel Function at `/api/chat`. Set `AI_GATEWAY_API_KEY` in the Vercel project's environment variables, then redeploy. The key remains server-side. Check that an `OPTIONS /api/chat` request returns `204` with `Access-Control-Allow-Origin: *` before trying the chat UI.

```js
const script = document.createElement("script");
script.src = "http://127.0.0.1:3001/inline-chat.js";
document.documentElement.append(script);
```

Or include a script tag on a page you control:

```html
<script src="http://127.0.0.1:3001/inline-chat.js"></script>
```

The build contains the UI and its CSS. Shadow DOM isolates styles; repeated injection is ignored. Set `data-api` on the script tag to override the build-time API URL when needed. Chat history stays in memory until the page reloads. Enter sends; Shift+Enter inserts a newline; Escape closes the panel.

## Tool behavior

`run_javascript` accepts `{ code: string }`. The code is an async function body with `window` and `document` access. Use an explicit `return`:

```js
const headings = [...document.querySelectorAll("h1, h2")];
return headings.map((element) => element.textContent);
```

Calls execute automatically. Expand a tool entry to inspect its code, result, or error. The assistant receives the output and continues automatically, up to 20 calls per user turn. Tool results are limited to 20,000 characters; async waits time out after 15 seconds. Stop cancels the chat request and prevents additional calls, but cannot undo or interrupt page code already running.

`walkthrough` accepts `{ title: string, code: string }`. The title appears on its script card. It does not execute automatically or return a result to the assistant. Press **Play** to run it, or press again to replay the same page-context snippet. The card shows progress and errors, and keeps the script available for inspection. Scripts can use `window`, `document`, and the injected screencast API when present.

> ℹ️ **Browser constraints** — The host page's CSP must permit the script, API connection, and dynamic JavaScript execution. HTTPS/mixed-content and local-network permissions can also restrict localhost access. This is page-context execution, not a sandbox; synchronous loops cannot be forcibly interrupted.

The server binds to loopback and allows cross-origin requests from any page. This is a local development service; deploying a public API requires authentication and usage limits. Gateway credentials must never be included in the injected bundle.

## Verify

```sh
pnpm build
pnpm exec playwright install chromium
pnpm test
```

Tests exercise the production injection bundle, DOM execution, async results, manual walkthrough replay/error retry, tool-error continuation, duplicate mounting, keyboard focus, responsive sizing, and API validation. Browser tests use an AI SDK mock model through the real API route; they require no Gateway key.
