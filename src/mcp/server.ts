/**
 * MCP server that exposes AgentBrowser as tools over stdio.
 */

import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { AgentBrowser } from "../core/agent-browser/agent-browser";
import { DefaultBrowserBackend } from "../core/browser-backend/index";

const backend = new DefaultBrowserBackend();
const browser = new AgentBrowser(backend);
let launched = false;

async function ensureLaunched(): Promise<void> {
  if (!launched) {
    await browser.launch();
    launched = true;
  }
}

function toolResult(text: string): { content: [{ type: "text"; text: string }] } {
  return { content: [{ type: "text" as const, text }] };
}

function toolError(err: unknown): { content: [{ type: "text"; text: string }] } {
  const message = err instanceof Error ? err.message : String(err);
  return { content: [{ type: "text" as const, text: `Error: ${message}` }] };
}

const server = new McpServer(
  { name: "agent-browser", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

// agent_browser_launch
server.registerTool(
  "agent_browser_launch",
  {
    title: "Launch Browser",
    description: "Launch the browser (idempotent). Call before other actions if the browser is not yet running.",
    inputSchema: z.object({}),
  },
  async () => {
    try {
      if (!launched) {
        await browser.launch();
        launched = true;
      }
      return toolResult("Browser launched.");
    } catch (err) {
      return toolError(err);
    }
  }
);

// agent_browser_navigate
server.registerTool(
  "agent_browser_navigate",
  {
    title: "Navigate",
    description: "Navigate to a URL and apply the wireframe normalizer.",
    inputSchema: z.object({ url: z.string().describe("URL to open") }),
  },
  async ({ url }) => {
    try {
      await ensureLaunched();
      await browser.navigate(url);
      return toolResult(`Navigated to ${url}`);
    } catch (err) {
      return toolError(err);
    }
  }
);

// agent_browser_get_wireframe
server.registerTool(
  "agent_browser_get_wireframe",
  {
    title: "Get Wireframe",
    description: "Return the ASCII wireframe of the current page. Use ref IDs from this output for click, type, fill, etc.",
    inputSchema: z.object({}),
  },
  async () => {
    try {
      await ensureLaunched();
      const wireframe = await browser.getWireframe();
      return toolResult(wireframe || "(empty wireframe)");
    } catch (err) {
      return toolError(err);
    }
  }
);

// agent_browser_click
server.registerTool(
  "agent_browser_click",
  {
    title: "Click",
    description: "Click the element with the given ref ID (from the wireframe).",
    inputSchema: z.object({ ref: z.string().describe("Element ref ID from wireframe") }),
  },
  async ({ ref }) => {
    try {
      await ensureLaunched();
      await browser.click(ref);
      return toolResult(`Clicked ref ${ref}`);
    } catch (err) {
      return toolError(err);
    }
  }
);

// agent_browser_type
server.registerTool(
  "agent_browser_type",
  {
    title: "Type",
    description: "Type text into the element with the given ref ID.",
    inputSchema: z.object({
      ref: z.string().describe("Element ref ID from wireframe"),
      text: z.string().describe("Text to type"),
    }),
  },
  async ({ ref, text }) => {
    try {
      await ensureLaunched();
      await browser.type(ref, text);
      return toolResult(`Typed into ref ${ref}`);
    } catch (err) {
      return toolError(err);
    }
  }
);

// agent_browser_fill
server.registerTool(
  "agent_browser_fill",
  {
    title: "Fill",
    description: "Clear and fill the element (by ref) with the given text.",
    inputSchema: z.object({
      ref: z.string().describe("Element ref ID from wireframe"),
      text: z.string().describe("Text to fill"),
    }),
  },
  async ({ ref, text }) => {
    try {
      await ensureLaunched();
      await browser.fill(ref, text);
      return toolResult(`Filled ref ${ref}`);
    } catch (err) {
      return toolError(err);
    }
  }
);

// agent_browser_dblclick
server.registerTool(
  "agent_browser_dblclick",
  {
    title: "Double Click",
    description: "Double-click the element with the given ref ID.",
    inputSchema: z.object({ ref: z.string().describe("Element ref ID from wireframe") }),
  },
  async ({ ref }) => {
    try {
      await ensureLaunched();
      await browser.dblclick(ref);
      return toolResult(`Double-clicked ref ${ref}`);
    } catch (err) {
      return toolError(err);
    }
  }
);

// agent_browser_hover
server.registerTool(
  "agent_browser_hover",
  {
    title: "Hover",
    description: "Hover over the element with the given ref ID.",
    inputSchema: z.object({ ref: z.string().describe("Element ref ID from wireframe") }),
  },
  async ({ ref }) => {
    try {
      await ensureLaunched();
      await browser.hover(ref);
      return toolResult(`Hovered ref ${ref}`);
    } catch (err) {
      return toolError(err);
    }
  }
);

// agent_browser_press
server.registerTool(
  "agent_browser_press",
  {
    title: "Press Key",
    description: "Press a keyboard key (e.g. Enter, Tab, ArrowDown).",
    inputSchema: z.object({ key: z.string().describe("Key to press") }),
  },
  async ({ key }) => {
    try {
      await ensureLaunched();
      await browser.press(key);
      return toolResult(`Pressed key ${key}`);
    } catch (err) {
      return toolError(err);
    }
  }
);

// agent_browser_select
server.registerTool(
  "agent_browser_select",
  {
    title: "Select Option",
    description: "Select an option in a dropdown by ref and value.",
    inputSchema: z.object({
      ref: z.string().describe("Element ref ID from wireframe"),
      value: z.string().describe("Option value to select"),
    }),
  },
  async ({ ref, value }) => {
    try {
      await ensureLaunched();
      await browser.select(ref, value);
      return toolResult(`Selected value in ref ${ref}`);
    } catch (err) {
      return toolError(err);
    }
  }
);

// agent_browser_check
server.registerTool(
  "agent_browser_check",
  {
    title: "Check",
    description: "Check the checkbox/radio with the given ref ID.",
    inputSchema: z.object({ ref: z.string().describe("Element ref ID from wireframe") }),
  },
  async ({ ref }) => {
    try {
      await ensureLaunched();
      await browser.check(ref);
      return toolResult(`Checked ref ${ref}`);
    } catch (err) {
      return toolError(err);
    }
  }
);

// agent_browser_uncheck
server.registerTool(
  "agent_browser_uncheck",
  {
    title: "Uncheck",
    description: "Uncheck the checkbox with the given ref ID.",
    inputSchema: z.object({ ref: z.string().describe("Element ref ID from wireframe") }),
  },
  async ({ ref }) => {
    try {
      await ensureLaunched();
      await browser.uncheck(ref);
      return toolResult(`Unchecked ref ${ref}`);
    } catch (err) {
      return toolError(err);
    }
  }
);

// agent_browser_scroll
server.registerTool(
  "agent_browser_scroll",
  {
    title: "Scroll",
    description: "Scroll the page in the given direction.",
    inputSchema: z.object({
      direction: z.enum(["up", "down", "left", "right"]).describe("Scroll direction"),
      pixels: z.number().optional().describe("Pixels to scroll (default 100)"),
    }),
  },
  async ({ direction, pixels }) => {
    try {
      await ensureLaunched();
      await browser.scroll(direction, pixels);
      return toolResult(`Scrolled ${direction}`);
    } catch (err) {
      return toolError(err);
    }
  }
);

// agent_browser_screenshot
server.registerTool(
  "agent_browser_screenshot",
  {
    title: "Screenshot",
    description: "Take a screenshot. Returns base64 PNG when path is omitted; otherwise saves to file.",
    inputSchema: z.object({
      path: z.string().optional().describe("Optional file path to save screenshot"),
      fullPage: z.boolean().optional().describe("Capture full scrollable page"),
    }),
  },
  async ({ path: filePath, fullPage }) => {
    try {
      await ensureLaunched();
      const result = await browser.screenshot(filePath, { fullPage });
      if (filePath) {
        return toolResult(`Screenshot saved to ${filePath}`);
      }
      const base64 =
        result instanceof Buffer ? result.toString("base64") : "";
      return toolResult(base64 ? `data:image/png;base64,${base64}` : "(no image)");
    } catch (err) {
      return toolError(err);
    }
  }
);

// agent_browser_close
server.registerTool(
  "agent_browser_close",
  {
    title: "Close Browser",
    description: "Close the browser.",
    inputSchema: z.object({}),
  },
  async () => {
    try {
      if (launched) {
        await browser.close();
        launched = false;
      }
      return toolResult("Browser closed.");
    } catch (err) {
      return toolError(err);
    }
  }
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}


main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});