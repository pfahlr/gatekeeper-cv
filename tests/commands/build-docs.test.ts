import { describe, it, expect, vi } from 'vitest';
import { runBuildDocsCommand } from '../../src/commands/build-docs.js';

vi.mock('../../src/docs/build-docs.js', () => ({
  buildDocs: vi.fn(() =>
    Promise.resolve({
      outputDirectory: '/output/1234567890',
      files: ['resume.full.html', 'cover_letter.standard.html'],
    })
  ),
}));

// Create mock data for different themes
const mockThemeConfigs: Record<string, any> = {
  clean_professional: {
    name: 'clean_professional',
    resumes: [
      {
        template: 'resume.full.liquid',
        outputPath: 'resume.full.html',
        styles: ['styles/resume.css']
      }
    ],
    coverLetters: [
      {
        template: 'cover-letter.liquid',
        outputPath: 'cover_letter.standard.html',
        styles: ['styles/resume.css']
      }
    ]
  },
  basic: {
    name: 'basic',
    resumes: [
      {
        template: 'resume.full.liquid',
        outputPath: 'resume.full.html',
        styles: ['styles/resume.css']
      }
    ],
    coverLetters: [
      {
        template: 'cover-letter.liquid',
        outputPath: 'cover-letter.html',
        styles: ['styles/resume.css']
      }
    ],
    variations: {
      default: {
        description: 'Default black and white styling',
        styles: ['styles/resume.css']
      },
      neon: {
        description: 'Neon color scheme inspired by rickpfahl.com',
        styles: ['styles/neon.css']
      }
    }
  }
};

vi.mock('node:fs/promises', () => ({
  mkdir: vi.fn(() => Promise.resolve()),
  readFile: vi.fn((path: string) => {
    // Return appropriate theme config based on path
    if (path.includes('clean_professional')) {
      return Promise.resolve(JSON.stringify(mockThemeConfigs.clean_professional));
    } else if (path.includes('basic')) {
      return Promise.resolve(JSON.stringify(mockThemeConfigs.basic));
    }
    return Promise.resolve(JSON.stringify(mockThemeConfigs.clean_professional));
  }),
  existsSync: vi.fn(() => true),
}));

describe('build-docs command', () => {
  it('should handle basic invocation with all arguments', async () => {
    await runBuildDocsCommand('./sample.json', 'clean_professional', './output');
    // Placeholder test - function executes without error
    expect(true).toBe(true);
  });

  it('should accept profile option', async () => {
    await runBuildDocsCommand('./sample.json', 'clean_professional', './output', {
      profile: 'default'
    });
    expect(true).toBe(true);
  });

  it('should accept variation option', async () => {
    await runBuildDocsCommand('./sample.json', 'basic', './output', {
      variation: 'neon'
    });
    expect(true).toBe(true);
  });
});
