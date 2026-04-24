import { describe, it, expect } from 'vitest';
import { buildResumeCoverLetterPrompt } from '../../src/prompts/build-resume-cover-letter-prompt.js';
import type { ExtractedJob } from '../../src/schemas/extracted-job.schema.js';
import type { UserProfile } from '../../src/schemas/user-profile.schema.js';
import type { ResolvedPromptPreferences } from '../../src/config/resolve-prompt-preferences.js';

describe('buildResumeCoverLetterPrompt', () => {
  const mockExtractedJob: ExtractedJob = {
    url: 'https://example.com/job/123',
    sourceUrl: 'https://example.com/job/123',
    sourceDomain: 'example.com',
    title: 'Software Engineer',
    company: 'Example Corp',
    location: 'Remote',
    employmentType: 'Full-time',
    compensation: '$100k - $150k',
    description: 'A great opportunity for a software engineer...',
    requirements: '5+ years of experience',
    responsibilities: 'Build and maintain software applications',
    qualifications: 'Bachelor\'s degree in CS',
    benefits: 'Health insurance, 401k',
    rawText: 'Full job posting text...',
    extractedAt: '2024-01-01T00:00:00Z',
  };

  const mockProfile: UserProfile = {
    defaultProfile: 'default',
    profiles: {
      default: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1-555-0100',
        location: 'San Francisco, CA',
        website: 'https://johndoe.com',
        linkedin: 'https://linkedin.com/in/johndoe',
        github: 'https://github.com/johndoe',
        resumes: {
          main: {
            path: 'resumes/default.md',
            description: 'Main resume',
          },
        },
        skills: ['TypeScript', 'Node.js', 'React'],
        summary: 'A software engineer with 5 years of experience.',
      },
    },
  };

  const mockPromptPreferences: ResolvedPromptPreferences = {
    tone: 'professional',
    targetRoleTypes: ['Senior', 'Lead'],
    industriesToEmphasize: ['Tech', 'SaaS'],
    skillsToEmphasize: ['TypeScript', 'React'],
    skillsToAvoidOverstating: ['Python'],
    experienceToEmphasize: ['Team leadership'],
    experienceToDeemphasize: ['Junior roles'],
    jobTypesToPrioritize: ['Full-time'],
    jobTypesToDeprioritize: ['Contract'],
    coverLetterGuidance: {
      openingStyle: 'direct',
      includePersonalMotivation: false,
      avoidGenericPraise: true,
      preferredLength: 'medium',
    },
    resumeGuidance: {
      summaryStyle: 'specific',
      bulletStyle: 'achievement_oriented',
      maxBulletLength: 'medium',
      prioritizeKeywords: true,
    },
    customInstructions: ['Emphasize startup experience'],
  };

  const mockResumeMarkdown = `# John Doe

Software Engineer with 5 years of experience.

## Skills
- TypeScript
- Node.js
- React

## Experience
- Senior Engineer at Tech Corp (2020-present)
- Developer at Startup Inc (2018-2020)
`;

  it('should build a complete prompt', () => {
    const result = buildResumeCoverLetterPrompt({
      extractedJob: mockExtractedJob,
      profile: mockProfile,
      selectedProfileName: 'default',
      resumeMarkdown: mockResumeMarkdown,
      promptPreferences: mockPromptPreferences,
    });

    // Check that all required sections are present
    expect(result).toContain('You are an expert resume and cover letter writer');
    expect(result).toContain('Output Rules:');
    expect(result).toContain('Return only valid JSON');
    expect(result).toContain('Do not include the user\'s email, phone number, address');
    expect(result).toContain('JSON Schema:');
    expect(result).toContain('Selected Profile:');
    expect(result).toContain('Prompt Preferences:');
    expect(result).toContain('Job Posting Information:');
    expect(result).toContain('Source Resume (Markdown):');
    expect(result).toContain('Grounding Rules:');
    expect(result).toContain('Do not invent degrees, certifications, employers');
  });

  it('should include job information', () => {
    const result = buildResumeCoverLetterPrompt({
      extractedJob: mockExtractedJob,
      profile: mockProfile,
      selectedProfileName: 'default',
      resumeMarkdown: mockResumeMarkdown,
      promptPreferences: mockPromptPreferences,
    });

    expect(result).toContain('Title: Software Engineer');
    expect(result).toContain('Company: Example Corp');
    expect(result).toContain('Location: Remote');
    expect(result).toContain('Employment Type: Full-time');
    expect(result).toContain('Compensation: $100k - $150k');
    expect(result).toContain('URL: https://example.com/job/123');
  });

  it('should include profile information', () => {
    const result = buildResumeCoverLetterPrompt({
      extractedJob: mockExtractedJob,
      profile: mockProfile,
      selectedProfileName: 'default',
      resumeMarkdown: mockResumeMarkdown,
      promptPreferences: mockPromptPreferences,
    });

    expect(result).toContain('Name: John Doe');
    expect(result).toContain('Email: john@example.com');
    expect(result).toContain('Phone: +1-555-0100');
    expect(result).toContain('Location: San Francisco, CA');
    expect(result).toContain('Skills: TypeScript, Node.js, React');
    expect(result).toContain('Summary: A software engineer with 5 years of experience.');
  });

  it('should include prompt preferences', () => {
    const result = buildResumeCoverLetterPrompt({
      extractedJob: mockExtractedJob,
      profile: mockProfile,
      selectedProfileName: 'default',
      resumeMarkdown: mockResumeMarkdown,
      promptPreferences: mockPromptPreferences,
    });

    expect(result).toContain('Tone: professional');
    expect(result).toContain('Target role types: Senior, Lead');
    expect(result).toContain('Skills to emphasize: TypeScript, React');
    expect(result).toContain('Custom instructions:');
  });

  it('should include resume markdown in code block', () => {
    const result = buildResumeCoverLetterPrompt({
      extractedJob: mockExtractedJob,
      profile: mockProfile,
      selectedProfileName: 'default',
      resumeMarkdown: mockResumeMarkdown,
      promptPreferences: mockPromptPreferences,
    });

    expect(result).toContain('```');
    expect(result).toContain('# John Doe');
    expect(result).toContain('Software Engineer with 5 years of experience.');
  });

  it('should handle optional fields when not present', () => {
    const minimalJob: ExtractedJob = {
      url: 'https://example.com/job',
      sourceUrl: 'https://example.com/job',
      sourceDomain: 'example.com',
      title: 'Job',
      description: 'A job description',
      extractedAt: '2024-01-01T00:00:00Z',
    };

    const minimalPreferences: ResolvedPromptPreferences = {
      tone: 'professional',
      targetRoleTypes: [],
      industriesToEmphasize: [],
      skillsToEmphasize: [],
      skillsToAvoidOverstating: [],
      experienceToEmphasize: [],
      experienceToDeemphasize: [],
      jobTypesToPrioritize: [],
      jobTypesToDeprioritize: [],
      coverLetterGuidance: {
        openingStyle: 'direct',
        includePersonalMotivation: false,
        avoidGenericPraise: true,
        preferredLength: 'medium',
      },
      resumeGuidance: {
        summaryStyle: 'specific',
        bulletStyle: 'achievement_oriented',
        maxBulletLength: 'medium',
        prioritizeKeywords: true,
      },
      customInstructions: [],
    };

    const result = buildResumeCoverLetterPrompt({
      extractedJob: minimalJob,
      profile: mockProfile,
      selectedProfileName: 'default',
      resumeMarkdown: mockResumeMarkdown,
      promptPreferences: minimalPreferences,
    });

    // Should still build successfully
    expect(result).toContain('You are an expert resume and cover letter writer');
    expect(result).toContain('Title: Job');
    expect(result).toContain('Tone: professional');
  });
});
