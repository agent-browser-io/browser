import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { IBrowserBackend } from "../browser-backend/browser-backend";

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
    dblclick(ref: string): Promise<void>;
    fill(ref: string, text: string): Promise<void>;
    press(key: string): Promise<void>;
    hover(ref: string): Promise<void>;
    select(ref: string, value: string): Promise<void>;
    check(ref: string): Promise<void>;
    uncheck(ref: string): Promise<void>;
    scroll(direction: "up" | "down" | "left" | "right", pixels?: number): Promise<void>;
    screenshot(path?: string, options?: { fullPage?: boolean }): Promise<Buffer | void>;
    close(): Promise<void>;
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

    /** Ref is the data-ref-id value from the wireframe (e.g. "1"). */
    async dblclick(ref: string): Promise<void> {
        await this.browserBackend.dblclick(`[data-ref-id="${ref}"]`);
        await this.injectNormalizeScript();
    }

    /** Ref is the data-ref-id value from the wireframe (e.g. "1"). */
    async fill(ref: string, text: string): Promise<void> {
        await this.browserBackend.fill(`[data-ref-id="${ref}"]`, text);
        await this.injectNormalizeScript();
    }

    async press(key: string): Promise<void> {
        await this.browserBackend.press(key);
        await this.injectNormalizeScript();
    }

    /** Ref is the data-ref-id value from the wireframe (e.g. "1"). */
    async hover(ref: string): Promise<void> {
        await this.browserBackend.hover(`[data-ref-id="${ref}"]`);
        await this.injectNormalizeScript();
    }

    /** Ref is the data-ref-id value from the wireframe (e.g. "1"). */
    async select(ref: string, value: string): Promise<void> {
        await this.browserBackend.select(`[data-ref-id="${ref}"]`, value);
        await this.injectNormalizeScript();
    }

    /** Ref is the data-ref-id value from the wireframe (e.g. "1"). */
    async check(ref: string): Promise<void> {
        await this.browserBackend.check(`[data-ref-id="${ref}"]`);
        await this.injectNormalizeScript();
    }

    /** Ref is the data-ref-id value from the wireframe (e.g. "1"). */
    async uncheck(ref: string): Promise<void> {
        await this.browserBackend.uncheck(`[data-ref-id="${ref}"]`);
        await this.injectNormalizeScript();
    }

    async scroll(
        direction: "up" | "down" | "left" | "right",
        pixels?: number
    ): Promise<void> {
        await this.browserBackend.scroll(direction, pixels);
        await this.injectNormalizeScript();
    }

    async screenshot(
        path?: string,
        options?: { fullPage?: boolean }
    ): Promise<Buffer | void> {
        return this.browserBackend.screenshot(path, options);
    }

    async close(): Promise<void> {
        await this.browserBackend.close();
    }

    async getWireframe(): Promise<string> {
        await this.injectNormalizeScript();
        const result = await this.browserBackend.evaluate(
            "typeof window.generateWireframeString === 'function' ? window.generateWireframeString() : ''"
        );
        return typeof result === "string" ? result : "";
    }
}