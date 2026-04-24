import { cp } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { existsSync } from 'node:fs';
import type { ResolvedTheme } from './resolve-theme.js';

/**
 * Error thrown when a path escapes the theme directory
 */
export class PathValidationError extends Error {
  constructor(path: string, reason: string) {
    super(`Invalid path "${path}": ${reason}`);
    this.name = 'PathValidationError';
  }
}

/**
 * Validates that a path does not escape the base directory
 */
export function validatePathSafe(basePath: string, targetPath: string): void {
  const resolvedBase = resolve(basePath);
  const resolvedTarget = resolve(targetPath);

  if (!resolvedTarget.startsWith(resolvedBase)) {
    throw new PathValidationError(targetPath, 'path escapes theme directory');
  }

  // Check for path traversal patterns
  if (targetPath.includes('..')) {
    throw new PathValidationError(targetPath, 'path contains traversal');
  }
}

/**
 * Validates that an output path does not escape the build directory
 */
export function validateOutputPathSafe(buildDir: string, outputPath: string): void {
  const resolvedBuild = resolve(buildDir);
  const resolvedOutput = resolve(outputPath);

  if (!resolvedOutput.startsWith(resolvedBuild)) {
    throw new PathValidationError(outputPath, 'path escapes build directory');
  }

  // Check for path traversal patterns
  if (outputPath.includes('..')) {
    throw new PathValidationError(outputPath, 'path contains traversal');
  }
}

/**
 * Copies the theme assets directory to the build directory if it exists
 */
export async function copyThemeAssets(
  theme: ResolvedTheme,
  buildDir: string
): Promise<void> {
  const { config, themePath } = theme;

  if (!config.assetsDir) {
    return;
  }

  // Validate assetsDir path is safe
  validatePathSafe(themePath, resolve(themePath, config.assetsDir));

  const assetsPath = resolve(themePath, config.assetsDir);

  // Assets directory is optional - do not fail if missing
  if (!existsSync(assetsPath)) {
    return;
  }

  const outputPath = join(buildDir, 'assets');

  await cp(assetsPath, outputPath, {
    recursive: true,
    preserveTimestamps: true,
  });
}
