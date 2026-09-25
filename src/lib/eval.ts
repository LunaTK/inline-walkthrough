export async function executeSnippet(code: string): Promise<string> {
  if (typeof code !== "string" || !code.trim() || code.length > 20000) {
    throw new Error("Expected JavaScript code between 1 and 20000 characters.");
  }
  // Page-context execution is intentional. CSP applies; synchronous code cannot be interrupted.
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const value = await Promise.race([
      new AsyncFunction(code)(),
      new Promise((_, reject) => {
        timer = setTimeout(
          () =>
            reject(
              new Error("Snippet exceeded 60 seconds. Pending page operations may still finish."),
            ),
          60000,
        );
      }),
    ]);
    const seen = new WeakSet<object>();
    const text =
      JSON.stringify(value, (_, item) => {
        if (typeof item === "bigint") return String(item);
        if (typeof item === "function" || typeof item === "symbol") return String(item);
        if (item && typeof item === "object") {
          if (seen.has(item)) return "[Circular or repeated reference]";
          seen.add(item);
        }
        return item;
      }) ?? String(value);
    return text.length > 20000 ? `${text.slice(0, 20000)}… [truncated]` : text;
  } finally {
    clearTimeout(timer);
  }
}
