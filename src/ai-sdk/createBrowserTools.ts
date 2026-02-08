/**
 * Vercel AI SDK tools for agent-browser-io.
 * Use with generateText({ tools: createBrowserTools(browser), ... }).
 * Call the launch tool before other actions if the browser is not yet running.
 */

import { tool } from "ai";
import { z } from "zod";
import type { IAgentBrowser } from "../core/agent-browser/agent-browser.js";

function wrapExecute<T>(
  browser: IAgentBrowser,
  fn: (browser: IAgentBrowser, args: T) => Promise<string>
): (args: T, _options?: unknown) => Promise<string> {
  return async (args: T) => {
    try {
      return await fn(browser, args);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return `Error: ${message}`;
    }
  };
}

/**
 * Creates a set of Vercel AI SDK–compatible tools that control the given browser instance.
 * Pass the result to generateText({ tools: createBrowserTools(browser), ... }).
 * The model should call the launch tool first before other actions.
 */
export function createBrowserTools(browser: IAgentBrowser) {
  return {
    launch: tool({
      description:
        "Launch the browser (idempotent). Call before other actions if the browser is not yet running.",
      inputSchema: z.object({}),
      execute: wrapExecute(browser, async (b) => {
        await b.launch();
        return "Browser launched.";
      }),
    }),

    navigate: tool({
      description: "Navigate to a URL and apply the wireframe normalizer.",
      inputSchema: z.object({
        url: z.string().describe("URL to open"),
      }),
      execute: wrapExecute(browser, async (b, { url }) => {
        await b.navigate(url);
        return `Navigated to ${url}`;
      }),
    }),

    getWireframe: tool({
      description:
        "Return the ASCII wireframe of the current page. Use ref IDs from this output for click, type, fill, etc.",
      inputSchema: z.object({}),
      execute: wrapExecute(browser, async (b) => {
        const wireframe = await b.getWireframe();
        return wireframe || "(empty wireframe)";
      }),
    }),

    click: tool({
      description: "Click the element with the given ref ID (from the wireframe).",
      inputSchema: z.object({
        ref: z.string().describe("Element ref ID from wireframe"),
      }),
      execute: wrapExecute(browser, async (b, { ref }) => {
        await b.click(ref);
        return `Clicked ref ${ref}`;
      }),
    }),

    type: tool({
      description: "Type text into the element with the given ref ID.",
      inputSchema: z.object({
        ref: z.string().describe("Element ref ID from wireframe"),
        text: z.string().describe("Text to type"),
      }),
      execute: wrapExecute(browser, async (b, { ref, text }) => {
        await b.type(ref, text);
        return `Typed into ref ${ref}`;
      }),
    }),

    fill: tool({
      description: "Clear and fill the element (by ref) with the given text.",
      inputSchema: z.object({
        ref: z.string().describe("Element ref ID from wireframe"),
        text: z.string().describe("Text to fill"),
      }),
      execute: wrapExecute(browser, async (b, { ref, text }) => {
        await b.fill(ref, text);
        return `Filled ref ${ref}`;
      }),
    }),

    dblclick: tool({
      description: "Double-click the element with the given ref ID.",
      inputSchema: z.object({
        ref: z.string().describe("Element ref ID from wireframe"),
      }),
      execute: wrapExecute(browser, async (b, { ref }) => {
        await b.dblclick(ref);
        return `Double-clicked ref ${ref}`;
      }),
    }),

    hover: tool({
      description: "Hover over the element with the given ref ID.",
      inputSchema: z.object({
        ref: z.string().describe("Element ref ID from wireframe"),
      }),
      execute: wrapExecute(browser, async (b, { ref }) => {
        await b.hover(ref);
        return `Hovered ref ${ref}`;
      }),
    }),

    press: tool({
      description: "Press a keyboard key (e.g. Enter, Tab, ArrowDown).",
      inputSchema: z.object({
        key: z.string().describe("Key to press"),
      }),
      execute: wrapExecute(browser, async (b, { key }) => {
        await b.press(key);
        return `Pressed key ${key}`;
      }),
    }),

    select: tool({
      description: "Select an option in a dropdown by ref and value.",
      inputSchema: z.object({
        ref: z.string().describe("Element ref ID from wireframe"),
        value: z.string().describe("Option value to select"),
      }),
      execute: wrapExecute(browser, async (b, { ref, value }) => {
        await b.select(ref, value);
        return `Selected value in ref ${ref}`;
      }),
    }),

    check: tool({
      description: "Check the checkbox/radio with the given ref ID.",
      inputSchema: z.object({
        ref: z.string().describe("Element ref ID from wireframe"),
      }),
      execute: wrapExecute(browser, async (b, { ref }) => {
        await b.check(ref);
        return `Checked ref ${ref}`;
      }),
    }),

    uncheck: tool({
      description: "Uncheck the checkbox with the given ref ID.",
      inputSchema: z.object({
        ref: z.string().describe("Element ref ID from wireframe"),
      }),
      execute: wrapExecute(browser, async (b, { ref }) => {
        await b.uncheck(ref);
        return `Unchecked ref ${ref}`;
      }),
    }),

    scroll: tool({
      description: "Scroll the page in the given direction.",
      inputSchema: z.object({
        direction: z
          .enum(["up", "down", "left", "right"])
          .describe("Scroll direction"),
        pixels: z.number().optional().describe("Pixels to scroll (default 100)"),
      }),
      execute: wrapExecute(browser, async (b, { direction, pixels }) => {
        await b.scroll(direction, pixels);
        return `Scrolled ${direction}`;
      }),
    }),

    screenshot: tool({
      description:
        "Take a screenshot. Returns base64 PNG when path is omitted; otherwise saves to file.",
      inputSchema: z.object({
        path: z
          .string()
          .optional()
          .describe("Optional file path to save screenshot"),
        fullPage: z
          .boolean()
          .optional()
          .describe("Capture full scrollable page"),
      }),
      execute: wrapExecute(browser, async (b, { path: filePath, fullPage }) => {
        const result = await b.screenshot(filePath, { fullPage });
        if (filePath) {
          return `Screenshot saved to ${filePath}`;
        }
        const base64 =
          result instanceof Buffer ? result.toString("base64") : "";
        return base64 ? `data:image/png;base64,${base64}` : "(no image)";
      }),
    }),

    close: tool({
      description: "Close the browser.",
      inputSchema: z.object({}),
      execute: wrapExecute(browser, async (b) => {
        await b.close();
        return "Browser closed.";
      }),
    }),
  };
}
