import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import type { UserProfile, Profile } from '../schemas/user-profile.schema.js';
import { userProfileSchema } from '../schemas/user-profile.schema.js';
import { prompt, promptMultiline, promptUrl, promptGithubUsername, promptLinkedinProfile, closePrompts } from './prompts.js';

export interface SetupOptions {
  profile?: string;
}

export interface SetupResult {
  profilePath: string;
  resumePath: string;
  profileName: string;
}

const EXAMPLE_PROFILE_PATH = 'user-info/profile.example.json';
const EXAMPLE_RESUME_PATH = 'user-info/resumes/default.example.md';
const USER_PROFILE_PATH = 'user-info/profile.json';
const USER_INFO_DIR = 'user-info';
const RESUMES_DIR = 'user-info/resumes';

/**
 * Load the example profile to get default values
 */
async function loadExampleProfile(): Promise<UserProfile> {
  if (!existsSync(EXAMPLE_PROFILE_PATH)) {
    throw new Error(`Example profile not found at ${EXAMPLE_PROFILE_PATH}`);
  }
  const content = await readFile(EXAMPLE_PROFILE_PATH, 'utf-8');
  return JSON.parse(content);
}

/**
 * Load the example resume to get default content
 */
async function loadExampleResume(): Promise<string> {
  if (!existsSync(EXAMPLE_RESUME_PATH)) {
    throw new Error(`Example resume not found at ${EXAMPLE_RESUME_PATH}`);
  }
  return await readFile(EXAMPLE_RESUME_PATH, 'utf-8');
}

/**
 * Load existing user profile
 */
async function loadUserProfile(): Promise<UserProfile> {
  if (!existsSync(USER_PROFILE_PATH)) {
    throw new Error(`User profile not found at ${USER_PROFILE_PATH}. Run 'setup' first.`);
  }
  const content = await readFile(USER_PROFILE_PATH, 'utf-8');
  const parsed = JSON.parse(content);
  return userProfileSchema.parse(parsed);
}

/**
 * Prompt for profile data with example values as defaults
 */
async function promptForProfile(example: UserProfile, existing?: Profile, profileName: string = 'default'): Promise<Profile> {
  console.error('\n=== Profile Information ===\n');

  // Get defaults from existing profile or example
  const exampleProfile = example.profiles[profileName] || example.profiles.default || Object.values(example.profiles)[0];

  const name = await prompt('Full name', existing?.name || exampleProfile?.name || '');
  const email = await prompt('Email', existing?.email || exampleProfile?.email || '');
  const phone = await prompt('Phone (optional)', existing?.phone || exampleProfile?.phone || '');
  const location = await prompt('Location (optional)', existing?.location || exampleProfile?.location || '');

  console.error('');
  // For URL fields, show prefix but don't include it in the stored value if empty
  const website = await promptUrl('https://', existing?.website || exampleProfile?.website || '');

  // Extract username from existing URL for GitHub default
  let defaultGithubUsername: string | undefined;
  if (existing?.github) {
    const match = existing.github.match(/github\.com\/([^\/]+)/);
    defaultGithubUsername = match ? match[1] : undefined;
  } else if (exampleProfile?.github) {
    const match = exampleProfile.github.match(/github\.com\/([^\/]+)/);
    defaultGithubUsername = match ? match[1] : undefined;
  }
  const github = await promptGithubUsername(defaultGithubUsername);

  // Extract profile part from existing LinkedIn URL for default
  let defaultLinkedinProfile: string | undefined;
  if (existing?.linkedin) {
    const match = existing.linkedin.match(/linkedin\.com\/in\/([^\/\?]+)/);
    defaultLinkedinProfile = match ? match[1] : undefined;
  } else if (exampleProfile?.linkedin) {
    const match = exampleProfile.linkedin.match(/linkedin\.com\/in\/([^\/\?]+)/);
    defaultLinkedinProfile = match ? match[1] : undefined;
  }
  const linkedin = await promptLinkedinProfile(defaultLinkedinProfile);

  console.error('');
  const summary = await promptMultiline('Professional summary (press Enter on empty line to finish)');

  console.error('');
  console.error('Enter your skills (comma-separated, or press Enter to use example):');
  const skillsInput = await prompt(
    'Skills',
    existing?.skills?.join(', ') || exampleProfile?.skills?.join(', ') || ''
  );
  const skills = skillsInput ? skillsInput.split(',').map(s => s.trim()).filter(s => s) : [];

  console.error('');
  const resumeFile = await prompt(
    'Resume file (relative to user-info/)',
    existing?.resumes?.main?.path || exampleProfile?.resumes?.main?.path || 'resumes/default.md'
  );

  return {
    name,
    email,
    phone: phone || undefined,
    location: location || undefined,
    website: website || undefined,
    linkedin: linkedin || undefined,
    github: github || undefined,
    summary: summary || undefined,
    skills,
    resumes: {
      main: {
        path: resumeFile,
        description: 'Main resume',
      },
    },
  };
}

/**
 * Prompt for resume content with example as default
 */
async function promptForResume(exampleContent: string, existingContent?: string): Promise<string> {
  console.error('\n=== Resume Content ===');
  console.error('Paste your resume in Markdown format.');
  console.error('Press Enter on an empty line to use [example-content], or paste your own and press Enter on an empty line when done.\n');

  const lines: string[] = [];
  let pasting = true;

  while (pasting) {
    const line = await prompt('>');

    if (line === '' && lines.length === 0) {
      // User wants to use example content
      console.error('Using [example-content].');
      return exampleContent;
    } else if (line === '') {
      // Done pasting
      pasting = false;
    } else {
      lines.push(line);
    }
  }

  const content = lines.join('\n');
  return content.trim() || existingContent || exampleContent;
}

/**
 * Run setup for initial profile creation
 */
export async function runSetupCommand(options: SetupOptions = {}): Promise<SetupResult> {
  try {
    const profileName = options.profile || 'default';

    console.error(`\n=== Gatekeeper CV Setup ===`);
    console.error(`Setting up profile: ${profileName}\n`);

    // Ensure directories exist
    await mkdir(RESUMES_DIR, { recursive: true });

    // Load example files
    const exampleConfig = await loadExampleProfile();
    const exampleResume = await loadExampleResume();

    // Prompt for profile data
    const profile = await promptForProfile(exampleConfig, undefined, profileName);

    // Prompt for resume content
    const resumeFile = profile.resumes.main.path;
    const resumePath = join(USER_INFO_DIR, resumeFile);
    const resumeDir = dirname(resumePath);
    await mkdir(resumeDir, { recursive: true });

    console.error(`\nConfiguring resume: ${resumeFile}`);
    const resumeContent = await promptForResume(exampleResume);

    // Check if profile.json already exists
    let config: UserProfile;
    if (existsSync(USER_PROFILE_PATH)) {
      console.error('\nLoading existing profile.json...');
      config = await loadUserProfile();
    } else {
      config = {
        defaultProfile: profileName,
        profiles: {},
      };
    }

    // Add/update the profile
    config.profiles[profileName] = profile;

    // Set as default if this is the first profile or if it was the 'default' profile
    if (Object.keys(config.profiles).length === 1 || profileName === 'default') {
      config.defaultProfile = profileName;
    }

    // Write profile.json
    await mkdir(dirname(USER_PROFILE_PATH), { recursive: true });
    await writeFile(USER_PROFILE_PATH, JSON.stringify(config, null, 2), 'utf-8');

    // Write resume
    await writeFile(resumePath, resumeContent, 'utf-8');

    console.error(`\n✓ Setup complete!`);
    console.error(`  Profile: ${USER_PROFILE_PATH}`);
    console.error(`  Resume: ${resumePath}`);
    console.error(`  Profile name: ${profileName}`);

    return {
      profilePath: USER_PROFILE_PATH,
      resumePath,
      profileName,
    };
  } finally {
    closePrompts();
  }
}

/**
 * Run edit-setup to modify existing profile
 */
export async function runEditSetupCommand(options: SetupOptions = {}): Promise<SetupResult> {
  try {
    const profileName = options.profile || 'default';

    console.error(`\n=== Gatekeeper CV Edit Setup ===`);
    console.error(`Editing profile: ${profileName}\n`);

    // Load existing config
    const config = await loadUserProfile();

    // Check if profile exists
    if (!config.profiles[profileName]) {
      throw new Error(`Profile "${profileName}" not found in profile.json. Available profiles: ${Object.keys(config.profiles).join(', ')}`);
    }

    const existingProfile = config.profiles[profileName];

    // Load example for defaults
    const exampleConfig = await loadExampleProfile();

    // Load existing resume if it exists
    let existingResumeContent: string | undefined;
    const resumePath = join(USER_INFO_DIR, existingProfile.resumes.main.path);
    if (existsSync(resumePath)) {
      existingResumeContent = await readFile(resumePath, 'utf-8');
    }

    // Prompt for profile data
    const profile = await promptForProfile(exampleConfig, existingProfile);

    // Prompt for resume content
    console.error(`\nEditing resume: ${existingProfile.resumes.main.path}`);
    const exampleResume = await loadExampleResume();
    const resumeContent = await promptForResume(exampleResume, existingResumeContent);

    // Update the profile
    config.profiles[profileName] = profile;

    // Write profile.json
    await writeFile(USER_PROFILE_PATH, JSON.stringify(config, null, 2), 'utf-8');

    // Write resume
    await mkdir(dirname(resumePath), { recursive: true });
    await writeFile(resumePath, resumeContent, 'utf-8');

    console.error(`\n✓ Edit complete!`);
    console.error(`  Profile: ${USER_PROFILE_PATH}`);
    console.error(`  Resume: ${resumePath}`);
    console.error(`  Profile name: ${profileName}`);

    return {
      profilePath: USER_PROFILE_PATH,
      resumePath,
      profileName,
    };
  } finally {
    closePrompts();
  }
}
