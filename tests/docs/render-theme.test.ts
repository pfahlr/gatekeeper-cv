import { describe, it, expect } from 'vitest';
import { renderTemplate, getTemplatePath } from '../../src/docs/render-theme.js';
import type { RenderContext } from '../../src/docs/render-theme.js';
import type { ResolvedTheme } from '../../src/docs/resolve-theme.js';
import type { ThemeConfig } from '../../src/schemas/theme.schema.js';

describe('renderTemplate', () => {
  const mockTheme: ResolvedTheme = {
    name: 'test_theme',
    config: {
      name: 'test_theme',
      resumes: [],
      coverLetters: [],
    },
    themePath: '/themes/stock/test_theme',
  };

  const mockContext: RenderContext = {
    profile: {
      name: 'John Doe',
      email: 'john@example.com',
    },
    selectedProfileName: 'default',
    resume: '# Resume',
    coverLetter: {
      paragraphs: ['First paragraph'],
    },
    theme: mockTheme.config,
    build: {
      timestamp: '1234567890',
      outputDirectory: '/output/1234567890',
    },
  };

  // This would require actual Liquid templates to test properly
  // For now, we'll test the getTemplatePath function

  describe('getTemplatePath', () => {
    it('should construct correct template path', () => {
      const result = getTemplatePath(mockTheme, 'resume.full.liquid');

      expect(result).toContain('templates');
      expect(result).toContain('resume.full.liquid');
    });
  });
});
