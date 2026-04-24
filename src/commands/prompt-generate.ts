export interface PromptGenerateOptions {
  profile?: string;
  out?: string;
}

export async function runPromptGenerateCommand(
  jobPostUrl: string,
  options: PromptGenerateOptions = {}
): Promise<void> {
  console.log(`Generating prompt for: ${jobPostUrl}`);
  if (options.profile) {
    console.log(`Using profile: ${options.profile}`);
  }
  if (options.out) {
    console.log(`Prompt output file: ${options.out}`);
  }
}
