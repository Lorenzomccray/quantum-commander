import { Command } from 'commander';
import chalk from 'chalk';
import QuantumCognition from './QuantumCognition.js';

export default class QuantumCommander {
  constructor() {
    this.program = new Command();
    this.cognition = new QuantumCognition();
    this.setupCommands();
  }

  setupCommands() {
    this.program
      .name('qc')
      .description('Quantum Commander - AI-Powered CLI')
      .version('3.0.0');

    this.program.command('learn <input> <output>')
      .description('Teach QC a new command')
      .option('-t, --tags <tags>', 'Comma-separated tags (e.g., "db,backup")', '')
      .action(async (input, output, { tags }) => {
        try {
          const tagList = tags.split(',').filter(Boolean);
          const result = await this.cognition.learn(input, output, tagList);
          console.log(result);
        } catch (e) {
          console.error(chalk.red('💥 Learn failed:'), e.message);
        }
      });

    this.program.command('recall <input>')
      .description('Recall a command (with fuzzy & AI matching)')
      .option('-e, --exec', 'Execute immediately')
      .option('--threshold <number>', 'Fuzzy match threshold (0-1)', parseFloat, 0.7)
      .option('-s, --suggest', 'Get AI suggestions if no match')
      .action(async (input, { exec, threshold, suggest }) => {
        try {
          const result = await this.cognition.recall(input, { threshold, suggest });
          if (!result) {
            console.log(chalk.red('🔍 No match found. Try `qc suggest "<query>"`'));
            return;
          }
          console.log(chalk.green(`🧠 ${result.match.toUpperCase()} MATCH`) +
            (result.score ? ` (Score: ${result.score.toFixed(2)})` : ''));
          console.log(result.command);
          if (exec) {
            const mod = await import('node:child_process');
            const execSync = mod.execSync;
            try {
              execSync(result.command, { stdio: 'inherit', shell: '/bin/bash' });
            } catch (e) {
              console.error(chalk.red('💥 Command execution failed:'), e.message);
            }
          }
        } catch (e) {
          console.error(chalk.red('💥 Recall failed:'), e.message);
        }
      });

    this.program.command('suggest <query>')
      .description('Get AI-generated command suggestions')
      .action(async (query) => {
        try {
          const suggestion = await this.cognition.recall(query, { suggest: true });
          if (suggestion) {
            console.log(chalk.yellow('🤖 AI Suggestion:'));
            console.log(suggestion.command);
          } else {
            console.log(chalk.red('💡 No AI suggestions available.'));
          }
        } catch (e) {
          console.error(chalk.red('💥 Suggest failed:'), e.message);
        }
      });

    this.program.command('upgrade')
      .description('Upgrade core assistant modules from a URL or Git')
      .option('-u, --url <url>', 'Direct URL to new module (e.g., GitHub raw)')
      .option('-g, --git <repo>', 'Git repo to pull updates from')
      .action(async ({ url, git }) => {
        try {
          const fs = await import('fs/promises');
          const { existsSync, mkdirSync } = await import('fs');
          const mod = await import('node:child_process');
          const execSync = mod.execSync;
          if (!existsSync('lib')) mkdirSync('lib', { recursive: true });
          if (url) {
            const token = process.env.QC_SYSTEM_TOKEN;
            const auth = token ? `-H "Authorization: Bearer ${token}"` : '';
            const cmd = `curl -sSL ${auth} ${url} -o lib/QuantumCognition.js`;
            console.log('🔁 Pulling module from:', url);
            execSync(cmd, { stdio: 'inherit', shell: '/bin/bash' });
            console.log('✅ QuantumCognition.js updated.');
          } else if (git) {
            console.log('🔁 Pulling from Git repo:', git);
            execSync(`git clone ${git} .tmp_upgrade && cp .tmp_upgrade/lib/*.js lib/ && rm -rf .tmp_upgrade`, {
              stdio: 'inherit',
              shell: '/bin/bash'
            });
            console.log('✅ Core modules upgraded.');
          } else {
            console.log(chalk.red('❌ No upgrade source provided. Use --url or --git.'));
          }
        } catch (e) {
          console.error(chalk.red('💥 Upgrade failed:'), e.message);
        }
      });
  }

  run() {
    this.program.parse(process.argv);
  }
}
