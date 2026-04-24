#!/usr/bin/env node
import { Command } from 'commander';
import { runPromptGenerateCommand } from './commands/prompt-generate.js';
import { runBuildDocsCommand } from './commands/build-docs.js';

const program = new Command();

program
  .name('gatekeeper-cv')
  .description('A CLI tool for generating tailored resume and cover letter prompts and rendering generated content into themed documents.')
  .version('0.1.0');

program.command('prompt-generate')
  .description('Generate a tailored prompt for a specific job posting')
  .argument('<job-post-url>', 'URL of the job posting to analyze')
  .option('--profile <profile-name>', 'Profile name to use')
  .option('--out <output-file>', 'Output file for the generated prompt')
  .action(async (jobPostUrl: string, options) => {
    await runPromptGenerateCommand(jobPostUrl, options);
  });

program.command('build-docs')
  .description('Render generated content into themed documents')
  .argument('<json-file>', 'JSON file containing generated content')
  .argument('<theme-name>', 'Name of the theme to use')
  .argument('<output-directory>', 'Directory where output files will be written')
  .option('--profile <profile-name>', 'Profile name to use')
  .action(async (jsonFile: string, themeName: string, outputDirectory: string, options) => {
    await runBuildDocsCommand(jsonFile, themeName, outputDirectory, options);
  });

program.parse();
