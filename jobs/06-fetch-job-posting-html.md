# Job 06: Fetch Job Posting HTML


Implement static HTML fetching for job posting URLs.

## Files to create

```text
src/job-posts/fetch-page.ts
tests/job-posts/fetch-page.test.ts
```

## Function

```ts
export async function fetchPage(url: string): Promise<string>;
```

## Behavior

- Validate HTTP or HTTPS URL.
- Fetch using global `fetch`.
- Throw helpful error for non-2xx responses.
- Reject clearly non-HTML content types.
- Return response text.
- Throw if the response body is empty.

Allowed content types:

```text
text/html
application/xhtml+xml
```

If content type is missing, allow the response and rely on text content.

## CLI integration

Update `prompt-generate` to fetch the page and print:

```text
Fetched page: 58291 characters
```

Do not print the full HTML.

## Tests

Mock global `fetch` and cover:

- valid HTML
- 404
- 500
- invalid URL
- unsupported protocol
- non-HTML content type
- empty response
- missing content type with non-empty response

## Validation

```bash
npm run typecheck
npm test
```

## Acceptance criteria

- Fetching is implemented and tested.
- CLI prints fetched character count.
- Errors are actionable.
