# Job 03: Add Core Schemas


Define runtime validation schemas with Zod for the major project contracts.

## Files to create

```text
src/schemas/user-profile.schema.ts
src/schemas/job-site-config.schema.ts
src/schemas/extracted-job.schema.ts
src/schemas/generated-content.schema.ts
src/schemas/theme.schema.ts
src/utils/name-validation.ts
tests/schemas/user-profile.schema.test.ts
tests/schemas/job-site-config.schema.test.ts
tests/schemas/generated-content.schema.test.ts
tests/schemas/theme.schema.test.ts
```

## Rules

Theme names and profile names must match:

```ts
/^[a-z0-9_]+$/
```

## Schemas

Create schemas and inferred TypeScript types for:

- user profile config
- job site config
- extracted job object
- generated content JSON
- theme config

The user profile schema must validate that `profiles[defaultProfile]` exists.

The theme schema must require at least one declared resume or cover letter output.

Only generated content fields necessary for minimal rendering should be required:

- `resume`
- `coverLetter`
- `coverLetter.paragraphs`

## Validation

```bash
npm run typecheck
npm test
```

## Acceptance criteria

- Valid profile config passes.
- Invalid default profile fails.
- Invalid profile/theme names fail.
- Minimal generated content passes.
- Theme with no outputs fails.
