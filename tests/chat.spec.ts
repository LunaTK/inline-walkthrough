import { test, expect } from "@playwright/test";
import vercelApp from "../api/chat";

test("production injection, run_javascript, continuation, focus, and responsive panel", async ({
  page,
}) => {
  await page.goto("/");
  // Replace the dev widget with the actual production artifact.
  await page.locator("#inline-chat-root").evaluate((el) => el.remove());
  await page.evaluate(async () => {
    for (let i = 0; i < 2; i++) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "http://127.0.0.1:3101/inline-chat.js";
        script.dataset.api = "http://127.0.0.1:3101/api/chat";
        script.onload = () => resolve();
        script.onerror = reject;
        document.head.append(script);
      });
    }
  });
  await expect(page.locator("#inline-chat-root")).toHaveCount(1);
  const drawer = page.locator("#inline-chat-root .drawer");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("status")).toHaveText("Guide UI Ready");
  await expect(drawer).toBeHidden();
  await page.getByRole("button", { name: "Close chat" }).click();
  await expect(drawer).toBeVisible();
  await expect(drawer).toContainText("Agent");
  await drawer.click();
  await expect(drawer).toBeHidden();
  await expect(page.getByRole("dialog")).toContainText("Walkthrough Agent");
  await expect(page.getByRole("dialog")).not.toContainText("YOUR PAGE ASSISTANT");
  await expect(page.getByRole("dialog")).not.toContainText("JAVASCRIPT · THIS PAGE");
  await expect(page.locator("#inline-chat-root .panel-header canvas")).toBeVisible();
  await expect
    .poll(() =>
      page.locator("#inline-chat-root .panel-header canvas").evaluate((canvas) => {
        const element = canvas as HTMLCanvasElement;
        const pixels = element
          .getContext("2d")
          ?.getImageData(0, 0, element.width, element.height).data;
        return pixels ? pixels.some((_, index) => index % 4 === 3 && pixels[index] > 0) : false;
      }),
    )
    .toBe(true);
  await expect(page.locator("#inline-chat-root [data-beam]")).toHaveCount(0);
  await expect(page.getByRole("dialog")).toHaveCSS("background-color", "rgb(18, 18, 18)");
  await expect(page.getByRole("textbox", { name: "Message" })).toBeFocused();
  await expect(page.getByRole("textbox", { name: "Message" })).toHaveCSS("outline-style", "none");
  await page.getByRole("textbox", { name: "Message" }).fill("Change the heading");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Changed by JavaScript");
  await expect(page.getByText(/Result received:/)).toContainText("Inline chat playground");
  await expect(page.locator("summary")).toContainText("run_javascript");
  const tool = page.locator("details.tool");
  await expect(tool).not.toHaveAttribute("open", "");
  await expect(tool).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(tool).toHaveCSS("border-top-width", "0px");
  await expect(tool.locator("summary")).toHaveCSS("color", "rgb(133, 133, 133)");
  await expect(tool.locator("summary span")).toHaveCSS("color", "rgb(85, 207, 255)");
  await expect(tool.locator("summary")).toHaveCSS("list-style-type", "none");
  await expect(tool.locator(".disclosure-chevron")).toHaveCSS("transform", "none");
  await tool.locator("summary").click();
  await expect(tool.locator(".disclosure-chevron")).toHaveCSS(
    "transform",
    "matrix(0, 1, -1, 0, 0, 0)",
  );
  await expect(tool.locator("pre")).toHaveCount(2);
  await expect(tool.locator("pre").first()).toBeVisible();
  const reply = page.locator("#inline-chat-root").locator(".message.assistant");
  await expect(reply.locator('[data-streamdown="strong"]')).toHaveText("Markdown works");
  await expect(reply.locator('[data-streamdown="strong"]')).toHaveCSS("font-weight", "700");
  await expect(reply.locator("li")).toHaveText(["one", "two"]);
  await expect(reply.locator("code")).toContainText("inline code");
  await page.getByRole("textbox", { name: "Message" }).press("Escape");
  await expect(drawer).toBeVisible();
  await expect(drawer).toBeFocused();
  await drawer.click();
  await expect(page.getByText("Change the heading", { exact: true })).toBeVisible();
  for (const width of [320, 375, 414, 768]) {
    await page.setViewportSize({ width, height: 800 });
    const box = await page.getByRole("dialog").boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    const inset = width <= 520 ? 12 : 24;
    expect(Math.round(width - box!.x - box!.width)).toBe(inset);
    expect(Math.round(800 - box!.y - box!.height)).toBe(inset);
  }
  await page.getByRole("button", { name: "Close chat" }).click();
  await expect(drawer).toBeVisible();
  await expect(drawer).toBeFocused();
});

for (const answer of ["Yes", "No"] as const) {
  test(`navigation approval choice returns ${answer}`, async ({ page }) => {
    await page.goto("/");
    await page.getByRole("textbox", { name: "Message" }).fill("test confirmation");
    await page.getByRole("button", { name: "Send" }).click();

    const choice = page.locator(".user-choice");
    await expect(choice).toContainText("Allow navigation away from this page?");
    await page.getByRole("button", { name: answer, exact: true }).click();
    await expect(choice).toContainText(`You chose ${answer}.`);
    await expect(page.getByText(/Result received:/)).toContainText(`"${answer}"`);
  });
}

test("choice tool returns the selected option", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("textbox", { name: "Message" }).fill("test choice");
  await page.getByRole("button", { name: "Send" }).click();

  const choice = page.locator(".user-choice");
  await expect(choice).toContainText("Which feature should I demonstrate?");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(choice).toContainText("You chose Save.");
  await expect(page.getByText(/Result received:/)).toContainText('"Save"');
});

test("onboarding preset uses a distinct message from its label", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "주요 기능 3가지를 살펴보고 하나를 시연해줘" })
    .click();
  await expect(page.getByRole("textbox", { name: "Message" })).toHaveValue(
    "현재 페이지의 주요 기능 3가지를 파악해 간단히 소개한 다음, ask_user_choices 도구로 walkthrough를 보고 싶은 기능 하나를 선택하게 해주세요. 선택한 기능을 walkthrough로 보여주세요.",
  );
});

test("execution errors are returned to the assistant", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("textbox", { name: "Message" }).fill("test failure");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByText(/Result received:/)).toContainText("test boom");
  await expect(page.locator("summary")).toContainText("Failed");
});

test("thinking state shimmers until the response arrives", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("textbox", { name: "Message" }).fill("test thinking");
  await page.getByRole("button", { name: "Send" }).click();
  const thinking = page.getByRole("status").getByText("Thinking…");
  await expect(thinking).toBeVisible();
  await expect(page.getByRole("button", { name: "Stop" }).locator("svg")).toBeVisible();
  await expect(thinking).toHaveCSS("animation-name", "thinking-shimmer");
  await expect(thinking).toHaveCSS("background-clip", "text");
  await page.getByRole("button", { name: "Close chat" }).click();
  const drawer = page.getByRole("button", { name: "Working..." });
  await expect(drawer.locator("canvas")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Changed by JavaScript");
  await expect(thinking).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Agent" })).toBeVisible();
});

test("walkthrough is not auto-run and can be played repeatedly", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("textbox", { name: "Message" }).fill("make walkthrough");
  await page.getByRole("button", { name: "Send" }).click();

  const play = page.getByRole("button", { name: "Play walkthrough", exact: true });
  await expect(play).toBeEnabled();
  await expect(page.locator(".walkthrough strong")).toHaveText("Explore this page");
  const script = page.locator(".walkthrough details");
  await expect(script.locator(".disclosure-chevron")).toBeVisible();
  await script.locator("summary").click();
  await expect(script.locator("pre")).toBeVisible();
  await expect(page.getByText(/Result received:/)).toContainText('"value":null');
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Your page. A conversation away.",
  );
  expect(await page.evaluate(() => (window as any).__walkthroughPlays)).toBeUndefined();

  await play.click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Played 1 time");
  await page.getByRole("button", { name: "Agent" }).click();
  await page.getByRole("button", { name: "Play walkthrough again" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Played 2 times");
  await expect(page.getByText("Played 2 times", { exact: true })).toHaveCount(2);
});

test("walkthrough play error can be retried", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("textbox", { name: "Message" }).fill("make walkthrough fail once");
  await page.getByRole("button", { name: "Send" }).click();
  const play = page.getByRole("button", { name: "Play walkthrough", exact: true });
  await expect(play).toBeEnabled();
  await play.click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await page.getByRole("button", { name: "Agent" }).click();
  await expect(page.getByRole("alert")).toContainText("Try again");
  await play.click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Played 2 times");
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("page listeners do not intercept typing in the chat input", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    (window as any).__pageKeys = 0;
    for (const target of [document, window]) {
      target.addEventListener("keydown", (event: Event) => {
        (window as any).__pageKeys++;
        event.preventDefault();
      });
      target.addEventListener("input", () => {
        (window as any).__pageKeys++;
      });
    }
  });
  const composer = page.getByRole("textbox", { name: "Message" });
  await composer.pressSequentially("hello page");
  await expect(composer).toHaveValue("hello page");
  expect(await page.evaluate(() => (window as any).__pageKeys)).toBe(0);
});

test("dragging the corner handle resizes the chat panel", async ({ page }) => {
  await page.goto("/");
  await page.setViewportSize({ width: 1280, height: 900 });
  const handle = page.getByRole("separator", { name: "Drag to resize chat" });
  const before = (await page.getByRole("dialog").boundingBox())!;
  const box = (await handle.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x - 100, box.y - 80, { steps: 8 });
  await page.mouse.up();
  const after = (await page.getByRole("dialog").boundingBox())!;
  expect(after.width).toBeGreaterThan(before.width + 80);
  expect(after.height).toBeGreaterThan(before.height + 60);
  await expect(page.getByRole("textbox", { name: "Message" })).toBeVisible();
});

test("API rejects invalid messages and allows cross-origin requests", async ({ request }) => {
  const invalid = await request.post("http://127.0.0.1:3101/api/chat", {
    data: { messages: [{}] },
  });
  expect(invalid.status()).toBe(400);
  const response = await request.post("http://127.0.0.1:3101/api/chat", {
    headers: { Origin: "https://unlisted.example" },
    data: { messages: [] },
  });
  expect(response.status()).toBe(400);
  expect(response.headers()["access-control-allow-origin"]).toBe("*");
  const preflight = await request.fetch("http://127.0.0.1:3101/api/chat", {
    method: "OPTIONS",
    headers: {
      Origin: "https://unlisted.example",
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "content-type",
    },
  });
  expect(preflight.status()).toBe(204);
  expect(preflight.headers()["access-control-allow-origin"]).toBe("*");
  expect(preflight.headers()["access-control-allow-headers"]).toContain("content-type");
});

test("Vercel entrypoint serves the Express chat route and CORS preflight", async ({ request }) => {
  const server = vercelApp.listen(0, "127.0.0.1");
  try {
    await new Promise<void>((resolve) => server.once("listening", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Server did not bind a port");
    const url = `http://127.0.0.1:${address.port}/api/chat`;
    const headers = {
      Origin: "https://example.com",
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "content-type",
    };
    const preflight = await request.fetch(url, { method: "OPTIONS", headers });
    expect(preflight.status()).toBe(204);
    expect(preflight.headers()["access-control-allow-origin"]).toBe("*");
    const invalid = await request.post(url, {
      headers: { Origin: headers.Origin },
      data: { messages: [] },
    });
    expect(invalid.status()).toBe(400);
    expect(invalid.headers()["access-control-allow-origin"]).toBe("*");
  } finally {
    server.close();
  }
});
