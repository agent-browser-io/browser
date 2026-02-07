/**
 * Browser interface for agent-browser-io
 */

export interface IBrowserBackend {
    launch(): Promise<void>;
    navigate(url: string): Promise<void>;
    click(selector: string): Promise<void>;
    type(selector: string, text: string): Promise<void>;
    evaluate(script: string): Promise<any>;
}
