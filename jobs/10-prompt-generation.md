# Job 10: Build the Prompt Generator


Generate the final pasteable LLM prompt from extracted job data, selected profile summary, resolved prompt preferences, and Markdown resume.

## Example job URLs

- Monster: https://www.monster.com/job-openings/lead-sap-full-stack-developer-holland-mi--de5e5a9f-ba6c-455b-b5b3-133f060a8f85
- NextStep Systems: https://www.nextstepsystems.com/job/mid-senior-php-full-stack-developer-100-onsite/?utm_source=ziprecruiter
- Web Archive (for testing): https://web.archive.org/web/20260424184451/https://www.nextstepsystems.com/job/mid-senior-php-full-stack-developer-100-onsite/?utm_source=ziprecruiter

## Files to create

```text
src/prompts/build-resume-cover-letter-prompt.ts
src/prompts/format-prompt-preferences.ts
tests/prompts/build-resume-cover-letter-prompt.test.ts
```

Snapshot tests are recommended but optional.

## Function

```ts
export function buildResumeCoverLetterPrompt(params: {
  extractedJob: ExtractedJob;
  profile: UserProfile;
  selectedProfileName: string;
  resumeMarkdown: string;
  promptPreferences: ResolvedPromptPreferences;
}): string;
```

## Required prompt sections

1. Task
2. Output rules
3. JSON schema
4. Selected profile summary
5. Prompt preferences
6. Extracted job information
7. Source resume markdown
8. Grounding rules

## Required output rules

The prompt must say:

```text
Return only valid JSON.
Do not include Markdown.
Do not include comments.
Do not include explanatory text outside the JSON object.
```

## Contact exclusion rule

The prompt must say:

```text
Do not include the user's email, phone number, address, LinkedIn URL, GitHub URL, GitLab URL, or personal website in the returned JSON. Those values will be merged later from the local profile.
```

## Grounding rule

Include:

```text
Do not invent degrees, certifications, employers, dates, titles, or metrics that are not present in the supplied resume.
You may rephrase, reorganize, and emphasize relevant experience, but factual claims must remain grounded in the supplied material.
```

## CLI integration

`prompt-generate` now prints the full prompt to stdout or writes it to `--out`.

If `--out` is supplied:

```text
Prompt written to ./prompt.txt
```

If `--out` is omitted, print only the prompt to stdout. Any status messages should go to stderr.

## Validation

```bash
npm run typecheck
npm test
npm run dev -- prompt-generate https://www.monster.com/job-openings/lead-sap-full-stack-developer-holland-mi--de5e5a9f-ba6c-455b-b5b3-133f060a8f85 --profile default --out ./prompt.txt
```

## Acceptance criteria

- Prompt includes job data, resume markdown, prompt preferences, JSON schema, and grounding rules.
- Prompt excludes raw contact values where appropriate.
- `prompt-generate` produces a complete pasteable prompt.
