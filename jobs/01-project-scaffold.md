# Job 01: Initialize Project Scaffold


Create the basic TypeScript Node.js CLI project structure. The project should install, typecheck, and show a CLI help screen.

## Files to create

```text
package.json
tsconfig.json
.gitignore
job-sites.config.json
src/cli.ts
src/commands/.gitkeep
src/config/.gitkeep
src/job-posts/.gitkeep
src/prompts/.gitkeep
src/docs/.gitkeep
src/schemas/.gitkeep
src/utils/.gitkeep
themes/stock/.gitkeep
themes/user/.gitkeep
user-info/.gitkeep
user-info/resumes/.gitkeep
```

## Dependencies

```bash
npm install commander zod cheerio liquidjs fs-extra
npm install -D typescript tsx vitest @types/node @types/fs-extra
```

## Scripts

```json
{
  "scripts": {
    "dev": "tsx src/cli.ts",
    "build": "tsc",
    "start": "node dist/cli.js",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

## CLI behavior

`src/cli.ts` should use `commander` and define both commands with descriptions:

```text
prompt-generate <job-post-url>
build-docs <json-file> <theme-name> <output-directory>
```

Handlers can be placeholders in this job.

## Validation

```bash
npm run typecheck
npm run dev -- --help
```

## Acceptance criteria

- TypeScript compiles.
- CLI help prints.
- Both Phase 1 commands appear in help output.
- Private profile/resume files and custom user themes are gitignored.
