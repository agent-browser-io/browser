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

If the package is installed in your project, you can use the local binary instead:

```json
{
  "mcpServers": {
    "agent-browser": {
      "command": "node",
      "args": ["node_modules/@agent-browser-io/browser/bin/index.cjs", "mcp"]
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

## Development

```bash
npm install
npm run build
```

Builds to `dist/cjs` (CommonJS) and `dist/esm` (ESM).