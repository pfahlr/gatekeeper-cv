import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, writeFile, rm, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  copyThemeStyles,
  collectStylePaths,
} from '../../src/docs/copy-theme-styles.js';
import type { ResolvedTheme } from '../../src/docs/resolve-theme.js';
import type { ResumeOutput, CoverLetterOutput } from '../../src/schemas/theme.schema.js';

describe('copy-theme-styles', () => {
  let tempDir: string;
  let themeDir: string;
  let buildDir: string;
  let stylesDir: string;
  let mockTheme: ResolvedTheme;

  beforeEach(async () => {
    tempDir = join(tmpdir(), `test-styles-${Date.now()}`);
    themeDir = join(tempDir, 'theme');
    buildDir = join(tempDir, 'build');
    stylesDir = join(themeDir, 'styles');

    await mkdir(stylesDir, { recursive: true });
    await mkdir(buildDir, { recursive: true });

    // Create test style files
    await writeFile(join(stylesDir, 'resume.css'), 'body { margin: 0; }');
    await writeFile(join(stylesDir, 'cover_letter.css'), 'p { line-height: 1.5; }');

    mockTheme = {
      config: {
        name: 'test_theme',
        description: 'Test theme',
        resumes: [],
        coverLetters: [],
      },
      themePath: themeDir,
      isStock: true,
    };
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  describe('collectStylePaths', () => {
    it('collects styles from resume outputs', () => {
      const resumes: ResumeOutput[] = [
        { template: 'a', outputPath: 'a.html', styles: ['styles/a.css'] },
        { template: 'b', outputPath: 'b.html', styles: ['styles/b.css'] },
      ];
      const coverLetters: CoverLetterOutput[] = [];

      const paths = collectStylePaths(resumes, coverLetters);

      expect(paths).toEqual(['styles/a.css', 'styles/b.css']);
    });

    it('collects styles from cover letter outputs', () => {
      const resumes: ResumeOutput[] = [];
      const coverLetters: CoverLetterOutput[] = [
        { template: 'c', outputPath: 'c.html', styles: ['styles/c.css'] },
        { template: 'd', outputPath: 'd.html', styles: ['styles/d.css'] },
      ];

      const paths = collectStylePaths(resumes, coverLetters);

      expect(paths).toEqual(['styles/c.css', 'styles/d.css']);
    });

    it('deduplicates duplicate style paths', () => {
      const resumes: ResumeOutput[] = [
        { template: 'a', outputPath: 'a.html', styles: ['styles/common.css'] },
      ];
      const coverLetters: CoverLetterOutput[] = [
        { template: 'c', outputPath: 'c.html', styles: ['styles/common.css', 'styles/c.css'] },
      ];

      const paths = collectStylePaths(resumes, coverLetters);

      expect(paths).toEqual(['styles/common.css', 'styles/c.css']);
    });

    it('handles missing styles arrays', () => {
      const resumes: ResumeOutput[] = [
        { template: 'a', outputPath: 'a.html' },
        { template: 'b', outputPath: 'b.html', styles: [] },
      ];
      const coverLetters: CoverLetterOutput[] = [
        { template: 'c', outputPath: 'c.html', styles: ['styles/c.css'] },
      ];

      const paths = collectStylePaths(resumes, coverLetters);

      expect(paths).toEqual(['styles/c.css']);
    });
  });

  describe('copyThemeStyles', () => {
    it('copies all referenced styles to build directory', async () => {
      const resumes: ResumeOutput[] = [
        { template: 'a', outputPath: 'a.html', styles: ['styles/resume.css'] },
      ];
      const coverLetters: CoverLetterOutput[] = [
        { template: 'c', outputPath: 'c.html', styles: ['styles/cover_letter.css'] },
      ];

      const result = await copyThemeStyles(mockTheme, resumes, coverLetters, buildDir);

      expect(result.copiedStyles).toHaveLength(2);
      expect(result.styleMap.get('styles/resume.css')).toBe('styles/resume.css');
      expect(result.styleMap.get('styles/cover_letter.css')).toBe('styles/cover_letter.css');

      // Verify files were copied
      expect(existsSync(join(buildDir, 'styles', 'resume.css'))).toBe(true);
      expect(existsSync(join(buildDir, 'styles', 'cover_letter.css'))).toBe(true);
    });

    it('deduplicates styles referenced by multiple outputs', async () => {
      const commonStylePath = join(stylesDir, 'common.css');
      await writeFile(commonStylePath, '.common { }');

      const resumes: ResumeOutput[] = [
        { template: 'a', outputPath: 'a.html', styles: ['styles/common.css'] },
        { template: 'b', outputPath: 'b.html', styles: ['styles/common.css'] },
      ];
      const coverLetters: CoverLetterOutput[] = [];

      const result = await copyThemeStyles(mockTheme, resumes, coverLetters, buildDir);

      expect(result.copiedStyles).toHaveLength(1);
      expect(result.styleMap.get('styles/common.css')).toBe('styles/common.css');
    });

    it('creates subdirectories as needed', async () => {
      const nestedDir = join(themeDir, 'styles', 'nested');
      await mkdir(nestedDir, { recursive: true });
      await writeFile(join(nestedDir, 'custom.css'), '.custom { color: red; }');

      const resumes: ResumeOutput[] = [
        { template: 'a', outputPath: 'a.html', styles: ['styles/nested/custom.css'] },
      ];
      const coverLetters: CoverLetterOutput[] = [];

      await copyThemeStyles(mockTheme, resumes, coverLetters, buildDir);

      expect(existsSync(join(buildDir, 'styles', 'nested', 'custom.css'))).toBe(true);
    });

    it('preserves style file content', async () => {
      const resumes: ResumeOutput[] = [
        { template: 'a', outputPath: 'a.html', styles: ['styles/resume.css'] },
      ];
      const coverLetters: CoverLetterOutput[] = [];

      await copyThemeStyles(mockTheme, resumes, coverLetters, buildDir);

      const originalContent = await readFile(join(stylesDir, 'resume.css'), 'utf-8');
      const copiedContent = await readFile(join(buildDir, 'styles', 'resume.css'), 'utf-8');

      expect(copiedContent).toBe(originalContent);
    });
  });
});
