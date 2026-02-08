/**
 * Default browser implementation using Playwright
 */

import { chromium, type Browser, type Page } from 'playwright';
import type { IBrowserBackend } from './browser-backend.js';

export class PlaywrightBrowserBackend implements IBrowserBackend {
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

    async dblclick(selector: string): Promise<void> {
        await this.ensurePage();
        await this.page!.dblclick(selector);
    }

    async fill(selector: string, text: string): Promise<void> {
        await this.ensurePage();
        await this.page!.fill(selector, text);
    }

    async press(key: string): Promise<void> {
        await this.ensurePage();
        await this.page!.keyboard.press(key);
    }

    async hover(selector: string): Promise<void> {
        await this.ensurePage();
        await this.page!.hover(selector);
    }

    async select(selector: string, value: string): Promise<void> {
        await this.ensurePage();
        await this.page!.selectOption(selector, value);
    }

    async check(selector: string): Promise<void> {
        await this.ensurePage();
        await this.page!.check(selector);
    }

    async uncheck(selector: string): Promise<void> {
        await this.ensurePage();
        await this.page!.uncheck(selector);
    }

    async scroll(direction: 'up' | 'down' | 'left' | 'right', pixels = 100): Promise<void> {
        await this.ensurePage();
        const dx = direction === 'left' ? -pixels : direction === 'right' ? pixels : 0;
        const dy = direction === 'up' ? -pixels : direction === 'down' ? pixels : 0;
        await this.page!.mouse.wheel(dx, dy);
    }

    async screenshot(path?: string, options?: { fullPage?: boolean }): Promise<Buffer | void> {
        await this.ensurePage();
        const buffer = await this.page!.screenshot({ path, fullPage: options?.fullPage });
        return path ? undefined : (buffer as Buffer);
    }

    async close(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.page = null;
        }
    }
}
