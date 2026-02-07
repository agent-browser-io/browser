import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { IBrowserBackend } from "../browser-backend/browser-backend.js";

const _scriptDir =
    typeof __dirname !== "undefined"
        ? __dirname
        : path.dirname(fileURLToPath(__dirname));
const NORMALIZE_SCRIPT = readFileSync(
    path.join(_scriptDir, "normalize-script.js"),
    "utf-8"
);

export interface IAgentBrowser {
    launch(): Promise<void>;
    navigate(url: string): Promise<void>;
    click(ref: string): Promise<void>;
    type(ref: string, text: string): Promise<void>;
    render(): Promise<void>;
    getWireframe(): Promise<string>;
}

export class AgentBrowser implements IAgentBrowser {
    constructor(private readonly browserBackend: IBrowserBackend) {}

    private async injectNormalizeScript(): Promise<void> {
        await this.browserBackend.evaluate(NORMALIZE_SCRIPT);
    }

    async launch(): Promise<void> {
        await this.browserBackend.launch();
    }

    async navigate(url: string): Promise<void> {
        await this.browserBackend.navigate(url);
        await this.injectNormalizeScript();
    }

    /** Ref is the data-ref-id value from the wireframe (e.g. "1"). */
    async click(ref: string): Promise<void> {
        await this.browserBackend.click(`[data-ref-id="${ref}"]`);
        await this.injectNormalizeScript();
    }

    /** Ref is the data-ref-id value from the wireframe (e.g. "1"). */
    async type(ref: string, text: string): Promise<void> {
        await this.browserBackend.type(`[data-ref-id="${ref}"]`, text);
        await this.injectNormalizeScript();
    }

    async render(): Promise<void> {
        await this.injectNormalizeScript();
    }

    async getWireframe(): Promise<string> {
        await this.injectNormalizeScript();
        const result = await this.browserBackend.evaluate(
            "typeof window.generateWireframeString === 'function' ? window.generateWireframeString() : ''"
        );
        return typeof result === "string" ? result : "";
    }
}