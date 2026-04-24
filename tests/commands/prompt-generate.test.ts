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
