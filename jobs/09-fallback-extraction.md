# Job 09: Add Fallback Extraction


Extract useful job posting text even when no domain config exists or configured extraction is weak.

## Example job URLs

- Monster: https://www.monster.com/job-openings/lead-sap-full-stack-developer-holland-mi--de5e5a9f-ba6c-455b-b5b3-133f060a8f85
- NextStep Systems: https://www.nextstepsystems.com/job/mid-senior-php-full-stack-developer-100-onsite/?utm_source=ziprecruiter
- Web Archive (for testing): https://web.archive.org/web/20260424184451/https://www.nextstepsystems.com/job/mid-senior-php-full-stack-developer-100-onsite/?utm_source=ziprecruiter

## Files to create

```text
src/job-posts/fallback-extract-job-post.ts
tests/job-posts/fallback-extract-job-post.test.ts
tests/fixtures/job-posts/no-config.html
tests/fixtures/job-posts/weak-config.html
```

## Functions

```ts
export function fallbackExtractJobPost(params: {
  url: string;
  html: string;
}): ExtractedJob;

export function isWeakExtraction(job: ExtractedJob): boolean;
```

## Fallback behavior

Use Cheerio:

1. Load HTML.
2. Remove `script`, `style`, `noscript`, `nav`, `footer`, `header`, `aside`.
3. Extract possible title from `h1` or `title`.
4. Extract body text as `rawText`.
5. Use body text as `description`.
6. Set `sourceUrl`, `sourceDomain`, and `extractedAt`.

## Weak extraction rule

Suggested:

```ts
job.description.trim().length < 500 && job.rawText.trim().length > job.description.trim().length
```

Also treat as weak when:

```ts
job.rawText.trim().length < 200
```

## CLI integration

Use fallback when:

- no config matched
- configured extraction was weak

Print why fallback was used.

## Validation

```bash
npm run typecheck
npm test
```

## Acceptance criteria

- Unknown domains still extract useful text.
- Weak configured extraction triggers fallback.
- Fallback removes noise.
- Sparse HTML does not crash.
