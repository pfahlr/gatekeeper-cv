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
    '3. Generate a tailored resume and cover letter that highlight the candidate\'s most relevant experience and skills'
  );
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
    "sections": [
      {
        "type": "summary" | "experience" | "skills" | "education" | "projects",
        "title": string,
        "content": string[]
      }
    ]
  },
  "coverLetter": {
    "greeting": string,
    "paragraphs": string[],
    "closing": string
  },
  "jobTitle": string,
  "companyName": string,
  "notes": string
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
  sections.push('');

  // 6. Prompt preferences
  sections.push('Prompt Preferences:');
  sections.push(formatPromptPreferences(promptPreferences));
  sections.push('');

  // 7. Extracted job information
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

  // 8. Source resume markdown
  sections.push('Source Resume (Markdown):');
  sections.push('```');
  sections.push(resumeMarkdown);
  sections.push('```');
  sections.push('');

  // 9. Grounding rules
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
