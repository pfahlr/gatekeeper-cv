import { readFile } from 'node:fs/promises';
import { userProfileSchema, type UserProfile } from '../schemas/user-profile.schema.js';
import { getDefaultProfilePath } from '../utils/paths.js';

export interface UserProfileConfig {
  config: UserProfile;
  sourcePath: string;
}

export async function loadUserProfileConfig(
  profilePath?: string
): Promise<UserProfileConfig> {
  const path = profilePath ?? getDefaultProfilePath();

  const content = await readFile(path, 'utf-8');
  const parsed = JSON.parse(content);
  const config = userProfileSchema.parse(parsed);

  return {
    config,
    sourcePath: path,
  };
}
