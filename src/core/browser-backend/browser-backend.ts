/**
 * Browser interface for agent-browser-io
 */

export interface IBrowserBackend {
    launch(): Promise<void>;
    navigate(url: string): Promise<void>;
    click(selector: string): Promise<void>;
    type(selector: string, text: string): Promise<void>;
    evaluate(script: string): Promise<any>;
    dblclick(selector: string): Promise<void>;
    fill(selector: string, text: string): Promise<void>;
    press(key: string): Promise<void>;
    hover(selector: string): Promise<void>;
    select(selector: string, value: string): Promise<void>;
    check(selector: string): Promise<void>;
    uncheck(selector: string): Promise<void>;
    scroll(direction: 'up' | 'down' | 'left' | 'right', pixels?: number): Promise<void>;
    screenshot(path?: string, options?: { fullPage?: boolean }): Promise<Buffer | void>;
    close(): Promise<void>;
}
