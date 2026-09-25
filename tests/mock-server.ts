import { MockLanguageModelV3, simulateReadableStream } from "ai/test";
import { createApp } from "../server/app";

const model = new MockLanguageModelV3({
  doStream: async ({ prompt }) => {
    const hasResult = prompt.some((message) => message.role === "tool");
    const shouldFail = JSON.stringify(prompt).includes("test failure");
    const isWalkthrough = JSON.stringify(prompt).includes("make walkthrough");
    const isConfirmation = JSON.stringify(prompt).includes("test confirmation");
    const isChoice = JSON.stringify(prompt).includes("test choice");
    const failFirstPlay = JSON.stringify(prompt).includes("fail once");
    const showThinking = JSON.stringify(prompt).includes("test thinking");
    const result = JSON.stringify(prompt.filter((message) => message.role === "tool"));
    return {
      stream: simulateReadableStream({
        initialDelayInMs: showThinking ? 900 : undefined,
        chunks: [
          { type: "stream-start", warnings: [] },
          ...(hasResult
            ? [
                { type: "text-start" as const, id: "text-1" },
                { type: "text-delta" as const, id: "text-1", delta: `Result received: ${result}` },
                { type: "text-delta" as const, id: "text-1", delta: "\n\n**Markdown" },
                {
                  type: "text-delta" as const,
                  id: "text-1",
                  delta: " works**\n\n- one\n- two\n\n`inline code`",
                },
                { type: "text-end" as const, id: "text-1" },
              ]
            : [
                isWalkthrough
                  ? {
                      type: "tool-call" as const,
                      toolCallId: "walkthrough-1",
                      toolName: "walkthrough",
                      input: JSON.stringify({
                        title: "Explore this page",
                        code: `await Promise.resolve(); window.__walkthroughPlays = (window.__walkthroughPlays ?? 0) + 1; ${failFirstPlay ? 'if (window.__walkthroughPlays === 1) throw new Error("Try again");' : ""} document.querySelector("h1").textContent = \`Played \${window.__walkthroughPlays} \${window.__walkthroughPlays === 1 ? 'time' : 'times'}\`;`,
                      }),
                    }
                    : isConfirmation
                      ? {
                          type: "tool-call" as const,
                          toolCallId: "confirmation-1",
                          toolName: "ask_user_choices",
                          input: JSON.stringify({
                            question: "Allow navigation away from this page?",
                            choices: ["Yes", "No"],
                          }),
                      }
                    : isChoice
                      ? {
                          type: "tool-call" as const,
                          toolCallId: "choice-1",
                          toolName: "ask_user_choices",
                          input: JSON.stringify({
                            question: "Which feature should I demonstrate?",
                            choices: ["Search", "Save", "Share"],
                          }),
                        }
                    : {
                      type: "tool-call" as const,
                      toolCallId: "run-javascript-1",
                      toolName: "run_javascript",
                      input: JSON.stringify({
                        code: shouldFail
                          ? 'throw new Error("test boom")'
                          : 'document.querySelector("h1").textContent = "Changed by JavaScript"; return await Promise.resolve(document.title);',
                      }),
                    },
              ]),
          {
            type: "finish",
            finishReason: { unified: hasResult ? "stop" : "tool-calls", raw: undefined },
            usage: {
              inputTokens: { total: 1, noCache: 1, cacheRead: undefined, cacheWrite: undefined },
              outputTokens: { total: 1, text: 1, reasoning: undefined },
            },
          },
        ],
      }),
    };
  },
});
createApp(model).listen(3101, "127.0.0.1");
