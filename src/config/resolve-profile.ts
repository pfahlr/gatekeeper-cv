import type { UserProfile, Profile } from '../schemas/user-profile.schema.js';

export interface ResolvedProfile {
  name: string;
  profile: Profile;
}

export function resolveProfile(
  config: UserProfile,
  requestedProfileName?: string
): ResolvedProfile {
  const profileName = requestedProfileName ?? config.defaultProfile;

  const profile = config.profiles[profileName];
  if (!profile) {
    throw new Error(
      `Profile "${profileName}" not found. Available profiles: ${Object.keys(
        config.profiles
      ).join(', ')}`
    );
  }

  return {
    name: profileName,
    profile,
  };
}
