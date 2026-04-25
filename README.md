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
- `[theme-name]` - Name of the theme to use (optional - will list available themes and prompt)
- `[output-directory]` - Directory where output files will be written (optional - defaults to `./output`)

**Options:**
- `--profile <profile-name>` - Profile name to use (default: `default`)
- `--variation <variation-name>` - Theme variation to use (if theme supports variations)

**Interactive Mode:**

If you run `build-docs` without arguments, it will prompt you for the required values:

```bash
gatekeeper-cv build-docs
# prompts for JSON file, theme name (lists available themes), variation (if theme has variations), and output directory
```

**Examples:**

```bash
# All arguments provided
gatekeeper-cv build-docs generated.json clean_professional ./output

# Use a theme variation (neon color scheme)
gatekeeper-cv build-docs generated.json basic ./output --variation neon

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
      "skillsGrouping": {
        "enabled": true,
        "categories": ["Languages", "Frameworks", "Databases", "Tools"]
      },
      "promptPreferences": {
        "tone": "professional",
        "targetRoleTypes": ["software-engineer", "full-stack"],
        "industriesToEmphasize": ["technology", "healthcare"]
      }
    }
  }
}
```

**Skills Grouping**: When enabled, the LLM will organize your skills into categories instead of a flat list. Categories are automatically detected from your resume (formats like `**Category:** skill1, skill2` or `**Category** skill1, skill2`).

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

- `theme.json` - Theme configuration, template mappings, and optional variations
- `templates/*.liquid` - Liquid.js templates for different outputs
- `styles/*.css` - CSS stylesheets

#### Stock Themes

**clean_professional** - A polished, modern theme with professional styling:
- Two resume variants (full and short)
- A standard cover letter
- Clean typography and spacing

**basic** - A simple, text-based theme with minimal styling:
- Two resume variants (full and short)
- A cover letter
- ■ bullet points and clear section headings

#### Theme Variations

Themes can define multiple style variations. For example, the `basic` theme includes:

- **default** - Black and white styling
- **neon** - Dark background with vibrant accent colors (inspired by cyberpunk aesthetics)

Use the `--variation` option to select a variation:

```bash
gatekeeper-cv build-docs generated.json basic ./output --variation neon
```

If a theme has variations and you don't specify one, you'll be prompted to select from the available options.

#### Creating Custom Themes

You can create custom themes in `themes/user/your-theme-name/`:

```
themes/user/your-theme-name/
├── theme.json          # Theme configuration
├── templates/          # Liquid.js templates
│   ├── resume.full.liquid
│   ├── resume.short.liquid
│   └── cover-letter.liquid
└── styles/            # CSS files
    ├── resume.css
    └── variation.css  # Optional variation styles
```

Your `theme.json` can define variations like this:

```json
{
  "name": "your-theme",
  "description": "Your theme description",
  "resumes": [
    {
      "template": "resume.full.liquid",
      "outputPath": "resume.full.html",
      "styles": ["styles/resume.css"]
    }
  ],
  "coverLetters": [
    {
      "template": "cover-letter.liquid",
      "outputPath": "cover-letter.html",
      "styles": ["styles/resume.css"]
    }
  ],
  "variations": {
    "default": {
      "description": "Default styling",
      "styles": ["styles/resume.css"]
    },
    "alternate": {
      "description": "Alternate color scheme",
      "styles": ["styles/alternate.css"]
    }
  }
}
```

## Generated Content Format

When you use an LLM to generate content, it should return structured JSON data. The `resume` field contains individual data points that themes format however they choose.

```json
{
  "resume": {
    "summary": "Experienced software engineer with expertise in full-stack development...",
    "skills": [
      {
        "category": "Languages",
        "items": ["TypeScript", "JavaScript", "Python", "Go"]
      },
      {
        "category": "Frameworks",
        "items": ["React", "Vue.js", "Express", "FastAPI"]
      },
      {
        "category": "Databases",
        "items": ["PostgreSQL", "MongoDB", "Redis"]
      }
    ],
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
    "volunteering": [
      {
        "organization": "Code for America",
        "title": "Volunteer Tech Lead",
        "startDate": "2021-06-01T00:00:00Z",
        "endDate": "2022-12-31T00:00:00Z",
        "location": "Remote",
        "bullets": [
          "Led team of 5 volunteers developing web application",
          "Organized monthly hackathons for civic tech engagement"
        ]
      }
    ],
    "education": [
      {
        "institution": "University",
        "degree": "Bachelor of Science in Computer Science",
        "field": "Computer Science",
        "startDate": "2014-09-01T00:00:00Z",
        "endDate": "2018-05-15T00:00:00Z",
        "gpa": "3.8",
        "bullets": ["Dean's List: Fall 2014 - Spring 2018", "CS Club President (2016-2017)"]
      }
    ],
    "projects": [
      {
        "name": "Project Name",
        "description": "A web application for...",
        "technologies": ["React", "Node.js"],
        "url": "https://github.com/user/project",
        "startDate": "2021-01-01T00:00:00Z"
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
- `skills` can be a flat array or grouped by category (with `category` and `items` fields)
- Dates use ISO 8601 datetime format (e.g., `2020-01-15T00:00:00Z`)
- `endDate: null` indicates current position
- `volunteering` and `education` support optional `bullets` arrays for achievements
- Themes control all formatting and presentation
- Theme developers can structure HTML however they want

The prompt generated by `prompt-generate` includes this schema in the instructions to the LLM and will use grouped skills if enabled in your profile.

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
   # Using the clean_professional theme
   gatekeeper-cv build-docs generated.json clean_professional ./output

   # Or use basic theme with neon variation
   gatekeeper-cv build-docs generated.json basic ./output --variation neon
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
