# @agent-browser-io/browser

**Token efficient agent browser.**

This package lets AI agents control a real browser ( navigate, click, type, interact via ASCII wireframes ) in a token-efficient way. Use it from [MCP](https://modelcontextprotocol.io) clients (e.g. Cursor, Claude Desktop) or from code with the [Vercel AI SDK](https://sdk.vercel.ai).

**Ways to use:**

- **MCP** — Add the included MCP server to Cursor or another MCP client so the AI can drive a browser (see [How to add MCP](#how-to-add-mcp)).
- **Vercel AI SDK** — Use `createBrowserTools(browser)` with `generateText({ tools, ... })` in your app (see [Vercel AI SDK](#vercel-ai-sdk)).
- **CLI** — Run the interactive CLI for manual testing (`npx @agent-browser-io/browser` or `agent-browser-cli` after install).

## Install

```bash
npm install @agent-browser-io/browser
```

## How to add MCP

[MCP](https://modelcontextprotocol.io) (Model Context Protocol) lets AI assistants in Cursor or Claude Desktop use browser tools over stdio. Your AI will be able to launch a browser, open URLs, get wireframes, click, type, scroll, screenshot, and more.

**Run the MCP server (for testing):**

```bash
npx @agent-browser-io/browser mcp
```

**Add to Cursor**

1. Open Cursor settings → **MCP** (or edit your MCP config file, e.g. `~/.cursor/mcp.json` or project `.cursor/mcp.json`).
2. Add a server entry:

```json
{
  "mcpServers": {
    "agent-browser": {
      "command": "npx",
      "args": ["-y", "@agent-browser-io/browser", "mcp"]
    }
  }
}
```

3. Restart Cursor or reload MCP so it picks up the new server. The **agent-browser** tools will appear for the AI to use.

**Other MCP clients (e.g. Claude Desktop)**

Use the same stdio command in your client's config:

- **Command:** `npx` (or full path to `node`)
- **Args:** `["-y", "@agent-browser-io/browser", "mcp"]` (or `["path/to/bin/index.cjs", "mcp"]`)

The server speaks JSON-RPC over stdin/stdout; no extra env vars are required.

## Vercel AI SDK

You can use the same browser automation as **tools** with the [Vercel AI SDK](https://sdk.vercel.ai) and `generateText`. The package exposes `createBrowserTools(browser)`, which returns an object of tools you can pass to `generateText({ tools, ... })`. The `ai` package is included as a dependency.

**Tools:** `launch`, `navigate`, `getWireframe`, `click`, `type`, `fill`, `dblclick`, `hover`, `press`, `select`, `check`, `uncheck`, `scroll`, `screenshot`, `close`. Same toolset as the MCP server, so behavior is consistent.

**Important:** Have the model call the `launch` tool first before other actions (navigate, getWireframe, click, etc.).

**Example:**

```ts
import { createBrowserTools, AgentBrowser, PlaywrightBrowserBackend } from '@agent-browser-io/browser';
import { generateText, stepCountIs } from 'ai';
import { openai } from '@ai-sdk/openai';

const browser = new AgentBrowser(new PlaywrightBrowserBackend());
const tools = createBrowserTools(browser);

const { text } = await generateText({
  model: openai('gpt-4o'),
  tools,
  stopWhen: stepCountIs(20),
  prompt: 'Go to hackernews, visit top 3 news, and summarize their content.',
});
// Model will call launch, then navigate, then getWireframe, etc.
```

## Development

Requires **Node 18+**. Browser automation uses **Playwright** (included as a dev dependency).

```bash
npm install
npm run build
```

Builds to `dist/cjs` (CommonJS) and `dist/esm` (ESM).
