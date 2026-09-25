import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

export default defineConfig({
  plugins: [preact()],
  build: {
    lib: {
      entry: "src/inject.tsx",
      name: "InlineChat",
      formats: ["iife"],
      fileName: () => "inline-chat.js",
    },
  },
});
