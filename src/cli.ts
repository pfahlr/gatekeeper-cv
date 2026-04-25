#!/usr/bin/env node
import { Command } from 'commander';
import { runPromptGenerateCommand } from './commands/prompt-generate.js';
import { runBuildDocsCommand } from './commands/build-docs.js';
import { runSetupCommand, runEditSetupCommand } from './utils/profile-setup.js';
import { prompt, promptMultiline, closePrompts } from './utils/prompts.js';
import { listAvailableThemes } from './docs/resolve-theme.js';

const program = new Command();

program
  .name('gatekeeper-cv')
  .description('A CLI tool for generating tailored resume and cover letter prompts and rendering generated content into themed documents.')
  .version('0.1.0');

program.command('setup')
  .description('Set up your user profile and resume (interactive)')
  .option('--profile <profile-name>', 'Profile name to create/edit', 'default')
  .action(async (options) => {
    await runSetupCommand(options);
  });

program.command('edit-setup')
  .description('Edit existing user profile and resume (interactive)')
  .option('--profile <profile-name>', 'Profile name to edit', 'default')
  .action(async (options) => {
    await runEditSetupCommand(options);
  });

program.command('prompt-generate')
  .description('Generate a tailored prompt for a specific job posting')
  .argument('[job-post-url]', 'URL of the job posting to analyze')
  .option('--profile <profile-name>', 'Profile name to use')
  .option('--out <output-file>', 'Output file for the generated prompt (default: ./output/prompt.<timestamp>.txt)')
  .option('--description <text>', 'Job description (if fetching fails, paste the description here)')
  .option('--title <text>', 'Job title (use with --description)')
  .option('--company <text>', 'Company name (use with --description)')
  .action(async (jobPostUrl: string | undefined, options) => {
    try {
      // Prompt for missing URL
      if (!jobPostUrl) {
        jobPostUrl = await prompt('Job posting URL');
      }

      // Prompt for profile if not provided
      if (!options.profile) {
        options.profile = await prompt('Profile name', 'default');
      }

      // Note: output file default is handled in the command (timestamped)
      // Only prompt if user explicitly wants to specify one

      // If description is not provided but URL looks like a blocked site, ask if they want to paste manually
      if (!options.description) {
        const blockedDomains = ['monster.com', 'indeed.com', 'ziprecruiter.com'];
        const urlContainsBlockedDomain = blockedDomains.some(domain => jobPostUrl!.includes(domain));

        if (urlContainsBlockedDomain) {
          console.error('\nNote: This job board may block automated requests.');
          const useManual = await prompt('Paste job description manually? (y/n)', 'n');
          if (useManual.toLowerCase() === 'y') {
            if (!options.title) {
              options.title = await prompt('Job title');
            }
            if (!options.company) {
              options.company = await prompt('Company name (press Enter to skip)');
            }
            if (!options.description) {
              options.description = await promptMultiline('Job description');
            }
          }
        }
      }

      await runPromptGenerateCommand(jobPostUrl, options);
    } finally {
      closePrompts();
    }
  });

program.command('build-docs')
  .description('Render generated content into themed documents')
  .argument('[json-file]', 'JSON file containing generated content')
  .argument('[theme-name]', 'Name of the theme to use')
  .argument('[output-directory]', 'Directory where output files will be written')
  .option('--profile <profile-name>', 'Profile name to use')
  .option('--variation <variation-name>', 'Theme variation to use')
  .action(async (jsonFile: string | undefined, themeName: string | undefined, outputDirectory: string | undefined, options) => {
    try {
      // Prompt for missing values
      if (!jsonFile) {
        jsonFile = await prompt('Generated JSON file');
      }
      if (!themeName) {
        const availableThemes = await listAvailableThemes();
        if (availableThemes.length > 0) {
          console.log(`\nAvailable themes: ${availableThemes.join(', ')}`);
        }
        themeName = await prompt('Theme name', availableThemes[0] || 'clean_professional');
      }

      // Prompt for variation right after theme selection
      if (!options.variation) {
        const { resolveTheme } = await import('./docs/resolve-theme.js');
        const resolvedTheme = await resolveTheme(themeName);
        if (resolvedTheme.config.variations) {
          const variations = Object.entries(resolvedTheme.config.variations);
          if (variations.length > 1) {
            console.log(`\nAvailable variations for theme "${themeName}":`);
            variations.forEach(([name, config]) => {
              const defaultMarker = name === 'default' ? ' (default)' : '';
              const description = config.description ? ` - ${config.description}` : '';
              console.log(`  - ${name}${defaultMarker}${description}`);
            });
            console.log('');

            const variationNames = variations.map(([name]) => name);
            const variationPrompt = `Select variation (${variationNames.join(', ')})`;
            options.variation = await prompt(variationPrompt, 'default');
          }
        }
      }

      if (!outputDirectory) {
        outputDirectory = await prompt('Output directory', './output');
      }
      if (!options.profile) {
        options.profile = await prompt('Profile name', 'default');
      }

      await runBuildDocsCommand(jsonFile, themeName, outputDirectory, options);
    } finally {
      closePrompts();
    }
  });

program.parse();
