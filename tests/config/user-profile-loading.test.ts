import { describe, it, expect } from 'vitest';
import { resolveProfile } from '../../src/config/resolve-profile.js';
import { loadUserProfileConfig } from '../../src/config/load-user-profile.js';
import { loadUserResumeMarkdown } from '../../src/config/load-user-resume.js';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('user profile loading', () => {
  const fixturesDir = join(__dirname, '../fixtures');

  describe('resolveProfile', () => {
    const validConfig = {
      defaultProfile: 'default',
      profiles: {
        default: {
          name: 'Test User',
          email: 'test@example.com',
          resumes: {
            main: {
              path: 'resumes/default.md',
            },
          },
          skills: ['TypeScript'],
        },
        alternate: {
          name: 'Alternate User',
          email: 'alt@example.com',
          resumes: {
            main: {
              path: 'resumes/alternate.md',
            },
          },
          skills: ['Python'],
        },
      },
    };

    it('should resolve default profile when no name provided', () => {
      const result = resolveProfile(validConfig);
      expect(result.name).toBe('default');
      expect(result.profile.name).toBe('Test User');
    });

    it('should resolve named profile', () => {
      const result = resolveProfile(validConfig, 'alternate');
      expect(result.name).toBe('alternate');
      expect(result.profile.name).toBe('Alternate User');
    });

    it('should throw when requested profile does not exist', () => {
      expect(() => resolveProfile(validConfig, 'nonexistent')).toThrow(
        'Profile "nonexistent" not found'
      );
    });
  });

  describe('loadUserProfileConfig', () => {
    it('should load valid profile config', async () => {
      const profilePath = join(fixturesDir, 'user-info/profile.valid.json');
      const result = await loadUserProfileConfig(profilePath);

      expect(result.config.defaultProfile).toBe('default');
      expect(result.config.profiles.default.name).toBe('Test User');
      expect(result.sourcePath).toBe(profilePath);
    });
  });

  describe('loadUserResumeMarkdown', () => {
    const profile = {
      name: 'Test User',
      email: 'test@example.com',
      resumes: {
        main: {
          path: 'resumes/default.md',
          description: 'Main resume',
        },
      },
      skills: ['TypeScript'],
    };

    it('should load resume markdown', async () => {
      const content = await loadUserResumeMarkdown(profile, 'main', {
        basePath: join(fixturesDir, 'user-info'),
      });
      expect(content).toContain('# Test User');
      expect(content).toContain('Software Engineer');
      expect(content.length).toBeGreaterThan(0);
    });

    it('should throw when resume does not exist', async () => {
      await expect(
        loadUserResumeMarkdown(profile, 'nonexistent', {
          basePath: join(fixturesDir, 'user-info'),
        })
      ).rejects.toThrow('Resume "nonexistent" not found');
    });

    it('should throw when resume file is empty', async () => {
      const profileWithEmptyResume = {
        name: 'Test User',
        email: 'test@example.com',
        resumes: {
          main: {
            path: 'resumes/default.md',
          },
        },
        skills: [],
      };

      // We'll create a temporary empty file for this test
      const { writeFile } = await import('node:fs/promises');
      const { mkdtemp } = await import('node:fs/promises');
      const { tmpdir } = await import('node:os');
      const { join } = await import('node:path');

      const tempDir = await mkdtemp(join(tmpdir(), 'resume-test-'));
      const emptyResumePath = join(tempDir, 'default.md');
      await writeFile(emptyResumePath, '   ');

      await expect(
        loadUserResumeMarkdown(
          {
            ...profileWithEmptyResume,
            resumes: {
              main: { path: 'default.md' },
            },
          },
          'main',
          { basePath: tempDir }
        )
      ).rejects.toThrow('Resume file is empty');
    });
  });
});
