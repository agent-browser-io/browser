# @agent-browser-io/browser

**Token efficient agent browser (Experimental)**

This package lets AI agents control a real browser ( navigate, click, type, interact via ASCII wireframes ) in a token-efficient way. Use it from [MCP](https://modelcontextprotocol.io) clients (e.g. Cursor, Claude Desktop) or from code with the [Vercel AI SDK](https://sdk.vercel.ai).

**The following is an example of how an agent see the Hacker News website.**

```
               [1]*  [2]Hacker News [3]new|   [4]past|  [5]comments|   [6]ask|  [7]show |  [8]jobs|  [9]submit                                                                          [10]login


               1.[11]upvote [12]Welcome (back) to Macintosh( [13]take.surf)
                       101 pointsby   [14]Udo_Schmitz [15]1 hour ago |  [16]hide|  [17]42 comments
               2.
                 [18]upvote [19]Motorola announces a partnership with GrapheneOS( [20]motorolanews.com)
                       1966 pointsby   [21]km [22]15 hours ago |  [23]hide|  [24]706 comments
               3.[25]upvote [26]British Columbia to end time changes, adopt year-round daylight time( [27]cbc.ca)
                       167 pointsby   [28]ireflect [29]1 hour ago |  [30]hide|  [31]81 comments
               4.
                 [32]upvote [33]New iPad Air, powered by M4( [34]apple.com)
                       279 pointsby   [35]Garbage [36]8 hours ago |  [37]hide|  [38]455 comments
               5.[39]upvote [40]First in-utero stem cell therapy for fetal spina bifida repair is safe: study( [41]ucdavis.edu)
                       218 pointsby   [42]gmays [43]7 hours ago |  [44]hide|  [45]38 comments
               6.
                 [46]upvote [47]Show HN: Govbase – Follow a bill from source text to news bias to social posts( [48]govbase.com)
                       125 pointsby   [49]foxfoxx [50]5 hours ago |  [51]hide|  [52]60 comments
               7.[53]upvote [54]"That Shape Had None" – A Horror of Substrate Independence (Short Fiction)( [55]starlightconvenience.net)
                       59 pointsby   [56]casmalia [57]3 hours ago |  [58]hide|  [59]10 comments
               8.
                 [60]upvote [61]Show HN: Pianoterm – Run shell commands from your Piano. A Linux CLI tool( [62]github.com/vustagc)
                       22 pointsby   [63]vustagc [64]1 hour ago |  [65]hide|  [66]5 comments
               9.[67]upvote [68]Show HN: uBlock filter list to blur all Instagram Reels( [69]gist.github.com)
                       70 pointsby   [70]shraiwi [71]2 hours ago |  [72]hide|  [73]17 comments
              10.
                 [74]upvote [75]LFortran compiles fpm( [76]lfortran.org)
                       31 pointsby   [77]wtlin [78]2 hours ago |  [79]hide|  [80]8 comments
              11.[81]upvote [82]Launch HN: OctaPulse (YC W26) – Robotics and computer vision for fish farming
                       52 pointsby   [83]rohxnsxngh [84]5 hours ago |  [85]hide|  [86]27 comments
              12.
                 [87]upvote [88]Ask HN: Who is hiring? (March 2026)
                       137 pointsby   [89]whoishiring [90]6 hours ago |  [91]hide|  [92]185 comments
              13.[93]upvote [94]Ask HN: Who wants to be hired? (March 2026)
                       49 pointsby   [95]whoishiring [96]6 hours ago |  [97]hide|  [98]135 comments
              14.
                 [99]upvote [100]How to talk to anyone and why you should( [101]theguardian.com)
                       512 pointsby   [102]Looky1173 [103]14 hours ago |  [104]hide|  [105]494 comments
              15.[106]upvote [107]The 185-Microsecond Type Hint( [108]sturdystatistics.com)
                       4 pointsby   [109]kianN [110]24 minutes ago |  [111]hide|  [112]1 comment
              16.
                 [113]upvote [114]iPhone 17e( [115]apple.com)
                       145 pointsby   [116]meetpateltech [117]8 hours ago |  [118]hide|  [119]133 comments
              17.       [120]Reflex (YC W23) Is Hiring Software Engineers – Python( [121]ycombinator.com)
                        [122]5 hours ago|  [123]hide
              18.[124]upvote [125]Inside the M4 Apple Neural Engine, Part 1: Reverse Engineering( [126]maderix.substack.com)
                       224 pointsby   [127]zdw [128]9 hours ago |  [129]hide|  [130]57 comments

              19.[131]upvote [132]Programmable Cryptography( [133]0xparc.org)
                       12 pointsby   [134]fi-le [135]1 hour ago |  [136]hide|  [137]1 comment
```

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
