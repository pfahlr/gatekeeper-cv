import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

let rl: ReturnType<typeof createInterface> | null = null;

/**
 * Get or create the readline interface
 */
function getInterface() {
  if (!rl) {
    rl = createInterface({ input, output });
  }
  return rl;
}

/**
 * Prompts the user for a single line of input
 */
export async function prompt(question: string, defaultValue?: string): Promise<string> {
  const readline = getInterface();
  let promptText = question;
  if (defaultValue !== undefined) {
    promptText += ` [${defaultValue}]`;
  }
  promptText += ': ';

  const answer = await readline.question(promptText);
  return answer.trim() || defaultValue || '';
}

/**
 * Prompts the user for a URL with a prefix shown but not included in default
 * Returns undefined if user enters nothing, otherwise returns the full URL
 */
export async function promptUrl(prefix: string, placeholder?: string): Promise<string | undefined> {
  const readline = getInterface();
  const promptText = `${prefix}${placeholder || ''}: `;
  const answer = await readline.question(promptText);
  const trimmed = answer.trim();

  if (!trimmed) {
    return undefined;
  }

  return prefix + trimmed;
}

/**
 * Prompts for GitHub username (only username needed)
 */
export async function promptGithubUsername(defaultUsername?: string): Promise<string | undefined> {
  const readline = getInterface();
  const promptText = `GitHub username ${defaultUsername ? `[${defaultUsername}]` : ''}: `;
  const answer = await readline.question(promptText);
  const trimmed = answer.trim();

  if (!trimmed) {
    return defaultUsername ? `https://github.com/${defaultUsername}` : undefined;
  }

  return `https://github.com/${trimmed}`;
}

/**
 * Prompts for LinkedIn profile (user completes the /in/ part)
 */
export async function promptLinkedinProfile(defaultProfile?: string): Promise<string | undefined> {
  const readline = getInterface();
  // Extract just the profile part from default if it's a full URL
  let defaultProfilePart = defaultProfile;
  if (defaultProfile?.startsWith('https://linkedin.com/in/')) {
    defaultProfilePart = defaultProfile.replace('https://linkedin.com/in/', '');
  }

  const promptText = `LinkedIn profile (https://linkedin.com/in/) ${defaultProfilePart ? `[${defaultProfilePart}]` : ''}: `;
  const answer = await readline.question(promptText);
  const trimmed = answer.trim();

  if (!trimmed) {
    return defaultProfile ? `https://linkedin.com/in/${defaultProfilePart}` : undefined;
  }

  return `https://linkedin.com/in/${trimmed}`;
}

/**
 * Prompts the user for multiline input (terminated by Ctrl+D or empty line)
 */
export async function promptMultiline(question: string): Promise<string> {
  const readline = getInterface();
  console.error(`${question} (press Enter on empty line to finish):`);
  const lines: string[] = [];

  while (true) {
    const line = await readline.question('> ');
    if (line === '') {
      break;
    }
    lines.push(line);
  }

  return lines.join('\n');
}

/**
 * Closes the readline interface
 */
export function closePrompts(): void {
  if (rl) {
    rl.close();
    rl = null;
  }
}
