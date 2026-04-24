import { loadUserProfileConfig } from '../config/load-user-profile.js';
import { resolveProfile } from '../config/resolve-profile.js';
import { loadUserResumeMarkdown } from '../config/load-user-resume.js';
import { fetchPage } from '../job-posts/fetch-page.js';
import { loadJobSitesConfig } from '../config/load-job-sites-config.js';
import { findJobSiteConfigForUrl } from '../job-posts/domain-config.js';
import { parseJobPost } from '../job-posts/parse-job-post.js';
import { fallbackExtractJobPost, isWeakExtraction } from '../job-posts/fallback-extract-job-post.js';
import { buildResumeCoverLetterPrompt } from '../prompts/build-resume-cover-letter-prompt.js';
import { resolvePromptPreferences } from '../config/resolve-prompt-preferences.js';
import { writeFile } from 'node:fs/promises';

export interface PromptGenerateOptions {
  profile?: string;
  out?: string;
}

export async function runPromptGenerateCommand(
  jobPostUrl: string,
  options: PromptGenerateOptions = {}
): Promise<void> {
  const { config } = await loadUserProfileConfig();
  const { name: profileName, profile } = resolveProfile(config, options.profile);

  const resume = await loadUserResumeMarkdown(profile);

  const jobSitesConfig = await loadJobSitesConfig();
  const matchedSite = findJobSiteConfigForUrl(jobPostUrl, jobSitesConfig);

  const pageHtml = await fetchPage(jobPostUrl);

  let extractedJob = parseJobPost({
    url: jobPostUrl,
    html: pageHtml,
    matchedDomain: matchedSite?.matchedDomain,
    siteConfig: matchedSite?.siteConfig,
  });

  // Check if extraction is weak and use fallback if needed
  if (!matchedSite || isWeakExtraction(extractedJob)) {
    extractedJob = fallbackExtractJobPost({
      url: jobPostUrl,
      html: pageHtml,
    });
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
  });

  // Output
  if (options.out) {
    // Write to file
    await writeFile(options.out, prompt, 'utf-8');
    // Status messages go to stderr
    console.error(`Generating prompt for: ${jobPostUrl}`);
    console.error(`Using profile: ${profileName}`);
    console.error(`Loaded resume: ${resume.length} characters`);
    console.error(`Matched job site config: ${matchedSite?.matchedDomain || 'fallback'}`);
    console.error(`Fetched page: ${pageHtml.length} characters`);
    console.error(`Title: ${extractedJob.title}`);
    if (extractedJob.company) {
      console.error(`Company: ${extractedJob.company}`);
    }
    if (extractedJob.location) {
      console.error(`Location: ${extractedJob.location}`);
    }
    console.error(`Description length: ${extractedJob.description.length} characters`);
    console.error(`Raw text length: ${(extractedJob.rawText || '').length} characters`);
    console.error(`Prompt written to ${options.out}`);
  } else {
    // Print to stdout
    console.log(prompt);
  }
}
