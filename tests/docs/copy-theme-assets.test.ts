import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  copyThemeAssets,
  validatePathSafe,
  validateOutputPathSafe,
  PathValidationError,
} from '../../src/docs/copy-theme-assets.js';
import type { ResolvedTheme } from '../../src/docs/resolve-theme.js';

describe('copy-theme-assets', () => {
  let tempDir: string;
  let themeDir: string;
  let buildDir: string;
  let mockTheme: ResolvedTheme;

  beforeEach(async () => {
    tempDir = join(tmpdir(), `test-assets-${Date.now()}`);
    themeDir = join(tempDir, 'theme');
    buildDir = join(tempDir, 'build');
    const assetsDir = join(themeDir, 'assets');

    await mkdir(assetsDir, { recursive: true });
    await mkdir(buildDir, { recursive: true });

    // Create test asset file
    await writeFile(join(assetsDir, 'test.txt'), 'test content');

    mockTheme = {
      config: {
        name: 'test_theme',
        description: 'Test theme',
        assetsDir: 'assets',
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

  describe('validatePathSafe', () => {
    it('accepts safe paths', () => {
      expect(() => validatePathSafe(themeDir, join(themeDir, 'templates'))).not.toThrow();
      expect(() => validatePathSafe(themeDir, join(themeDir, 'assets', 'file.txt'))).not.toThrow();
    });

    it('rejects paths with .. traversal', () => {
      expect(() => validatePathSafe(themeDir, join(themeDir, '../outside'))).toThrow(PathValidationError);
      expect(() => validatePathSafe(themeDir, join(themeDir, 'templates', '../../etc/passwd'))).toThrow(PathValidationError);
    });

    it('rejects absolute paths outside theme', () => {
      expect(() => validatePathSafe(themeDir, '/etc/passwd')).toThrow(PathValidationError);
    });
  });

  describe('validateOutputPathSafe', () => {
    it('accepts safe output paths', () => {
      expect(() => validateOutputPathSafe(buildDir, join(buildDir, 'resume.html'))).not.toThrow();
      expect(() => validateOutputPathSafe(buildDir, join(buildDir, 'subdir', 'file.html'))).not.toThrow();
    });

    it('rejects paths with .. traversal', () => {
      expect(() => validateOutputPathSafe(buildDir, join(buildDir, '../outside'))).toThrow(PathValidationError);
      expect(() => validateOutputPathSafe(buildDir, join(buildDir, 'resume', '../../etc/passwd'))).toThrow(PathValidationError);
    });
  });

  describe('copyThemeAssets', () => {
    it('copies assets when assetsDir is defined and exists', async () => {
      await copyThemeAssets(mockTheme, buildDir);

      const outputPath = join(buildDir, 'assets', 'test.txt');
      expect(existsSync(outputPath)).toBe(true);
    });

    it('does not fail when assetsDir is undefined', async () => {
      mockTheme.config.assetsDir = undefined;

      await expect(copyThemeAssets(mockTheme, buildDir)).resolves.not.toThrow();
    });

    it('does not fail when assetsDir is defined but does not exist', async () => {
      mockTheme.config.assetsDir = 'nonexistent';

      await expect(copyThemeAssets(mockTheme, buildDir)).resolves.not.toThrow();
    });

    it('throws error for unsafe assetsDir path', async () => {
      mockTheme.config.assetsDir = '../outside-assets';

      await expect(copyThemeAssets(mockTheme, buildDir)).rejects.toThrow(PathValidationError);
    });
  });
});
