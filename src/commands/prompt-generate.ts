import { loadUserProfileConfig } from '../config/load-user-profile.js';
import { resolveProfile } from '../config/resolve-profile.js';
import { loadUserResumeMarkdown } from '../config/load-user-resume.js';

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

  if (options.out) {
    console.log(`Prompt output file: ${options.out}`);
  }
}
