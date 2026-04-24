# AGENTS.md

## Project name

Resume and Cover Letter CLI Generator / Formatter

## Project goal

Build a TypeScript Node.js CLI application that helps a user generate tailored resume and cover letter pairs.

Phase 1 has two main commands:

```bash
resume-cli prompt-generate <job-post-url>
resume-cli build-docs <generated-json-file> <theme-name> <output-directory>
```

The first command fetches and parses a job post, reads the selected local user profile and resume markdown, and generates a pasteable prompt for ChatGPT or another LLM.

The second command reads LLM-generated JSON, merges it with local profile data, applies a selected theme, and renders HTML documents.

## Core constraints

- Use TypeScript.
- Use Node.js.
- Use 2-space indentation.
- Keep the project modular.
- Keep commands thin; put behavior in reusable modules.
- Do not implement automatic LLM API calls in Phase 1.
- Do not implement PDF or DOCX output in Phase 1, but avoid designs that prevent adding them later.
- Do not store personal contact details in generated LLM JSON.
- Do not require users to pass `job-sites.config.json` on the command line; it is part of the project.
- Support Markdown resumes.
- Support multiple local profiles.
- Each profile must define a `resumeFile` path relative to `user-info/`.
- Multiple profiles may reference the same resume file.
- Generated JSON supports only one resume variant. Themes may produce multiple rendered outputs from that same data.

## Preferred libraries

Use these unless there is a strong reason not to:

- `commander` for CLI routing.
- `zod` for runtime schema validation.
- `cheerio` for static HTML parsing.
- `liquidjs` for theme templates.
- `fs-extra` for file and directory operations.
- `vitest` for tests.
- `tsx` for local development execution.

Avoid browser automation in Phase 1. Playwright can be considered later for JavaScript-heavy job boards.

## Source layout

```text
src/
  cli.ts
  commands/
    prompt-generate.ts
    build-docs.ts
  config/
    load-job-sites-config.ts
    load-user-profile.ts
    resolve-profile.ts
    load-user-resume.ts
    default-prompt-preferences.ts
    resolve-prompt-preferences.ts
  job-posts/
    fetch-page.ts
    domain-config.ts
    parse-job-post.ts
    extract-text.ts
    fallback-extract-job-post.ts
  prompts/
    build-resume-cover-letter-prompt.ts
    format-prompt-preferences.ts
  docs/
    build-docs.ts
    resolve-theme.ts
    render-theme.ts
    copy-theme-assets.ts
    copy-theme-styles.ts
  schemas/
    user-profile.schema.ts
    job-site-config.schema.ts
    extracted-job.schema.ts
    generated-content.schema.ts
    theme.schema.ts
  utils/
    paths.ts
    theme-name.ts
    timestamps.ts
```

## User data layout

```text
user-info/
  .gitkeep
  profile.example.json
  profile.json                 # gitignored
  resumes/
    .gitkeep
    default.example.md
    default.md                 # gitignored
    freelance.md               # gitignored
```

Important `.gitignore` rules:

```gitignore
user-info/profile.json
user-info/resumes/*
!user-info/resumes/.gitkeep
!user-info/resumes/*.example.md

themes/user/*
!themes/user/.gitkeep
```

## Theme layout

```text
themes/
  stock/
    clean_professional/
      theme.json
      templates/
      styles/
      assets/
  user/
    .gitkeep
```

Theme names must match:

```ts
/^[a-z0-9_]+$/
```

Theme resolution order:

```text
themes/user/<theme-name>
themes/stock/<theme-name>
```

User themes override stock themes by name.

## Testing expectations

Each job should add or update tests. Run these frequently:

```bash
npm run typecheck
npm test
```

When a job adds CLI behavior, also run an appropriate manual command with `npm run dev -- ...`.

## Coding style

- Use explicit function names.
- Prefer small modules over large command files.
- Avoid hidden global state.
- Validate external input at the edges.
- Throw clear errors that mention the file, command, profile, theme, or URL involved.
- Keep tests focused and deterministic.
- Use fixtures for HTML and JSON examples.
- Do not over-engineer Phase 1.

## Prompt-generation rules

The prompt generator must instruct the LLM to return only valid JSON.

The prompt must tell the LLM not to include stable local contact details in the returned JSON, including:

- email
- phone
- address
- LinkedIn URL
- GitHub URL
- GitLab URL
- personal website

Those values are merged later from the selected local profile.

The prompt may include the user's name, headline, selected profile label, high-level available links, prompt preferences, resume markdown, and extracted job information.

## Build-docs rules

`build-docs` must:

1. Load selected profile from `user-info/profile.json`.
2. Load and validate generated JSON.
3. Resolve selected theme.
4. Create a timestamped directory inside the supplied output directory.
5. Render every resume and cover letter output declared by the theme.
6. Copy referenced styles.
7. Copy theme assets if present.

Do not write outside the timestamped output directory.

## Phase 1 exclusions

Do not implement these unless a later task explicitly asks for them:

- automatic calls to OpenAI, Anthropic, or any other LLM API
- PDF rendering
- DOCX rendering
- Chromium/Playwright scraping
- user authentication
- GUI
- complex Markdown resume parsing into structured data
- multiple generated resume variants in the JSON
