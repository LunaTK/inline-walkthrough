import { defineConfig } from "@playwright/test";

const port = Number(process.env.PLAYWRIGHT_PORT ?? 5174);

export default defineConfig({
  testDir: "./tests",
  use: { baseURL: `http://127.0.0.1:${port}`, headless: true },
  webServer: [
    {
      command: `pnpm exec vite --host 127.0.0.1 --port ${port} --strictPort`,
      url: `http://127.0.0.1:${port}`,
      env: { VITE_CHAT_API_URL: "http://127.0.0.1:3101/api/chat" },
    },
    { command: "pnpm exec tsx tests/mock-server.ts", url: "http://127.0.0.1:3101/inline-chat.js" },
  ],
});
