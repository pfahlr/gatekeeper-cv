import { loadUserProfileConfig } from '../config/load-user-profile.js';
import { resolveProfile } from '../config/resolve-profile.js';
import { loadUserResumeMarkdown } from '../config/load-user-resume.js';
import { fetchPage } from '../job-posts/fetch-page.js';
import { loadJobSitesConfig } from '../config/load-job-sites-config.js';
import { findJobSiteConfigForUrl } from '../job-posts/domain-config.js';
import { parseJobPost } from '../job-posts/parse-job-post.js';
import { fallbackExtractJobPost, isWeakExtraction } from '../job-posts/fallback-extract-job-post.js';
import { searchCompanyAddress } from '../job-posts/search-company-address.js';
import { buildResumeCoverLetterPrompt } from '../prompts/build-resume-cover-letter-prompt.js';
import { resolvePromptPreferences } from '../config/resolve-prompt-preferences.js';
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { createInterface } from 'node:readline';

function isInteractive(): boolean {
  return process.stdin.isTTY && process.env.CI !== 'true';
}

function promptUser(question: string): Promise<string | undefined> {
  if (!isInteractive()) {
    return Promise.resolve(undefined);
  }

  const rl = createInterface({
    input: process.stdin,
    output: process.stderr,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim() || undefined);
    });
  });
}

export interface PromptGenerateOptions {
  profile?: string;
  out?: string;
  description?: string;
  title?: string;
  company?: string;
  temperature?: number;
}

export async function runPromptGenerateCommand(
  jobPostUrl: string,
  options: PromptGenerateOptions = {}
): Promise<void> {
  const { config } = await loadUserProfileConfig();
  const { name: profileName, profile } = resolveProfile(config, options.profile);

  const resume = await loadUserResumeMarkdown(profile);

  let extractedJob;

  // If description is provided manually, use it instead of fetching
  if (options.description) {
    extractedJob = {
      url: jobPostUrl,
      title: options.title || 'Job Posting',
      company: options.company,
      location: undefined,
      description: options.description,
      rawText: options.description,
    };
  } else {
    const jobSitesConfig = await loadJobSitesConfig();
    const matchedSite = findJobSiteConfigForUrl(jobPostUrl, jobSitesConfig);

    const pageHtml = await fetchPage(jobPostUrl);

    let parsedJob = parseJobPost({
      url: jobPostUrl,
      html: pageHtml,
      matchedDomain: matchedSite?.matchedDomain,
      siteConfig: matchedSite?.siteConfig,
    });

    // Check if extraction is weak and use fallback if needed
    if (!matchedSite || isWeakExtraction(parsedJob)) {
      parsedJob = fallbackExtractJobPost({
        url: jobPostUrl,
        html: pageHtml,
      });
    }

    extractedJob = parsedJob;
  }

  // Search for company address if we have a company name
  if (extractedJob.company && !extractedJob.companyAddress) {
    console.error(`Searching for address of: ${extractedJob.company}...`);
    let searchedAddress;
    try {
      searchedAddress = await searchCompanyAddress(extractedJob.company);
    } catch (error) {
      console.error(`Address search error: ${error}`);
    }

    if (searchedAddress) {
      extractedJob.companyAddress = searchedAddress;
      console.error(`Found address: ${extractedJob.companyAddress}`);
    } else {
      console.error(`No address found for ${extractedJob.company}.`);
      const manualAddress = await promptUser(
        'Enter company address (or press Enter to skip): '
      );
      if (manualAddress) {
        extractedJob.companyAddress = manualAddress;
      }
    }
  }

  // Determine temperature: CLI option > prompt > profile default
  let temperature = options.temperature;
  if (temperature === undefined && isInteractive()) {
    const tempInput = await promptUser(
      `Enter temperature (0-100, default: ${profile.temperature ?? 50}): `
    );
    if (tempInput) {
      const parsedTemp = parseInt(tempInput, 10);
      if (!isNaN(parsedTemp) && parsedTemp >= 0 && parsedTemp <= 100) {
        temperature = parsedTemp;
      } else {
        console.error(`Invalid temperature, using default: ${profile.temperature ?? 50}`);
      }
    }
  }
  if (temperature === undefined) {
    temperature = profile.temperature ?? 50;
    console.error(`Using temperature: ${temperature}`);
  } else {
    console.error(`Using temperature: ${temperature}`);
  }

  // Resolve prompt preferences for the selected profile
  const promptPreferences = resolvePromptPreferences(profile.promptPreferences);

  // Build the prompt
  const prompt = buildResumeCoverLetterPrompt({
    extractedJob,
    profile: config,
    selectedProfileName: profileName,
    resumeMarkdown: resume,
    promptPreferences,
    temperature,
  });

  // Output
  const outputFile = options.out || `./output/prompt.${Date.now()}.txt`;

  if (outputFile) {
    // Ensure output directory exists
    await mkdir(dirname(outputFile), { recursive: true });

    // Write to file
    await writeFile(outputFile, prompt, 'utf-8');
    // Status messages go to stderr
    console.error(`Generating prompt for: ${jobPostUrl}`);
    console.error(`Using profile: ${profileName}`);
    console.error(`Loaded resume: ${resume.length} characters`);
    if (options.description) {
      console.error(`Using manual job description`);
    } else {
      console.error(`Fetched page from URL`);
    }
    console.error(`Title: ${extractedJob.title}`);
    if (extractedJob.company) {
      console.error(`Company: ${extractedJob.company}`);
    }
    if (extractedJob.companyAddress) {
      console.error(`Company Address: ${extractedJob.companyAddress}`);
    }
    if (extractedJob.location) {
      console.error(`Location: ${extractedJob.location}`);
    }
    console.error(`Description length: ${extractedJob.description.length} characters`);
    console.error(`Prompt written to ${outputFile}`);
  } else {
    // Print to stdout (shouldn't reach here with default)
    console.log(prompt);
  }
}
