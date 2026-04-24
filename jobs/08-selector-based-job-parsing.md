# Job 08: Parse Job Posting with Selectors


Use domain config selectors to extract structured job posting information from HTML.

## Example job URLs

- Monster: https://www.monster.com/job-openings/lead-sap-full-stack-developer-holland-mi--de5e5a9f-ba6c-455b-b5b3-133f060a8f85
- NextStep Systems: https://www.nextstepsystems.com/job/mid-senior-php-full-stack-developer-100-onsite/?utm_source=ziprecruiter
- Web Archive (for testing): https://web.archive.org/web/20260424184451/https://www.nextstepsystems.com/job/mid-senior-php-full-stack-developer-100-onsite/?utm_source=ziprecruiter

## Files to create

```text
src/job-posts/parse-job-post.ts
src/job-posts/extract-text.ts
tests/job-posts/parse-job-post.test.ts
tests/fixtures/job-posts/example.html
```

## Function

```ts
export function parseJobPost(params: {
  url: string;
  html: string;
  matchedDomain?: string;
  siteConfig?: JobSiteConfig;
}): ExtractedJob;
```

## Selector behavior

Support selector values as `string` or `string[]`.

For arrays, try selectors in order and use the first non-empty extraction.

## Cleanup behavior

Remove selectors listed in config cleanup, and always remove:

```text
script
style
noscript
```

## Helpers

```ts
extractFirstText($, selectorOrSelectors)
extractListText($, selectorOrSelectors)
normalizeWhitespace(text)
```

## Fields

Support:

```text
title
company
location
employmentType
compensation
description
requirements
responsibilities
qualifications
benefits
rawText
```

Always set:

```text
sourceUrl
sourceDomain
description
rawText
extractedAt
```

## CLI integration

Print an extraction summary:

```text
Title: Mid-Senior PHP Full Stack Developer
Company: NextStep Systems
Location: On-site
Description length: 3284 characters
Raw text length: 5972 characters
```

## Validation

```bash
npm run typecheck
npm test
```

## Acceptance criteria

- Extracts configured fields from fixture HTML.
- Supports selector arrays.
- Removes cleanup selectors.
- Output validates against `ExtractedJobSchema`.
