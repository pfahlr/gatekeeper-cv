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

1. **Set up your user profile:**

```bash
cp user-info/profile.example.json user-info/profile.json
cp user-info/resumes/default.example.md user-info/resumes/default.md
```

Edit `user-info/profile.json` with your information and update `user-info/resumes/default.md` with your resume content in Markdown.

2. **Generate a prompt for a job posting:**

```bash
gatekeeper-cv prompt-generate https://example.com/job-posting --profile default --out prompt.txt
```

3. **Use the generated prompt with an LLM** (ChatGPT, Claude, etc.) to get tailored resume and cover letter content. Save the LLM's JSON response.

4. **Render the generated content into HTML documents:**

```bash
gatekeeper-cv build-docs generated.json clean_professional ./output
```

## Commands

### `prompt-generate`

Generate a tailored prompt for a specific job posting.

```bash
gatekeeper-cv prompt-generate <job-post-url> [options]
```

**Arguments:**
- `<job-post-url>` - URL of the job posting to analyze

**Options:**
- `--profile <profile-name>` - Profile name to use (default: `default`)
- `--out <output-file>` - Output file for the generated prompt (default: stdout)

**Example:**

```bash
gatekeeper-cv prompt-generate https://www.monster.com/job-openings/example --profile default --out prompt.txt
```

### `build-docs`

Render generated content into themed documents.

```bash
gatekeeper-cv build-docs <json-file> <theme-name> <output-directory> [options]
```

**Arguments:**
- `<json-file>` - JSON file containing LLM-generated content
- `<theme-name>` - Name of the theme to use
- `<output-directory>` - Directory where output files will be written

**Options:**
- `--profile <profile-name>` - Profile name to use (default: `default`)

**Example:**

```bash
gatekeeper-cv build-docs generated.json clean_professional ./output
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

When you use an LLM to generate content, it should return JSON in this format:

```json
{
  "resume": "# Tailored Resume\\n\\n## Professional Summary\\nExperienced software engineer...",
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
  "generatedAt": "2024-01-15T10:30:00Z"
}
```

The prompt generated by `prompt-generate` includes this schema in the instructions to the LLM.

## Workflow Example

1. **Find a job posting** you want to apply for
2. **Generate a prompt:**

   ```bash
   gatekeeper-cv prompt-generate https://example.com/job --out prompt.txt
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
