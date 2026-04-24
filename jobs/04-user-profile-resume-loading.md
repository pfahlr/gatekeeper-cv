# Job 04: Add User Profile and Resume Loading


Load `user-info/profile.json`, resolve the selected profile, and read that profile's Markdown resume file.

## Files to create

```text
src/config/load-user-profile.ts
src/config/resolve-profile.ts
src/config/load-user-resume.ts
src/utils/paths.ts
user-info/profile.example.json
user-info/resumes/default.example.md
tests/config/user-profile-loading.test.ts
tests/fixtures/user-info/profile.valid.json
tests/fixtures/user-info/resumes/default.md
```

## Path rules

Default profile file:

```text
user-info/profile.json
```

Resume paths are relative to:

```text
user-info/
```

So this:

```json
{ "resumeFile": "resumes/default.md" }
```

resolves to:

```text
user-info/resumes/default.md
```

## Functions

```ts
export async function loadUserProfileConfig(profilePath?: string): Promise<UserProfileConfig>;
export function resolveProfile(config: UserProfileConfig, requestedProfileName?: string): ResolvedProfile;
export async function loadUserResumeMarkdown(profile: UserProfile): Promise<string>;
```

## CLI integration

Update `prompt-generate` placeholder behavior so it loads the selected profile and resume.

Expected output:

```text
Generating prompt for: https://example.com/job
Using profile: default
Loaded resume: 1234 characters
```

## Validation

```bash
cp user-info/profile.example.json user-info/profile.json
cp user-info/resumes/default.example.md user-info/resumes/default.md
npm run dev -- prompt-generate https://example.com/job --profile default
npm run typecheck
npm test
```

## Acceptance criteria

- Loads valid profile config.
- Resolves default and named profiles.
- Throws when requested profile does not exist.
- Throws when resume file is missing or empty.
