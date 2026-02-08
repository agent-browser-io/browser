#!/usr/bin/env node
/**
 * Single entrypoint: parses the command and routes to CLI or MCP server.
 * Usage:
 *   browser           → run CLI (default)
 *   browser cli       → run CLI
 *   browser mcp       → run MCP server
 *   browser help      → show this usage
 */

const cmd = process.argv[2];
const isHelp =
  cmd === "help" ||
  cmd === "-h" ||
  cmd === "--help" ||
  cmd === "-?";

if (isHelp) {
  console.log(`
@agent-browser-io/browser

Usage:
  browser           Run interactive CLI (default)
  browser cli       Run interactive CLI
  browser mcp       Run MCP server (stdio)

Examples:
  npx @agent-browser-io/browser
  npx @agent-browser-io/browser cli
  npx @agent-browser-io/browser mcp
`);
  process.exit(0);
}

const path = require("path");
const scriptDir = __dirname;

// Route: no command or "cli" → CLI; "mcp" → MCP
const target = !cmd || cmd === "cli" ? "cli" : cmd === "mcp" ? "mcp" : null;

if (!target) {
  console.error(`Unknown command: ${cmd}`);
  console.error("Use 'browser help' for usage.");
  process.exit(1);
}

// Remove the subcommand so the target sees clean argv (node, script, ...rest)
if (cmd) process.argv.splice(2, 1);

if (target === "cli") {
  require(path.join(scriptDir, "../dist/cjs/cli/cli.js"));
} else {
  require(path.join(scriptDir, "../dist/cjs/mcp/server.js"));
}
