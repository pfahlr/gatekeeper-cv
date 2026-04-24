# Job 05: Add Prompt Preferences Merging


Support optional per-profile `promptPreferences` with sensible defaults.

## Files to create

```text
src/config/default-prompt-preferences.ts
src/config/resolve-prompt-preferences.ts
tests/config/prompt-preferences.test.ts
```

## Defaults

```ts
export const defaultPromptPreferences = {
  tone: "professional",
  targetRoleTypes: [],
  industriesToEmphasize: [],
  skillsToEmphasize: [],
  skillsToAvoidOverstating: [],
  experienceToEmphasize: [],
  experienceToDeemphasize: [],
  jobTypesToPrioritize: [],
  jobTypesToDeprioritize: [],
  coverLetterGuidance: {
    openingStyle: "direct",
    includePersonalMotivation: false,
    avoidGenericPraise: true,
    preferredLength: "medium"
  },
  resumeGuidance: {
    summaryStyle: "specific",
    bulletStyle: "achievement_oriented",
    maxBulletLength: "medium",
    prioritizeKeywords: true
  },
  customInstructions: []
} as const;
```

## Merge behavior

```ts
export function resolvePromptPreferences(profilePromptPreferences?: UserProfile["promptPreferences"]): ResolvedPromptPreferences;
```

Rules:

- Missing preferences return defaults.
- Top-level supplied fields override defaults.
- Nested `coverLetterGuidance` and `resumeGuidance` merge with defaults.
- Arrays supplied by the profile replace default arrays.
- Do not mutate the default object.

## Validation

```bash
npm run typecheck
npm test
```

## Acceptance criteria

- Missing preferences work.
- Partial overrides work.
- Nested merges work.
- Invalid `preferredLength` or `maxBulletLength` fails schema validation.
