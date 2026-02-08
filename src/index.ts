/**
 * @agent-browser-io/browser
 * Browser automation and control for agent-browser-io
 */

export const VERSION = "0.1.0";

export { createBrowserTools } from "./ai-sdk/createBrowserTools.js";
export type { IAgentBrowser } from "./core/agent-browser/agent-browser.js";
export { AgentBrowser } from "./core/agent-browser/agent-browser.js";
export type { IBrowserBackend } from "./core/browser-backend/browser-backend.js";
export { DefaultBrowserBackend } from "./core/browser-backend/index.js";