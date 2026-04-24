# Phase 1 Contract

## Purpose

This document freezes the Phase 1 behavior for the Resume and Cover Letter CLI Generator / Formatter.

Phase 1 produces:

1. A pasteable LLM prompt from a job posting URL and local user profile/resume data.
2. HTML resume and cover letter documents from generated JSON and a selected theme.

Phase 1 does not call an LLM API directly.

## Commands

### `prompt-generate`

```bash
resume-cli prompt-generate <job-post-url> [options]
```

Options:

```bash
--profile <profile-name>
--out <output-file>
```

`--profile` selects a profile key from `user-info/profile.json`. If omitted, use `defaultProfile`.

`--out` writes the generated prompt to a file. If omitted, print the prompt to stdout.

Inputs:

- `job-sites.config.json`
- `user-info/profile.json`
- the selected profile's `resumeFile`
- the fetched job posting HTML

Output: a plain text prompt instructing an LLM to generate one JSON object matching the generated content schema.

### `build-docs`

```bash
resume-cli build-docs <generated-json-file> <theme-name> <output-directory> [options]
```

Options:

```bash
--profile <profile-name>
```

The command reads generated JSON, merges it with the selected local profile, resolves the selected theme, and renders documents into a timestamped directory.

Example output:

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

## User profile contract

`user-info/profile.json` supports multiple profiles.

```json
{
  "defaultProfile": "default",
  "profiles": {
    "default": {
      "label": "Default Professional Profile",
      "resumeFile": "resumes/default.md",
      "name": {
        "full": "Example User",
        "first": "Example",
        "middle": "",
        "last": "User",
        "suffix": ""
      },
      "headline": "Web Developer and Software Engineer",
      "contact": {
        "email": "user@example.com",
        "phone": "555-555-5555",
        "address": {
          "line1": "",
          "line2": "",
          "city": "",
          "state": "",
          "postalCode": "",
          "country": "United States"
        },
        "links": {
          "website": "https://example.com",
          "linkedin": "https://linkedin.com/in/example",
          "github": "https://github.com/example",
          "gitlab": "",
          "portfolio": "",
          "other": [
            {
              "label": "Case Studies",
              "url": "https://example.com/case-studies"
            }
          ]
        }
      },
      "preferences": {
        "defaultTone": "professional",
        "includeAddressOnResume": false,
        "includeAddressOnCoverLetter": true,
        "includePhone": true,
        "includeEmail": true,
        "includeWebsite": true,
        "includeLinkedIn": true,
        "includeGitHub": true,
        "includeGitLab": false,
        "includePortfolio": true
      },
      "promptPreferences": {
        "tone": "professional",
        "skillsToEmphasize": ["TypeScript", "React"],
        "customInstructions": [
          "Prefer concrete language over vague claims."
        ]
      }
    }
  }
}
```

Rules:

- `defaultProfile` is required.
- `profiles` is required.
- `profiles[defaultProfile]` must exist.
- Profile keys must match `/^[a-z0-9_]+$/`.
- Each profile must define `resumeFile`.
- `resumeFile` paths are relative to `user-info/`.
- Multiple profiles may reference the same resume file.
- `promptPreferences` is optional.
- `preferences` is optional except where needed by templates.

## Prompt preferences contract

Prompt preferences are optional. Missing values are replaced with sensible defaults.

```json
{
  "tone": "professional",
  "targetRoleTypes": [],
  "industriesToEmphasize": [],
  "skillsToEmphasize": [],
  "skillsToAvoidOverstating": [],
  "experienceToEmphasize": [],
  "experienceToDeemphasize": [],
  "jobTypesToPrioritize": [],
  "jobTypesToDeprioritize": [],
  "coverLetterGuidance": {
    "openingStyle": "direct",
    "includePersonalMotivation": false,
    "avoidGenericPraise": true,
    "preferredLength": "medium"
  },
  "resumeGuidance": {
    "summaryStyle": "specific",
    "bulletStyle": "achievement_oriented",
    "maxBulletLength": "medium",
    "prioritizeKeywords": true
  },
  "customInstructions": []
}
```

Only `preferredLength` and `maxBulletLength` should be strict enums:

```text
short
medium
long
```

Other fields may remain flexible strings or string arrays.

## Generated JSON contract

The LLM output should contain tailored content only, not stable contact details.

```json
{
  "resume": {
    "headline": "",
    "summary": "",
    "skills": [
      {
        "category": "Frontend",
        "items": ["React", "TypeScript", "Accessibility"]
      }
    ],
    "experience": [
      {
        "company": "",
        "title": "",
        "location": "",
        "startDate": "",
        "endDate": "",
        "highlights": [""]
      }
    ],
    "projects": [
      {
        "name": "",
        "description": "",
        "highlights": [""],
        "url": ""
      }
    ],
    "education": [
      {
        "institution": "",
        "degree": "",
        "location": "",
        "startDate": "",
        "endDate": "",
        "details": [""]
      }
    ],
    "certifications": [
      {
        "name": "",
        "issuer": "",
        "date": ""
      }
    ]
  },
  "coverLetter": {
    "recipientName": "",
    "recipientTitle": "",
    "company": "",
    "companyAddress": "",
    "salutation": "",
    "paragraphs": [""],
    "closing": "Sincerely",
    "signature": ""
  },
  "metadata": {
    "targetRole": "",
    "targetCompany": "",
    "jobPostUrl": "",
    "keywords": [""],
    "tone": "professional",
    "generatedAt": ""
  }
}
```

Rules:

- The JSON represents one resume variant and one cover letter content set.
- Themes may produce multiple rendered resume or cover letter files from the same JSON.
- Do not require name, email, phone, address, LinkedIn, GitHub, GitLab, or website in this JSON.
- `coverLetter.signature` may be empty; renderers should fall back to `profile.name.full`.

## Job sites config contract

`job-sites.config.json` is part of the project and does not need to be specified from the CLI.

Example:

```json
{
  "example.com": {
    "name": "Example Jobs",
    "selectors": {
      "title": "h1",
      "company": ".company",
      "location": ".location",
      "description": ".description",
      "requirements": [".requirements", "#requirements"]
    },
    "cleanup": {
      "remove": ["script", "style", "nav", "footer"]
    }
  }
}
```

Selector rules:

- Selector values may be a string or array of strings.
- Arrays should be tried in order.
- Cleanup selectors should be removed before extraction.
- Exact subdomain match should be preferred over parent domain fallback.

Lookup order for `https://jobs.example.com/posting/123`:

```text
jobs.example.com
example.com
```

## Extracted job contract

The parser should normalize a posting into this shape:

```ts
{
  sourceUrl: string;
  sourceDomain: string;
  title?: string;
  company?: string;
  location?: string;
  employmentType?: string;
  compensation?: string;
  description: string;
  requirements?: string[];
  responsibilities?: string[];
  qualifications?: string[];
  benefits?: string[];
  rawText: string;
  extractedAt: string;
}
```

For Phase 1, it is acceptable if many optional fields are undefined. `description` and `rawText` are the most important.

## Theme contract

Theme names must match:

```ts
/^[a-z0-9_]+$/
```

Theme lookup order:

```text
themes/user/<theme-name>
themes/stock/<theme-name>
```

Example `theme.json`:

```json
{
  "name": "clean_professional",
  "displayName": "Clean Professional",
  "version": "1.0.0",
  "outputs": {
    "resumes": [
      {
        "name": "full",
        "template": "templates/resume.full.liquid",
        "output": "resume.full.html",
        "styles": ["styles/resume.css"]
      },
      {
        "name": "short",
        "template": "templates/resume.short.liquid",
        "output": "resume.short.html",
        "styles": ["styles/resume.css"]
      }
    ],
    "coverLetters": [
      {
        "name": "standard",
        "template": "templates/cover_letter.standard.liquid",
        "output": "cover_letter.standard.html",
        "styles": ["styles/cover_letter.css"]
      }
    ]
  },
  "assetsDir": "assets"
}
```

Theme rules:

- A theme may declare multiple resume outputs.
- A theme may declare multiple cover letter outputs.
- All outputs are generated from the same generated JSON and selected profile.
- Template paths are relative to the theme directory.
- Style paths are relative to the theme directory.
- Output paths must not escape the timestamped build directory.
- Asset directory is optional.

## Template render context

Each Liquid template receives:

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

`build` contains:

```ts
{
  timestamp: number;
  generatedAt: string;
}
```

## Output directory contract

`build-docs` creates a Unix timestamp directory inside the requested output directory.

```text
<output-directory>/<unix-timestamp>/
```

The renderer writes all generated files, styles, and assets inside that timestamped directory.

## Phase 1 completion criteria

These should work:

```bash
npm run dev -- prompt-generate https://example.com/job --profile default --out ./prompt.txt
```

```bash
npm run dev -- build-docs ./generated-content.json clean_professional ./output --profile default
```

The first command writes a complete pasteable prompt.

The second command writes one or more HTML documents into a timestamped build directory.
