# Job 12: Support Multiple Theme Outputs and Asset Copying


Complete the Phase 1 document renderer.

A theme may define multiple resume templates and multiple cover letter templates. The renderer must generate all declared outputs and copy referenced styles/assets.

## Files to create or update

```text
src/docs/copy-theme-assets.ts
src/docs/copy-theme-styles.ts
src/docs/build-docs.ts
themes/stock/clean_professional/templates/resume.short.liquid
tests/docs/copy-theme-assets.test.ts
tests/docs/copy-theme-styles.test.ts
tests/docs/multi-output-rendering.test.ts
```

## Rendering behavior

Render every item in:

```text
outputs.resumes
outputs.coverLetters
```

All outputs use the same render context.

## Style copying behavior

Collect every unique style referenced by every output and copy it into the timestamped build directory, preserving relative path.

Example:

```text
themes/stock/clean_professional/styles/resume.css
```

copies to:

```text
output/1713975512/styles/resume.css
```

## Asset copying behavior

If `assetsDir` is defined and exists, copy it into the timestamped build directory.

If `assetsDir` is defined but missing, do not fail.

## Path safety

Reject paths that escape the theme directory or build directory.

Applies to:

- template paths
- style paths
- output paths
- assets directory path

Reject traversal like:

```text
../outside.html
../../secret.css
```

## Expected output

```text
output/
  1713975512/
    resume.full.html
    resume.short.html
    cover_letter.standard.html
    styles/
      resume.css
      cover_letter.css
    assets/
      ...
```

## Validation

```bash
npm run typecheck
npm test
npm run dev -- build-docs tests/fixtures/generated-content.valid.json clean_professional ./output --profile default
```

## Acceptance criteria

- Renders all resume outputs.
- Renders all cover letter outputs.
- Copies referenced styles.
- Deduplicates styles.
- Copies assets when present.
- Missing assets do not fail.
- Unsafe paths are rejected.
- Phase 1 renderer is complete.
