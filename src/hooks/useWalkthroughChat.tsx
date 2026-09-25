import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
  type UIDataTypes,
  type UIMessage,
} from "ai";
import { useMemo, useRef, useState } from "preact/hooks";
import type { UITools } from "../../server/app";
import { executeSnippet } from "../lib/eval";

const MAX_TOOL_CALLS = 50;

export function useWalkthroughChat(api: string) {
  const [limitReached, setLimitReached] = useState(false);
  const calls = useRef(0);
  const cancelled = useRef(false);
  const transport = useMemo(() => new DefaultChatTransport({ api }), [api]);
  const { messages, sendMessage, addToolOutput, status, error, stop, regenerate, clearError } =
    useChat<UIMessage<unknown, UIDataTypes, UITools>>({
      transport,
      sendAutomaticallyWhen: (options) =>
        !cancelled.current &&
        calls.current < MAX_TOOL_CALLS &&
        lastAssistantMessageIsCompleteWithToolCalls(options),
      async onToolCall({ toolCall }) {
        if (
          toolCall.dynamic ||
          (toolCall.toolName !== "run_javascript" &&
            toolCall.toolName !== "walkthrough" &&
            toolCall.toolName !== "ask_user_choices")
        )
          return;
        const toolCallId = toolCall.toolCallId;
        try {
          if (cancelled.current) throw new Error("Execution stopped.");
          if (calls.current >= MAX_TOOL_CALLS)
            throw new Error("Tool limit reached. Send a new message to continue.");
          calls.current++;
          if (calls.current === MAX_TOOL_CALLS) setLimitReached(true);
          if (toolCall.toolName === "walkthrough") {
            // Ack the tool protocol without executing the snippet; Play owns execution.
            void addToolOutput({ tool: "walkthrough", toolCallId, output: null });
            return;
          }
          if (toolCall.toolName === "ask_user_choices") return;
          const { code } = toolCall.input;
          const output = await executeSnippet(code);
          void addToolOutput({ tool: "run_javascript", toolCallId, output });
        } catch (error) {
          void addToolOutput({
            tool: toolCall.toolName,
            toolCallId,
            state: "output-error",
            errorText: error instanceof Error ? error.message : String(error),
          });
        }
      },
    });
  const busy = status === "submitted" || status === "streaming";

  function resetRun() {
    calls.current = 0;
    cancelled.current = false;
    setLimitReached(false);
    clearError();
  }

  function send(text: string) {
    resetRun();
    void sendMessage({ text });
  }

  function stopRun() {
    cancelled.current = true;
    void stop();
  }

  function answerChoice(toolCallId: string, choice: string) {
    void addToolOutput({ tool: "ask_user_choices", toolCallId, output: choice });
  }

  function retry() {
    resetRun();
    void regenerate();
  }

  return {
    messages,
    status,
    error,
    busy,
    limitReached,
    send,
    stopRun,
    retry,
    answerChoice,
  };
}
