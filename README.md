```
   ███ ███ ███ ███ █ █ ███ ███ ███ ███ ███    ███ █ █ 
   █   █ █  █  █   █ █ █   █   █ █ █   █ █    █   █ █ 
   █   █ █  █  ███ ██  ███ ███ ███ ███ ██  ██ █   █ █ 
   █ █ ███  █  █   █ █ █   █   █   █   █ █    █   █ █ 
   ███ █ █  █  ███ █ █ ███ ███ █   ███ █ █    ███  █  
BECAUSE FINDING THE JOB IS UNPAID LABOR. AND IT SHOULD NOT 
BE ORDERS OF MAGNITUDE MORE DIFFICULT THAN THE JOB ITSELF!
```

# Resume CLI Phase 1 Development Tasks

This package breaks Phase 1 of the resume and cover letter generator CLI into small implementation jobs suitable for Claude Code or another coding agent.

## Suggested order

1. `jobs/01-project-scaffold.md`
2. `jobs/02-command-routing.md`
3. `jobs/03-core-schemas.md`
4. `jobs/04-user-profile-resume-loading.md`
5. `jobs/05-prompt-preferences-merging.md`
6. `jobs/06-fetch-job-posting-html.md`
7. `jobs/07-job-sites-config-loading.md`
8. `jobs/08-selector-based-job-parsing.md`
9. `jobs/09-fallback-extraction.md`
10. `jobs/10-prompt-generation.md`
11. `jobs/11-basic-theme-rendering.md`
12. `jobs/12-multi-output-themes-and-assets.md`

Also include these project-level files:

- `AGENTS.md`
- `docs/phase-1-contract.md`

## Development philosophy

Each job should leave the project in a runnable and testable state. Do not jump ahead to later features unless the current job explicitly requires a small supporting interface.

Phase 1 intentionally avoids automatic LLM API calls, PDF export, DOCX export, browser automation, and complex resume parsing. The initial application generates prompts and renders HTML from user-provided generated JSON.
