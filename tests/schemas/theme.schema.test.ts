import { describe, it, expect } from 'vitest';
import { themeConfigSchema } from '../../src/schemas/theme.schema.js';

describe('theme schema', () => {
  const themeWithResume = {
    name: 'clean_professional',
    resumes: [
      {
        template: './templates/resume.liquid',
        outputPath: './output/resume.pdf',
      },
    ],
  };

  const themeWithCoverLetter = {
    name: 'modern',
    coverLetters: [
      {
        template: './templates/cover.liquid',
        outputPath: './output/cover.pdf',
      },
    ],
  };

  it('should accept theme with resume outputs', () => {
    const result = themeConfigSchema.safeParse(themeWithResume);
    expect(result.success).toBe(true);
  });

  it('should accept theme with cover letter outputs', () => {
    const result = themeConfigSchema.safeParse(themeWithCoverLetter);
    expect(result.success).toBe(true);
  });

  it('should accept theme with both resume and cover letter outputs', () => {
    const fullTheme = {
      name: 'complete',
      description: 'A complete theme',
      resumes: [
        {
          template: './templates/resume.liquid',
          outputPath: './output/resume.pdf',
        },
      ],
      coverLetters: [
        {
          template: './templates/cover.liquid',
          outputPath: './output/cover.pdf',
        },
      ],
    };
    const result = themeConfigSchema.safeParse(fullTheme);
    expect(result.success).toBe(true);
  });

  it('should fail when theme has no outputs', () => {
    const invalidTheme = {
      name: 'empty',
      resumes: [],
      coverLetters: [],
    };
    const result = themeConfigSchema.safeParse(invalidTheme);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('at least one');
    }
  });

  it('should fail on invalid theme name', () => {
    const invalidTheme = {
      name: 'invalid-name-with-dash',
      resumes: [
        {
          template: './templates/resume.liquid',
          outputPath: './output/resume.pdf',
        },
      ],
    };
    const result = themeConfigSchema.safeParse(invalidTheme);
    expect(result.success).toBe(false);
  });

  it('should accept valid theme names', () => {
    const validNames = ['default', 'my_theme', 'theme123', 'clean_professional'];
    for (const name of validNames) {
      const theme = {
        name,
        resumes: [
          {
            template: './templates/resume.liquid',
            outputPath: './output/resume.pdf',
          },
        ],
      };
      const result = themeConfigSchema.safeParse(theme);
      expect(result.success).toBe(true);
    }
  });
});
