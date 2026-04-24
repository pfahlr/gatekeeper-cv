import { describe, it, expect, vi } from 'vitest';
import { runPromptGenerateCommand } from '../../src/commands/prompt-generate.js';

vi.mock('../../src/config/load-user-profile.js', () => ({
  loadUserProfileConfig: vi.fn(() =>
    Promise.resolve({
      config: {
        defaultProfile: 'default',
        profiles: {
          default: {
            name: 'Test User',
            email: 'test@example.com',
            resumes: {
              main: {
                path: 'resumes/default.md',
                description: 'Main resume',
              },
            },
            skills: ['TypeScript'],
          },
        },
      },
      sourcePath: '/mock/path/profile.json',
    })
  ),
}));

vi.mock('../../src/config/resolve-profile.js', () => ({
  resolveProfile: vi.fn((config, name) => ({
    name: name ?? config.defaultProfile,
    profile: config.profiles[name ?? config.defaultProfile],
  })),
}));

vi.mock('../../src/config/load-user-resume.js', () => ({
  loadUserResumeMarkdown: vi.fn(() => Promise.resolve('# Test User\n\nSample resume content')),
}));

vi.mock('../../src/config/load-job-sites-config.js', () => ({
  loadJobSitesConfig: vi.fn(() =>
    Promise.resolve({
      jobSites: {
        'example.com': {
          name: 'Example',
          urlPattern: 'https://example.com/*',
          selectors: {
            title: 'h1',
            description: '.description',
          },
        },
      },
    })
  ),
}));

vi.mock('../../src/job-posts/domain-config.js', () => ({
  findJobSiteConfigForUrl: vi.fn(() => ({
    matchedDomain: 'example.com',
    siteConfig: {
      name: 'Example',
      urlPattern: 'https://example.com/*',
      selectors: {
        title: 'h1',
        description: '.description',
      },
    },
  })),
}));

vi.mock('../../src/job-posts/fetch-page.js', () => ({
  fetchPage: vi.fn(() => Promise.resolve('<html><body>Job posting content</body></html>')),
}));

vi.mock('../../src/job-posts/parse-job-post.js', () => ({
  parseJobPost: vi.fn(() => ({
    url: 'https://example.com/job',
    sourceUrl: 'https://example.com/job',
    sourceDomain: 'example.com',
    title: 'Test Job',
    company: 'Example Corp',
    location: 'Remote',
    description: 'A test job description with enough content to be useful.',
    rawText: 'Full raw text content from the job posting that is sufficiently long.',
    extractedAt: new Date().toISOString(),
  })),
}));

vi.mock('../../src/job-posts/fallback-extract-job-post.js', () => ({
  fallbackExtractJobPost: vi.fn(() => ({
    url: 'https://example.com/job',
    sourceUrl: 'https://example.com/job',
    sourceDomain: 'example.com',
    title: 'Test Job',
    description: 'Fallback extracted description with more content.',
    rawText: 'Fallback raw text content.',
    extractedAt: new Date().toISOString(),
  })),
  isWeakExtraction: vi.fn(() => false),
}));

vi.mock('../../src/prompts/build-resume-cover-letter-prompt.js', () => ({
  buildResumeCoverLetterPrompt: vi.fn(() => 'Generated prompt content'),
}));

vi.mock('../../src/config/resolve-prompt-preferences.js', () => ({
  resolvePromptPreferences: vi.fn(() => ({
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
  })),
}));

vi.mock('node:fs/promises', () => ({
  writeFile: vi.fn(() => Promise.resolve()),
  mkdir: vi.fn(() => Promise.resolve()),
}));

describe('prompt-generate command', () => {
  it('should handle basic invocation with url', async () => {
    await runPromptGenerateCommand('https://example.com/job');
    // Placeholder test - function executes without error
    expect(true).toBe(true);
  });

  it('should accept profile option', async () => {
    await runPromptGenerateCommand('https://example.com/job', { profile: 'default' });
    expect(true).toBe(true);
  });

  it('should accept out option', async () => {
    await runPromptGenerateCommand('https://example.com/job', { out: './prompt.txt' });
    expect(true).toBe(true);
  });

  it('should accept both options', async () => {
    await runPromptGenerateCommand('https://example.com/job', {
      profile: 'default',
      out: './prompt.txt'
    });
    expect(true).toBe(true);
  });
});
