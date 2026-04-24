import { loadUserProfileConfig } from '../config/load-user-profile.js';
import { resolveProfile } from '../config/resolve-profile.js';
import { loadUserResumeMarkdown } from '../config/load-user-resume.js';
import { fetchPage } from '../job-posts/fetch-page.js';
import { loadJobSitesConfig } from '../config/load-job-sites-config.js';
import { findJobSiteConfigForUrl } from '../job-posts/domain-config.js';

export interface PromptGenerateOptions {
  profile?: string;
  out?: string;
}

export async function runPromptGenerateCommand(
  jobPostUrl: string,
  options: PromptGenerateOptions = {}
): Promise<void> {
  console.log(`Generating prompt for: ${jobPostUrl}`);

  const { config } = await loadUserProfileConfig();
  const { name: profileName, profile } = resolveProfile(config, options.profile);
  console.log(`Using profile: ${profileName}`);

  const resume = await loadUserResumeMarkdown(profile);
  console.log(`Loaded resume: ${resume.length} characters`);

  const jobSitesConfig = await loadJobSitesConfig();
  const matchedSite = findJobSiteConfigForUrl(jobPostUrl, jobSitesConfig);

  if (matchedSite) {
    console.log(`Matched job site config: ${matchedSite.matchedDomain}`);
  } else {
    console.log('No job site config matched. Fallback extraction will be used.');
  }

  const pageHtml = await fetchPage(jobPostUrl);
  console.log(`Fetched page: ${pageHtml.length} characters`);

  if (options.out) {
    console.log(`Prompt output file: ${options.out}`);
  }
}
