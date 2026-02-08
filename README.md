# @agent-browser-io/browser

Token efficient agent browser.

## Install

```bash
npm install @agent-browser-io/browser
```

## Usage

**ESM (TypeScript / modern Node / bundlers):**

```ts
import { VERSION } from '@agent-browser-io/browser';
```

**CommonJS:**

```js
const { VERSION } = require('@agent-browser-io/browser');
```

**CLI (interactive):**

```bash
npx @agent-browser-io/browser
# or, after install: browser
```

Uses Node.js `readline` for a REPL. Commands: `help`, `version`, `exit` (or `q`).

## How to add MCP

The package includes an MCP server that exposes browser tools over stdio (launch, navigate, wireframe, click, type, etc.). Add it to your MCP client so agents can control a real browser.

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

Use the same stdio command in your client’s config:

- **Command:** `npx` (or full path to `node`)
- **Args:** `["-y", "@agent-browser-io/browser", "mcp"]` (or `["path/to/bin/index.cjs", "mcp"]`)

The server speaks JSON-RPC over stdin/stdout; no extra env vars are required.

## Vercel AI SDK

You can use the same browser automation as **tools** with the [Vercel AI SDK](https://sdk.vercel.ai) and `generateText`. The package exposes `createBrowserTools(browser)`, which returns an object of tools you can pass to `generateText({ tools, ... })`. The `ai` package is included as a dependency.

**Important:** Have the model call the `launch` tool first before other actions (navigate, getWireframe, click, etc.).

**Example:**

```ts
import { createBrowserTools, AgentBrowser, DefaultBrowserBackend } from '@agent-browser-io/browser';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const browser = new AgentBrowser(new DefaultBrowserBackend());
const tools = createBrowserTools(browser);

const { text } = await generateText({
  model: openai('gpt-4o'),
  tools,
  prompt: 'Go to hackernews visit on top 3 news, and summarize their content.',
});
// Model will call launch, then navigate, then getWireframe, etc.
```

## Development

```bash
npm install
npm run build
```

Builds to `dist/cjs` (CommonJS) and `dist/esm` (ESM).