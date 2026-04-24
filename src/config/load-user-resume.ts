import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Profile } from '../schemas/user-profile.schema.js';
import { getUserInfoFilePath } from '../utils/paths.js';

export interface LoadUserResumeOptions {
  basePath?: string;
}

export async function loadUserResumeMarkdown(
  profile: Profile,
  resumeName = 'main',
  options: LoadUserResumeOptions = {}
): Promise<string> {
  const resumeMetadata = profile.resumes[resumeName];
  if (!resumeMetadata) {
    throw new Error(
      `Resume "${resumeName}" not found in profile. Available resumes: ${Object.keys(
        profile.resumes
      ).join(', ')}`
    );
  }

  const basePath = options.basePath ?? getUserInfoFilePath('.');
  const resumePath = join(basePath, resumeMetadata.path);
  const content = await readFile(resumePath, 'utf-8');

  const trimmed = content.trim();
  if (!trimmed) {
    throw new Error(
      `Resume file is empty: ${resumePath}`
    );
  }

  return trimmed;
}
