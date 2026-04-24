import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import type { UserProfile, Profile } from '../schemas/user-profile.schema.js';
import { userProfileSchema } from '../schemas/user-profile.schema.js';
import { prompt, promptMultiline, promptUrl, promptGithubUsername, promptLinkedinProfile, closePrompts } from './prompts.js';
import { parseResumeSkillCategories, type SkillCategory } from './parse-resume-skills.js';

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
async function promptForProfile(
  example: UserProfile,
  existing?: Profile,
  profileName: string = 'default',
  resumeContent?: string
): Promise<Profile> {
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

  // Prompt for skills grouping if we have resume content
  let skillsGrouping: { enabled: boolean; categories: string[] } | undefined;
  if (resumeContent) {
    skillsGrouping = await promptForSkillCategories(resumeContent);
  } else if (existing?.skillsGrouping) {
    // Keep existing grouping if no resume content provided
    skillsGrouping = existing.skillsGrouping;
  }

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
    skillsGrouping,
    resumes: {
      main: {
        path: resumeFile,
        description: 'Main resume',
      },
    },
  };
}

/**
 * Prompt for skill category configuration
 */
async function promptForSkillCategories(resumeContent: string): Promise<{ enabled: boolean; categories: string[] }> {
  console.error('\n=== Skills Grouping ===');
  console.error('Your resume contains skill categories. Would you like to group skills by category when generating resumes?');

  const enableGrouping = await prompt('Group skills by category? (y/n)', 'n');
  const enabled = enableGrouping.toLowerCase().startsWith('y');

  if (!enabled) {
    return { enabled: false, categories: [] };
  }

  // Parse categories from resume
  const parsedCategories = parseResumeSkillCategories(resumeContent);

  if (parsedCategories.length === 0) {
    console.error('\nNo skill categories found in resume. Using flat skill list.');
    return { enabled: false, categories: [] };
  }

  console.error(`\nFound ${parsedCategories.length} skill categories in your resume:`);
  console.error('For each category, you can:');
  console.error('  - Enter new text to rename the category');
  console.error('  - Enter "x" to remove this category');
  console.error('  - Press Enter to keep the category as-is\n');

  const finalCategories: string[] = [];

  for (const category of parsedCategories) {
    const skillsPreview = category.skills.slice(0, 5).join(', ');
    const skillsMore = category.skills.length > 5 ? '...' : '';

    console.error(`Category: "${category.name}"`);
    console.error(`  Skills preview: ${skillsPreview}${skillsMore}`);

    const response = await prompt(`  Keep, rename, or remove (x)?`, category.name);

    if (response.toLowerCase() === 'x') {
      console.error(`  → Removed "${category.name}"\n`);
    } else if (response.trim() === '') {
      finalCategories.push(category.name);
      console.error(`  → Kept "${category.name}"\n`);
    } else {
      finalCategories.push(response.trim());
      console.error(`  → Renamed to "${response.trim()}"\n`);
    }
  }

  return { enabled: true, categories: finalCategories };
}

/**
 * Prompt for resume content with default content
 */
async function promptForResume(defaultContent: string, existingContent?: string): Promise<string> {
  console.error('\n=== Resume Content ===');
  console.error('Paste your resume in Markdown format.');
  console.error('Press Enter on an empty line to use the current content, or paste your own and press Enter on an empty line when done.\n');

  const lines: string[] = [];
  let pasting = true;

  while (pasting) {
    const line = await prompt('>');

    if (line === '' && lines.length === 0) {
      // User wants to use default content
      console.error('Using existing/default content.');
      return defaultContent;
    } else if (line === '') {
      // Done pasting
      pasting = false;
    } else {
      lines.push(line);
    }
  }

  const content = lines.join('\n');
  return content.trim() || defaultContent;
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

    // First, ask for resume file path and load the content
    const resumeFile = await prompt(
      'Resume file (relative to user-info/)',
      'resumes/default.md'
    );
    const resumePath = join(USER_INFO_DIR, resumeFile);
    const resumeDir = dirname(resumePath);
    await mkdir(resumeDir, { recursive: true });

    // Check if resume file already exists and load it
    let resumeContent = exampleResume;
    if (existsSync(resumePath)) {
      console.error(`\nFound existing resume at ${resumeFile}`);
      const useExisting = await prompt('Use existing resume for skill category detection? (y/n)', 'y');
      if (useExisting.toLowerCase().startsWith('y')) {
        resumeContent = await readFile(resumePath, 'utf-8');
      }
    }

    // Prompt for profile data with resume content for skill category parsing
    const profile = await promptForProfile(exampleConfig, undefined, profileName, resumeContent);

    // Override the resume file path in the profile
    profile.resumes = {
      main: {
        path: resumeFile,
        description: 'Main resume',
      },
    };

    // Prompt for resume content
    console.error(`\nConfiguring resume: ${resumeFile}`);
    const finalResumeContent = await promptForResume(resumeContent, resumeContent);

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
    await writeFile(resumePath, finalResumeContent, 'utf-8');

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

    // Load existing resume for skill category detection
    const resumePath = join(USER_INFO_DIR, existingProfile.resumes.main.path);
    let existingResumeContent: string | undefined;
    if (existsSync(resumePath)) {
      existingResumeContent = await readFile(resumePath, 'utf-8');
    }

    // Prompt for profile data with resume content for skill category parsing
    const profile = await promptForProfile(exampleConfig, existingProfile, profileName, existingResumeContent);

    // Prompt for resume content
    console.error(`\nEditing resume: ${existingProfile.resumes.main.path}`);
    const exampleResume = await loadExampleResume();
    const finalResumeContent = await promptForResume(exampleResume, existingResumeContent);

    // Update the profile
    config.profiles[profileName] = profile;

    // Write profile.json
    await writeFile(USER_PROFILE_PATH, JSON.stringify(config, null, 2), 'utf-8');

    // Write resume
    await mkdir(dirname(resumePath), { recursive: true });
    await writeFile(resumePath, finalResumeContent, 'utf-8');

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
