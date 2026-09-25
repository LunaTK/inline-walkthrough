import { expect, test } from "vitest";
import { executeSnippet } from "./eval";

test("executes async snippets and handles non-JSON results and errors", async () => {
  expect(await executeSnippet("return await Promise.resolve(42)")).toBe("42");
  expect(await executeSnippet("return undefined")).toBe("undefined");
  expect(await executeSnippet("return 12n")).toBe('"12"');
  expect(await executeSnippet("const a = {}; a.self = a; return a")).toMatch(/Circular/);
  expect(await executeSnippet('return "a".repeat(30000)')).toMatch(/truncated/);
  await expect(executeSnippet('throw new Error("boom")')).rejects.toThrow("boom");
  await expect(executeSnippet("return }")).rejects.toThrow(SyntaxError);
  await expect(executeSnippet("")).rejects.toThrow("Expected JavaScript");
});
