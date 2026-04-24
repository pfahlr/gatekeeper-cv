# Job 07: Load and Match job-sites.config.json


Load parser configuration from `job-sites.config.json` and match it to a job posting URL by domain.

## Files to create

```text
src/config/load-job-sites-config.ts
src/job-posts/domain-config.ts
tests/config/load-job-sites-config.test.ts
tests/job-posts/domain-config.test.ts
tests/fixtures/job-sites.config.valid.json
tests/fixtures/job-sites.config.invalid.json
```

## Functions

```ts
export async function loadJobSitesConfig(configPath?: string): Promise<JobSitesConfig>;

export function findJobSiteConfigForUrl(
  jobPostUrl: string,
  config: JobSitesConfig
): { matchedDomain: string; siteConfig: JobSiteConfig } | undefined;
```

## Domain matching

For:

```text
https://jobs.example.com/posting/123
```

Try:

```text
jobs.example.com
example.com
```

Do not implement public suffix complexity in Phase 1.

## CLI integration

Print:

```text
Matched job site config: example.com
```

or:

```text
No job site config matched. Fallback extraction will be used.
```

## Validation

```bash
npm run typecheck
npm test
```

## Acceptance criteria

- Config loading works.
- Invalid config fails.
- Exact domain match wins.
- Parent domain fallback works.
