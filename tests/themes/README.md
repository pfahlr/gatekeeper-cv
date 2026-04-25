# Theme Validation Tests

Comprehensive test suite for validating stock and custom user themes.

## Running Theme Tests

### Test All Stock Themes
```bash
npm test
```

### Test Only Theme Validation
```bash
npm test -- tests/themes/stock-themes.test.ts
```

### Test Your Custom Theme

1. Create your theme in `themes/user/your-theme-name/`
2. Run tests with the environment variable:
```bash
TEST_USER_THEMES=your-theme-name npm test -- tests/themes/stock-themes.test.ts
```

3. Or test multiple user themes:
```bash
TEST_USER_THEMES=theme1,theme2,theme3 npm test -- tests/themes/stock-themes.test.ts
```

## What Gets Validated

### Theme Configuration
- ✅ Theme schema validation
- ✅ Theme name matches directory name
- ✅ At least one resume or cover letter output
- ✅ All template files exist
- ✅ All style files exist

### Rendered Output
- ✅ Valid HTML structure
- ✅ CSS stylesheets are included
- ✅ Resume sections render correctly:
  - Skills (both flat and grouped)
  - Work experience
  - Volunteering
  - Education
  - Projects
- ✅ Cover letter content renders

## Understanding Test Output

The tests provide detailed feedback to help debug theme issues:

### Success Output
```
✓ Theme "clean_professional" - 12 tests passed
```

### Error Output Example
```
❌ Theme "my-theme" configuration errors:
   - Resume template not found: resume.full.liquid
   - Style file not found: styles/resume.css

💡 Tips for fixing user theme "my-theme":
   1. Ensure theme.json exists in themes/user/my-theme/
   2. Verify theme.json follows the theme schema
   3. Check that all template files exist in templates/ directory
   4. Verify all style files referenced in config exist
```

### Warning Output Example
```
📄 Theme "my-theme" - resume.full.html:
   ⚠️  Warnings:
      - Resume output does not contain a Skills section
      - Cover letter output may not be rendering paragraphs correctly

💡 Debug tips for resume.full.html:
   1. Check template syntax in themes/user/my-theme/templates/
   2. Verify Liquid.js filters and tags are valid
   3. Ensure all required context variables are used
   4. Review the generated HTML at: /tmp/...
```

## Theme Structure Requirements

Your theme must have this structure:

```
themes/user/your-theme-name/
├── theme.json          # Theme configuration
├── templates/          # Liquid.js templates
│   ├── resume.full.liquid
│   ├── resume.short.liquid
│   └── cover-letter.liquid
└── styles/            # CSS files
    └── resume.css
```

### Required: theme.json

```json
{
  "name": "your-theme-name",
  "description": "A brief description",
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
  ]
}
```

## Available Context Variables

Templates have access to these variables:

- `profile.name` - User's full name
- `profile.email` - Email address
- `profile.phone` - Phone number
- `profile.location` - Location
- `profile.linkedin` - LinkedIn URL
- `profile.github` - GitHub URL
- `profile.website` - Website URL

- `resume.summary` - Professional summary
- `resume.skills` - Skills array (flat or grouped)
- `resume.experience` - Work experience array
- `resume.volunteering` - Volunteering array
- `resume.education` - Education array
- `resume.projects` - Projects array

- `coverLetter.greeting` - Salutation
- `coverLetter.paragraphs` - Letter paragraphs
- `coverLetter.closing` - Sign-off

- `metadata.jobTitle` - Job title
- `metadata.companyName` - Company name
- `metadata.generatedAt` - Timestamp

- `build.timestamp` - Build timestamp
- `build.outputDirectory` - Output path

## Liquid.js Reference

### Conditionals
```liquid
{% if resume.summary %}
  <p>{{ resume.summary }}</p>
{% endif %}
```

### Loops
```liquid
{% for skill in resume.skills %}
  <li>{{ skill }}</li>
{% endfor %}
```

### Grouped Skills
```liquid
{% if resume.skills[0].category %}
  {% comment %} Grouped skills {% endcomment %}
  {% for group in resume.skills %}
    <h3>{{ group.category }}</h3>
    <ul>
      {% for item in group.items %}
        <li>{{ item }}</li>
      {% endfor %}
    </ul>
  {% endfor %}
{% else %}
  {% comment %} Flat skills list {% endcomment %}
  <ul>
    {% for skill in resume.skills %}
      <li>{{ skill }}</li>
    {% endfor %}
  </ul>
{% endif %}
```

### Date Formatting
```liquid
{{ job.startDate | date: "%B %Y" }}
```

## Common Issues and Solutions

### Issue: "Template not found"
**Solution:** Check that template paths in theme.json don't include "templates/" prefix. Use just the filename: `"template": "resume.full.liquid"`

### Issue: "Style file not found"
**Solution:** Ensure style paths are relative to theme root: `"styles": ["styles/resume.css"]`

### Issue: Output has no content
**Solution:** Verify you're using the correct variable names in your Liquid templates. Check the Available Context Variables section above.

### Issue: Grouped skills not rendering
**Solution:** Your template needs to handle both flat and grouped skills. See the Liquid.js reference above for an example.
