import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join, dirname, relative } from 'node:path';
import { existsSync } from 'node:fs';
import type { ResolvedTheme } from './resolve-theme.js';
import type { ResumeOutput, CoverLetterOutput } from '../schemas/theme.schema.js';
import { validatePathSafe } from './copy-theme-assets.js';

export interface StyleCopyResult {
  copiedStyles: string[];
  styleMap: Map<string, string>; // originalPath -> outputPath
}

/**
 * Collects all unique style paths from resume and cover letter outputs
 */
export function collectStylePaths(
  resumes: ResumeOutput[],
  coverLetters: CoverLetterOutput[]
): string[] {
  const styleSet = new Set<string>();

  for (const output of resumes) {
    for (const style of output.styles || []) {
      styleSet.add(style);
    }
  }

  for (const output of coverLetters) {
    for (const style of output.styles || []) {
      styleSet.add(style);
    }
  }

  return Array.from(styleSet);
}

/**
 * Copies a single style file to the build directory
 */
async function copyStyleFile(
  themePath: string,
  stylePath: string,
  buildDir: string
): Promise<string> {
  // Resolve the full style path relative to theme root
  const fullStylePath = resolve(themePath, stylePath);

  // Validate path safety
  validatePathSafe(themePath, fullStylePath);

  // Check if file exists
  if (!existsSync(fullStylePath)) {
    throw new Error(`Style file not found: ${stylePath}`);
  }

  // Calculate output path preserving relative structure
  // e.g., styles/resume.css -> buildDir/styles/resume.css
  const outputPath = resolve(buildDir, stylePath);

  // Ensure output directory exists
  await mkdir(dirname(outputPath), { recursive: true });

  // Copy file content
  const content = await readFile(fullStylePath, 'utf-8');
  await writeFile(outputPath, content, 'utf-8');

  return relative(buildDir, outputPath);
}

/**
 * Copies all referenced styles to the build directory with deduplication
 */
export async function copyThemeStyles(
  theme: ResolvedTheme,
  resumes: ResumeOutput[],
  coverLetters: CoverLetterOutput[],
  buildDir: string
): Promise<StyleCopyResult> {
  const stylePaths = collectStylePaths(resumes, coverLetters);
  const copiedStyles: string[] = [];
  const styleMap = new Map<string, string>();

  for (const stylePath of stylePaths) {
    try {
      const relativeOutputPath = await copyStyleFile(
        theme.themePath,
        stylePath,
        buildDir
      );
      copiedStyles.push(relativeOutputPath);
      styleMap.set(stylePath, relativeOutputPath);
    } catch (error) {
      // Log but don't fail - missing styles should not break the build
      console.warn(`Warning: Failed to copy style "${stylePath}": ${(error as Error).message}`);
    }
  }

  return { copiedStyles, styleMap };
}
