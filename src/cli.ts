/**
 * Interactive CLI for @agent-browser-io/browser
 * Uses Node.js readline for REPL-style input.
 */

import * as readline from 'readline';
import { VERSION } from './index.js';

const PROMPT = 'agent-browser> ';

function print(msg: string): void {
  console.log(msg);
}

function main(): void {
  print(`@agent-browser-io/browser v${VERSION}`);
  print('Type "help" for commands, "exit" or Ctrl+D to quit.\n');

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const loop = (): void => {
    rl.question(PROMPT, (line: string) => {
      const input = line.trim().toLowerCase();
      if (input === 'exit' || input === 'quit' || input === 'q') {
        rl.close();
        process.exit(0);
      }
      if (input === 'help') {
        print('  help     Show this message');
        print('  version  Show version');
        print('  exit     Quit the CLI');
      } else if (input === 'version') {
        print(`  ${VERSION}`);
      } else if (input !== '') {
        print(`  Unknown command: ${input}. Type "help" for commands.`);
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

main();
