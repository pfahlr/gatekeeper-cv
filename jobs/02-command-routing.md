# Job 02: Add Command Routing


Move command behavior out of `src/cli.ts` and into dedicated command modules.

## Files to create

```text
src/commands/prompt-generate.ts
src/commands/build-docs.ts
tests/commands/prompt-generate.test.ts
tests/commands/build-docs.test.ts
```

## Required behavior

### `prompt-generate`

```bash
resume-cli prompt-generate <job-post-url> --profile <profile-name> --out <output-file>
```

Placeholder output:

```text
Generating prompt for: <job-post-url>
Using profile: <profile-name>
Prompt output file: <output-file>
```

### `build-docs`

```bash
resume-cli build-docs <json-file> <theme-name> <output-directory> --profile <profile-name>
```

Placeholder output:

```text
Building docs from <json-file> using theme <theme-name> into <output-directory>
Using profile: <profile-name>
```

## Implementation notes

Export testable functions:

```ts
export async function runPromptGenerateCommand(jobPostUrl: string, options = {}): Promise<void>;
export async function runBuildDocsCommand(jsonFile: string, themeName: string, outputDirectory: string, options = {}): Promise<void>;
```

## Validation

```bash
npm run typecheck
npm test
npm run dev -- prompt-generate https://example.com/job --profile default --out ./prompt.txt
npm run dev -- build-docs ./sample.json clean_professional ./output --profile default
```

## Acceptance criteria

- CLI routes commands to modules.
- Options are accepted.
- Tests verify handlers can be invoked.
