```
   ███ ███ ███ ███ █ █ ███ ███ ███ ███ ███    ███ █ █
   █   █ █  █  █   █ █ █   █   █ █ █   █ █    █   █ █
   █   █ █  █  ███ ██  ███ ███ ███ ███ ██  ██ █   █ █
   █ █ ███  █  █   █ █ █   █   █   █   █ █    █   █ █
   ███ █ █  █  ███ █ █ ███ ███ █   ███ █ █    ███  █
BECAUSE FINDING THE JOB IS UNPAID LABOR. AND IT SHOULD NOT
BE ORDERS OF MAGNITUDE MORE DIFFICULT THAN THE JOB ITSELF!
```

# Gatekeeper CV

A CLI tool for generating tailored resume and cover letter prompts and rendering generated content into themed documents.

## Overview

Gatekeeper CV helps you customize your resume and cover letter for specific job postings. It extracts job posting details from URLs, generates detailed prompts for LLMs, and renders the AI-generated content into professional HTML documents using customizable themes.

## Installation

```bash
npm install
npm run build
npm link
```

## Quick Start

1. **Set up your user profile (interactive):**

```bash
npm run dev -- setup
```

This will prompt you for:
- Name, email, phone, location
- Website (`https://` is shown, just complete the URL)
- GitHub (username only → becomes `https://github.com/username`)
- LinkedIn (complete `https://linkedin.com/in/` with your profile)
- Skills, summary, resume content

Press Enter to skip any optional field.

2. **Generate a prompt for a job posting:**

```bash
npm run dev -- prompt-generate https://example.com/job-posting
# Creates ./output/prompt.<timestamp>.txt
```

3. **Use the generated prompt with an LLM** (ChatGPT, Claude, etc.) to get tailored resume and cover letter content. Save the LLM's JSON response.

4. **Render the generated content into HTML documents:**

```bash
gatekeeper-cv build-docs generated.json clean_professional ./output
```

## Commands

### `setup`

Set up your user profile and resume interactively.

```bash
gatekeeper-cv setup [options]
```

**Options:**
- `--profile <profile-name>` - Profile name to create (default: `default`)

**Example:**

```bash
# Create default profile
gatekeeper-cv setup

# Create a specific profile
gatekeeper-cv setup --profile frontend
```

The command will prompt you for:
- Personal information (name, email, phone, location)
- Website (enter URL starting at `https://`)
- GitHub (enter username only, e.g., `username` → `https://github.com/username`)
- LinkedIn (complete the URL, e.g., `username` → `https://linkedin.com/in/username`)
- Professional summary (multiline)
- Skills (comma-separated)
- Resume file location
- Resume content (multiline Markdown)

Press Enter at any prompt to skip that field (except required fields). For the resume, press Enter on an empty line to use `[example-content]`, or paste your own resume and press Enter on an empty line when finished.

### `edit-setup`

Edit an existing user profile and resume interactively.

```bash
gatekeeper-cv edit-setup [options]
```

**Options:**
- `--profile <profile-name>` - Profile name to edit (default: `default`)

**Example:**

```bash
# Edit default profile
gatekeeper-cv edit-setup

# Edit a specific profile
gatekeeper-cv edit-setup --profile frontend
```

### `prompt-generate`

Generate a tailored prompt for a specific job posting.

```bash
gatekeeper-cv prompt-generate [job-post-url] [options]
```

**Arguments:**
- `[job-post-url]` - URL of the job posting to analyze (optional - will prompt if not provided)

**Options:**
- `--profile <profile-name>` - Profile name to use (default: prompts for `default`)
- `--out <output-file>` - Output file for the generated prompt (default: `./output/prompt.<timestamp>.txt`)
- `--description <text>` - Job description (use if fetching fails - paste the description directly)
- `--title <text>` - Job title (use with `--description`)
- `--company <text>` - Company name (use with `--description`)

**Interactive Mode:**

If you run `prompt-generate` without arguments, it will prompt you for the required values:

```bash
gatekeeper-cv prompt-generate
# prompts for URL, profile name, and output file
```

You can also provide some arguments and be prompted for the rest:

```bash
gatekeeper-cv prompt-generate https://careers.example.com/job/123
# prompts for profile name and output file
```

**Examples:**

```bash
# All arguments provided
gatekeeper-cv prompt-generate https://careers.example.com/job/123 --profile default --out my-prompt.txt

# Use default output (creates ./output/prompt.<timestamp>.txt)
gatekeeper-cv prompt-generate https://careers.example.com/job/123

# Interactive - prompts for missing values
gatekeeper-cv prompt-generate

# URL provided, prompts for profile
gatekeeper-cv prompt-generate https://careers.example.com/job/123

# If a job board blocks automated requests, paste the description manually
gatekeeper-cv prompt-generate https://www.monster.com/job/example \
  --title "Senior Software Engineer" \
  --company "Tech Company" \
  --description "We are looking for a senior software engineer..."
```

**Note:** Some job boards (Monster, Indeed, etc.) block automated requests. If you encounter a 403 error, use the `--description` option to paste the job posting content directly. Always quote URLs containing special characters like `?` and `&`.

### `build-docs`

Render generated content into themed documents.

```bash
gatekeeper-cv build-docs [json-file] [theme-name] [output-directory] [options]
```

**Arguments:**
- `[json-file]` - JSON file containing LLM-generated content (optional - will prompt if not provided)
- `[theme-name]` - Name of the theme to use (optional - defaults to `clean_professional`)
- `[output-directory]` - Directory where output files will be written (optional - defaults to `./output`)

**Options:**
- `--profile <profile-name>` - Profile name to use (default: `default`)

**Interactive Mode:**

If you run `build-docs` without arguments, it will prompt you for the required values:

```bash
gatekeeper-cv build-docs
# prompts for JSON file, theme name, and output directory
```

**Example:**

```bash
# All arguments provided
gatekeeper-cv build-docs generated.json clean_professional ./output

# Interactive - prompts for missing values
gatekeeper-cv build-docs

# JSON file provided, prompts for theme and output
gatekeeper-cv build-docs generated.json
```

## Configuration

### User Profile (`user-info/profile.json`)

Defines your profiles, each with personal info, resume file, and optional prompt preferences.

```json
{
  "defaultProfile": "default",
  "profiles": {
    "default": {
      "name": "Your Name",
      "email": "you@example.com",
      "phone": "555-123-4567",
      "location": "San Francisco, CA",
      "linkedin": "linkedin.com/in/yourprofile",
      "github": "github.com/yourusername",
      "summary": "Software engineer with expertise in...",
      "skills": ["JavaScript", "TypeScript", "Node.js", "React"],
      "resumeFile": "resumes/default.md",
      "promptPreferences": {
        "tone": "professional",
        "targetRoleTypes": ["software-engineer", "full-stack"],
        "industriesToEmphasize": ["technology", "healthcare"]
      }
    }
  }
}
```

### Job Sites Configuration (`job-sites.config.json`)

Defines how to extract job posting details from different job boards.

```json
{
  "sites": {
    "monster.com": {
      "selectors": {
        "title": "h1.job-title",
        "company": ".company-name",
        "description": ".job-description"
      }
    },
    "indeed.com": {
      "selectors": {
        "title": "#jobTitle",
        "company": "[data-testid='inlineHeader-companyName']",
        "description": "#jobDescriptionText"
      }
    }
  }
}
```

If no configuration matches a URL, the tool uses a fallback extraction method that works with most job posting pages.

### Themes

Themes define how your documents are rendered. Each theme includes:

- `theme.json` - Theme configuration and template mappings
- `templates/*.liquid` - Liquid.js templates for different outputs
- `styles/*.css` - CSS stylesheets

The included `clean_professional` theme provides:
- Two resume variants (full and short)
- A standard cover letter
- Professional styling

You can create custom themes in `themes/user/` or modify the stock theme in `themes/stock/`.

## Generated Content Format

When you use an LLM to generate content, it should return structured JSON data. The `resume` field contains individual data points that themes format however they choose.

```json
{
  "resume": {
    "summary": "Experienced software engineer with expertise in full-stack development...",
    "skills": ["TypeScript", "JavaScript", "Node.js", "React", "Python"],
    "experience": [
      {
        "company": "Tech Company",
        "title": "Senior Software Engineer",
        "startDate": "2020-01-15T00:00:00Z",
        "endDate": null,
        "location": "San Francisco, CA",
        "bullets": [
          "Led development of microservices architecture serving 1M+ users",
          "Improved application performance by 40% through optimization"
        ]
      }
    ],
    "education": [
      {
        "institution": "University",
        "degree": "Bachelor of Science in Computer Science",
        "field": "Computer Science",
        "startDate": "2014-09-01T00:00:00Z",
        "endDate": "2018-05-15T00:00:00Z"
      }
    ],
    "projects": [
      {
        "name": "Project Name",
        "description": "A web application for...",
        "technologies": ["React", "Node.js"],
        "url": "https://github.com/user/project"
      }
    ]
  },
  "coverLetter": {
    "greeting": "Dear Hiring Manager,",
    "paragraphs": [
      "I am writing to express my strong interest in...",
      "In my current role, I have..."
    ],
    "closing": "Thank you for considering my application."
  },
  "jobTitle": "Software Engineer",
  "companyName": "Tech Company",
  "generatedAt": "2024-01-15T10:30:00Z",
  "notes": "Emphasized cloud-native experience and team leadership."
}
```

**Key points:**
- `resume` is structured data, not formatted text
- Dates use ISO 8601 datetime format (e.g., `2020-01-15T00:00:00Z`)
- `endDate: null` indicates current position
- Themes control all formatting and presentation
- Theme developers can structure HTML however they want

The prompt generated by `prompt-generate` includes this schema in the instructions to the LLM.

## Workflow Example

1. **Find a job posting** you want to apply for
2. **Generate a prompt:**

   ```bash
   gatekeeper-cv prompt-generate https://example.com/job
   # Creates ./output/prompt.<timestamp>.txt
   ```

3. **Copy the prompt to an LLM** and get the generated JSON response
4. **Save the LLM response** to `generated.json`
5. **Render documents:**

   ```bash
   gatekeeper-cv build-docs generated.json clean_professional ./output
   ```

6. **Review and edit** the generated HTML files in `./output/<timestamp>/`

## Development

```bash
# Type check
npm run typecheck

# Run tests
npm test

# Run in development mode
npm run dev -- <command>
```

## Project Structure

```
gatekeeper-cv/
├── src/                    # Source code
│   ├── commands/          # CLI command implementations
│   ├── config/            # Configuration loading
│   ├── docs/              # Document rendering
│   ├── job-posts/         # Job posting fetching and parsing
│   ├── prompts/           # Prompt building
│   └── schemas/           # Zod validation schemas
├── themes/
│   ├── stock/             # Built-in themes
│   └── user/              # Custom themes (user-created)
├── user-info/             # User profiles and resumes
├── tests/                 # Test files
└── job-sites.config.json  # Job board configurations
```

## License

MIT
