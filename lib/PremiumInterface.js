import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import chalk from 'chalk';
import { createCognition } from './QuantumCognition.js';

export const runPremiumInterface = async () => {
  const rl = readline.createInterface({ input, output });
  const cognition = await createCognition();
  console.log(chalk.cyan('\n💎 Quantum Commander Premium Interface'));
  let exit = false;
  while (!exit) {
    const choice = await rl.question('\nChoose an action:\n 1) Learn command\n 2) Recall command\n 3) List commands\n 4) Exit\n> ');
    switch (choice.trim()) {
      case '1': {
        const phrase = await rl.question('Phrase to remember: ');
        const command = await rl.question('Command to run: ');
        const tags = await rl.question('Tags (comma separated): ');
        const result = await cognition.learn(phrase, command, tags.split(',').filter(Boolean));
        console.log(result);
        break;
      }
      case '2': {
        const query = await rl.question('Query: ');
        const res = await cognition.recall(query, { suggest: true });
        if (res) {
          console.log(chalk.green(`Command: ${res.command}`));
        } else {
          console.log(chalk.red('No match found.'));
        }
        break;
      }
      case '3':
        console.log(cognition.list());
        break;
      case '4':
      case 'exit':
        exit = true;
        break;
      default:
        console.log('Unknown choice.');
    }
  }
  await rl.close();
  console.log(chalk.cyan('Goodbye!'));
};

export default runPremiumInterface;
