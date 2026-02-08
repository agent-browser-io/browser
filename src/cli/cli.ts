/**
 * Interactive CLI for @agent-browser-io/browser
 * Launches a browser and provides REPL-style commands.
 */

import * as readline from 'readline';
import { VERSION } from '../index';
import { AgentBrowser } from '../core/agent-browser/agent-browser';
import { DefaultBrowserBackend } from '../core/browser-backend/index';

const PROMPT = 'agent-browser> ';

function print(msg: string): void {
  console.log(msg);
}

async function main(): Promise<void> {
  print(`@agent-browser-io/browser v${VERSION}`);
  print('Launching browser...');

  const backend = new DefaultBrowserBackend();
  const browser = new AgentBrowser(backend);
  await browser.launch();

  print('Browser ready. Type "help" for commands, "exit" or Ctrl+D to quit.\n');

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const loop = (): void => {
    rl.question(PROMPT, async (line: string) => {
      const trimmed = line.trim();
      const parts = trimmed.split(/\s+/).filter(Boolean);
      const cmd = parts[0]?.toLowerCase() ?? '';
      const rest = parts.slice(1);

      if (cmd === 'exit' || cmd === 'quit' || cmd === 'q') {
        rl.close();
        process.exit(0);
      }
      if (cmd === 'help') {
        print('  help            Show this message');
        print('  version         Show version');
        print('  navigate <url>  Open URL and apply wireframe normalizer');
        print('  wireframe       Print ASCII wireframe of current page');
        print('  click <ref>     Click element by ref id (e.g. 1)');
        print('  type <ref> <text>  Type into element by ref id');
        print('  exit            Quit the CLI');
      } else if (cmd === 'version') {
        print(`  ${VERSION}`);
      } else if (cmd === 'navigate') {
        const url = rest[0];
        if (!url) {
          print('  Usage: navigate <url>');
        } else {
          try {
            await browser.navigate(url);
            print(`  Navigated to ${url}`);
          } catch (e) {
            print(`  Error: ${e instanceof Error ? e.message : String(e)}`);
          }
        }
      } else if (cmd === 'wireframe') {
        try {
          const wf = await browser.getWireframe();
          print(wf || '  (empty wireframe)');
        } catch (e) {
          print(`  Error: ${e instanceof Error ? e.message : String(e)}`);
        }
      } else if (cmd === 'click') {
        const ref = rest[0];
        if (!ref) {
          print('  Usage: click <ref>');
        } else {
          try {
            await browser.click(ref);
            print(`  Clicked ref ${ref}`);
          } catch (e) {
            print(`  Error: ${e instanceof Error ? e.message : String(e)}`);
          }
        }
      } else if (cmd === 'type') {
        const ref = rest[0];
        const text = rest.slice(1).join(' ');
        if (!ref) {
          print('  Usage: type <ref> <text>');
        } else {
          try {
            await browser.type(ref, text);
            print(`  Typed into ref ${ref}`);
          } catch (e) {
            print(`  Error: ${e instanceof Error ? e.message : String(e)}`);
          }
        }
      } else if (trimmed !== '') {
        print(`  Unknown command: ${cmd}. Type "help" for commands.`);
      }
      loop();
    });
  };

  rl.on('close', () => {
    print('\nBye.');
    process.exit(0);
  });

  loop();
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
