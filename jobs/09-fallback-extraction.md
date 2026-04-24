# Job 09: Add Fallback Extraction


Extract useful job posting text even when no domain config exists or configured extraction is weak.

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
