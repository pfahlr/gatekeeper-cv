import type { ExtractedJob } from '../schemas/extracted-job.schema.js';
import type { UserProfile } from '../schemas/user-profile.schema.js';
import type { ResolvedPromptPreferences } from '../config/resolve-prompt-preferences.js';
import { formatPromptPreferences } from './format-prompt-preferences.js';

export interface BuildPromptParams {
  extractedJob: ExtractedJob;
  profile: UserProfile;
  selectedProfileName: string;
  resumeMarkdown: string;
  promptPreferences: ResolvedPromptPreferences;
}

export function buildResumeCoverLetterPrompt(params: BuildPromptParams): string {
  const { extractedJob, profile, selectedProfileName, resumeMarkdown, promptPreferences } =
    params;

  const sections: string[] = [];

  // 1. Task
  sections.push('You are an expert resume and cover letter writer. Your task is to:');
  sections.push('1. Analyze the provided job posting');
  sections.push('2. Review the candidate\'s profile and resume');
  sections.push(
    '3. Before generating the resume, extract the required and preferred skills from the job posting.'
  );
  sections.push('4. Build the resume skills section from the job posting terminology first, not from the source resume terminology.\n Skill Normalization Rules:\n - If the job posting uses a specific skill name, phrase, spelling, acronym, or format, use the job posting’s version in the output whenever the source resume contains the same or equivalent skill.\n- Do not simply copy the source resume skills section.\n- Translate source resume skills into job-posting language where appropriate.\n  Examples:\n - "REST APIs" in the source resume should become "RESTful APIs" if the job posting says "RESTful APIs".\n - "MVC" in the source resume should become "MVC frameworks" if the job posting says "MVC frameworks".\n - "Coding standards" and PHP/Laravel/Symfony experience may support "OOP" or "Object-Oriented Programming" when the temperature allows same-discipline inferred skills.\n - "Version Control Systems, Git" should become "Git" or "version control systems such as Git" if that matches the job posting.\n - "Debugging and testing" should become "debugging", "testing", or "debugging and performance optimization" if those appear in the job posting.\n - "Oral and written communications" should become "excellent written and verbal communication skills" only if the temperature allows phrasing alignment.\n Skill Selection Rules:\n - Prioritize skills that appear in the job posting.\n - Include source-resume skills that are not in the job posting only if they strengthen the candidate’s fit.\n - Omit unrelated or low-relevance source skills from the tailored resume.\n - The final skills section should look like it was written for this specific job posting, not copied from the master resume.');
  sections.push('5.Temperature Application Rules:\n Use the temperature value only after extracting job-posting skills.\n\n At Temperature 50:\n - You may include exact skills from the source resume.\n - You may rename source skills to match equivalent job-posting terms.\n - You may include directly implied same-discipline skills when strongly supported by the source resume.\n - You may include adjacent framework names only when the source resume already shows comparable experience in the same web-development discipline.\n - Do not claim professional experience with tools, platforms, or specialties that are not listed or reasonably implied by the source resume.\n\n For every skill added that does not appear verbatim in the source resume, it must be one of:\n 1. A formatting/spelling normalization.\n 2. A job-posting synonym for an equivalent source skill.\n 3. A same-discipline inferred skill allowed by the temperature.');
  sections.push('');
  sections.push('Temperature: 50')
  sections.push('');

  // 2. Output rules
  sections.push('Output Rules:');
  sections.push('Return only valid JSON.');
  sections.push('Do not include Markdown.');
  sections.push('Do not include comments.');
  sections.push('Do not include explanatory text outside the JSON object.');
  sections.push('');

  // 3. Contact exclusion rule
  sections.push(
    'Do not include the user\'s email, phone number, address, LinkedIn URL, GitHub URL, GitLab URL, or personal website in the returned JSON. Those values will be merged later from the local profile.'
  );
  sections.push('');

  // 4. JSON Schema
  sections.push('JSON Schema:');
  sections.push(`{
  "resume": {
    "summary": string (optional),
    "skills": string[] | [{ "category": string, "items": string[] }],
    "experience": [
      {
        "company": string,
        "title": string,
        "startDate": string (ISO 8601 datetime, e.g., "2020-01-15T00:00:00Z"),
        "endDate": string | null (ISO 8601 datetime, or null for current position),
        "location": string (optional),
        "bullets": string[]
      }
    ],
    "volunteering": [
      {
        "organization": string,
        "title": string,
        "startDate": string (ISO 8601 datetime, optional),
        "endDate": string (ISO 8601 datetime, optional),
        "location": string (optional),
        "bullets": string[]
      }
    ] (optional),
    "education": [
      {
        "institution": string,
        "degree": string,
        "field": string (optional),
        "startDate": string (ISO 8601 datetime, optional),
        "endDate": string (ISO 8601 datetime, optional),
        "gpa": string (optional),
        "bullets": string[] (optional)
      }
    ] (optional),
    "projects": [
      {
        "name": string,
        "description": string (optional),
        "technologies": string[] (optional),
        "url": string (optional),
        "startDate": string (ISO 8601 datetime, optional),
        "endDate": string (ISO 8601 datetime, optional)
      }
    ] (optional)
  },
  "coverLetter": {
    "greeting": string (optional),
    "paragraphs": string[],
    "closing": string (optional)
  },
  "jobTitle": string (optional),
  "companyName": string (optional),
  "generatedAt": string (ISO 8601 datetime, optional),
  "notes": string (optional)
}`);
  sections.push('');

  // 5. Selected profile summary
  const selectedProfile = profile.profiles[selectedProfileName];
  sections.push('Selected Profile:');
  sections.push(`  Name: ${selectedProfile.name}`);
  sections.push(`  Email: ${selectedProfile.email}`);
  if (selectedProfile.phone) sections.push(`  Phone: ${selectedProfile.phone}`);
  if (selectedProfile.location) sections.push(`  Location: ${selectedProfile.location}`);
  if (selectedProfile.website) sections.push(`  Website: ${selectedProfile.website}`);
  if (selectedProfile.linkedin) sections.push(`  LinkedIn: ${selectedProfile.linkedin}`);
  if (selectedProfile.github) sections.push(`  GitHub: ${selectedProfile.github}`);
  if (selectedProfile.summary) sections.push(`  Summary: ${selectedProfile.summary}`);
  if (selectedProfile.skills.length > 0) {
    sections.push(`  Skills: ${selectedProfile.skills.join(', ')}`);
  }
  if (selectedProfile.skillsGrouping?.enabled) {
    sections.push(`  Skills grouping: enabled (${selectedProfile.skillsGrouping.categories.length} categories)`);
  }
  sections.push('');

  // 6. Skills grouping instructions
  if (selectedProfile.skillsGrouping?.enabled && selectedProfile.skillsGrouping.categories.length > 0) {
    sections.push('Skills Grouping:');
    sections.push('  Format the "skills" field as an array of objects with "category" and "items" properties.');
    sections.push(`  Use these category names: ${selectedProfile.skillsGrouping.categories.join(', ')}`);
    sections.push('  Distribute the candidate\'s skills appropriately across these categories.');
    sections.push('');
  }

  // 7. Prompt preferences

  // 7. Prompt preferences
  sections.push('Prompt Preferences:');
  sections.push(formatPromptPreferences(promptPreferences));
  sections.push('');

  // 8. Extracted job information
  sections.push('Job Posting Information:');
  sections.push(`  URL: ${extractedJob.url}`);
  sections.push(`  Title: ${extractedJob.title}`);
  if (extractedJob.company) sections.push(`  Company: ${extractedJob.company}`);
  if (extractedJob.location) sections.push(`  Location: ${extractedJob.location}`);
  if (extractedJob.employmentType) sections.push(`  Employment Type: ${extractedJob.employmentType}`);
  if (extractedJob.compensation) sections.push(`  Compensation: ${extractedJob.compensation}`);
  sections.push(`  Description: ${extractedJob.description}`);
  if (extractedJob.requirements) {
    sections.push(`  Requirements: ${extractedJob.requirements}`);
  }
  if (extractedJob.responsibilities) {
    sections.push(`  Responsibilities: ${extractedJob.responsibilities}`);
  }
  if (extractedJob.qualifications) {
    sections.push(`  Qualifications: ${extractedJob.qualifications}`);
  }
  if (extractedJob.benefits) {
    sections.push(`  Benefits: ${extractedJob.benefits}`);
  }
  sections.push('');

  // 9. Source resume markdown
  sections.push('Source Resume (Markdown):');
  sections.push('```');
  sections.push(resumeMarkdown);
  sections.push('```');
  sections.push('');

  // 10. Grounding rules
  sections.push('Grounding Rules:');
  sections.push(
    'Do not invent degrees, certifications, employers, dates, titles, or metrics that are not present in the supplied resume.'
  );
  sections.push(
    'You may rephrase, reorganize, and emphasize relevant experience, but factual claims must remain grounded in the supplied material.'
  );
  sections.push('');

  return sections.join('\n');
}
