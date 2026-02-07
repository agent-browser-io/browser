/**
 * Default browser implementation using Playwright
 */

import { chromium, type Browser, type Page } from 'playwright';
import type { IBrowserBackend } from './browser-backend.js';

export class DefaultBrowserBackend implements IBrowserBackend {
    private browser: Browser | null = null;
    private page: Page | null = null;

    async launch(): Promise<void> {
        this.browser = await chromium.launch();
        this.page = await this.browser.newPage();
    }

    async navigate(url: string): Promise<void> {
        await this.ensurePage();
        await this.page!.goto(url);
    }

    async click(selector: string): Promise<void> {
        await this.ensurePage();
        await this.page!.click(selector);
    }

    async type(selector: string, text: string): Promise<void> {
        await this.ensurePage();
        await this.page!.fill(selector, text);
    }

    async evaluate(script: string): Promise<unknown> {
        await this.ensurePage();
        return this.page!.evaluate(script);
    }

    private async ensurePage(): Promise<void> {
        if (!this.page) {
          await this.launch();
        }
    }
}
