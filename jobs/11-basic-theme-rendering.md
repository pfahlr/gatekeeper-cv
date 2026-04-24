# Job 11: Implement Basic Theme Rendering


Implement enough of `build-docs` to render one resume HTML file and one cover letter HTML file from generated JSON and a stock theme.

## Example job URLs

- Monster: https://www.monster.com/job-openings/lead-sap-full-stack-developer-holland-mi--de5e5a9f-ba6c-455b-b5b3-133f060a8f85
- NextStep Systems: https://www.nextstepsystems.com/job/mid-senior-php-full-stack-developer-100-onsite/?utm_source=ziprecruiter
- Web Archive (for testing): https://web.archive.org/web/20260424184451/https://www.nextstepsystems.com/job/mid-senior-php-full-stack-developer-100-onsite/?utm_source=ziprecruiter

## Files to create

```text
src/docs/resolve-theme.ts
src/docs/render-theme.ts
src/docs/build-docs.ts
themes/stock/clean_professional/theme.json
themes/stock/clean_professional/templates/resume.full.liquid
themes/stock/clean_professional/templates/cover_letter.standard.liquid
themes/stock/clean_professional/styles/resume.css
themes/stock/clean_professional/styles/cover_letter.css
tests/docs/resolve-theme.test.ts
tests/docs/render-theme.test.ts
tests/docs/build-docs.test.ts
tests/fixtures/generated-content.valid.json
```

## Theme resolution

Lookup order:

```text
themes/user/<theme-name>
themes/stock/<theme-name>
```

Validate theme name, load `theme.json`, validate schema, and ensure config `name` matches the requested theme.

## Build behavior

```ts
export async function buildDocs(params: {
  generatedJsonFile: string;
  themeName: string;
  outputDirectory: string;
  profileName?: string;
}): Promise<{ outputDirectory: string; files: string[] }>;
```

Steps:

1. Load selected profile.
2. Load generated JSON.
3. Validate generated JSON.
4. Resolve theme.
5. Create timestamped output directory.
6. Render first resume output.
7. Render first cover letter output.
8. Return output directory and files.

## Render context

```ts
{
  profile,
  selectedProfileName,
  resume,
  coverLetter,
  metadata,
  theme,
  build
}
```

## CLI integration

Expected output:

```text
Documents written to ./output/1713975512
Generated files:
- resume.full.html
- cover_letter.standard.html
```

## Validation

```bash
npm run typecheck
npm test
npm run dev -- build-docs tests/fixtures/generated-content.valid.json clean_professional ./output --profile default
```

## Acceptance criteria

- Renders basic HTML files.
- Selected profile data appears in HTML.
- Generated content appears in HTML.
- Theme resolution checks user themes before stock themes.
