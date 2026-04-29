import { readFile } from 'node:fs/promises';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import { resolveTheme } from './resolve-theme.js';
import { renderTemplate, getTemplatePath, type RenderContext } from './render-theme.js';
import { copyThemeAssets } from './copy-theme-assets.js';
import { copyThemeStyles } from './copy-theme-styles.js';
import { validateOutputPathSafe } from './copy-theme-assets.js';
import type { ThemeConfig } from '../schemas/theme.schema.js';
import { generatedContentSchema } from '../schemas/generated-content.schema.js';
import { loadUserProfileConfig } from '../config/load-user-profile.js';
import { resolveProfile } from '../config/resolve-profile.js';

function formatCurrentDate(): string {
  const now = new Date();
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const month = months[now.getMonth()];
  const day = now.getDate();
  const year = now.getFullYear();
  return `${month} ${day}, ${year}`;
}

export interface BuildDocsParams {
  generatedJsonFile: string;
  themeName: string;
  outputDirectory: string;
  profileName?: string;
  variationName?: string;
}

export interface BuildDocsResult {
  outputDirectory: string;
  files: string[];
}

export async function buildDocs(params: BuildDocsParams): Promise<BuildDocsResult> {
  const { generatedJsonFile, themeName, outputDirectory, profileName, variationName } = params;

  // 1. Load generated JSON
  const jsonContent = await readFile(generatedJsonFile, 'utf-8');
  const generatedData = JSON.parse(jsonContent);
  const content = generatedContentSchema.parse(generatedData);

  // 2. Resolve theme
  const resolvedTheme = await resolveTheme(themeName);

  // 3. Determine which variation to use
  const selectedVariation = variationName || 'default';
  const variation = resolvedTheme.config.variations?.[selectedVariation];

  if (!variation && resolvedTheme.config.variations) {
    throw new Error(`Variation "${selectedVariation}" not found in theme "${themeName}"`);
  }

  // 4. Apply variation styles to outputs
  const resumesWithVariation = resolvedTheme.config.resumes.map((resume) => ({
    ...resume,
    styles: variation?.styles.length ? variation.styles : resume.styles,
  }));

  const coverLettersWithVariation = resolvedTheme.config.coverLetters.map((coverLetter) => ({
    ...coverLetter,
    styles: variation?.styles.length ? variation.styles : coverLetter.styles,
  }));

  // 5. Create timestamped output directory
  const timestampMs = Date.now().toString();
  const timestamp = Math.floor(Date.now() / 1000).toString(); // Unix timestamp in seconds for Liquid date filter
  const buildDir = join(outputDirectory, timestampMs);
  await mkdir(buildDir, { recursive: true });

  const generatedFiles: string[] = [];

  // 6. Load user profile for template rendering
  const { config: userConfig } = await loadUserProfileConfig();
  const { profile: userProfile } = resolveProfile(userConfig, profileName);

  // 7. Prepare render context (shared by all outputs)
  const context: RenderContext = {
    profile: userProfile,
    selectedProfileName: profileName || 'default',
    resume: content.resume,
    coverLetter: content.coverLetter,
    metadata: {
      jobTitle: content.jobTitle,
      companyName: content.companyName,
      generatedAt: content.generatedAt,
      currentDate: formatCurrentDate(), // Current date in "Month DD, YYYY" format
    },
    theme: resolvedTheme.config,
    build: {
      timestamp,
      outputDirectory: buildDir,
    },
  };

  // 8. Render all resume outputs
  for (const resumeOutput of resumesWithVariation) {
    const templatePath = getTemplatePath(resolvedTheme, resumeOutput.template);

    // Validate output path is safe
    const outputPath = join(buildDir, resumeOutput.outputPath);
    validateOutputPathSafe(buildDir, outputPath);

    // Create output-specific context with styles
    const outputContext: RenderContext = {
      ...context,
      outputStyles: resumeOutput.styles || [],
    };

    const rendered = await renderTemplate(templatePath, outputContext, resolvedTheme.themePath);

    // Ensure output directory exists
    await mkdir(dirname(outputPath), { recursive: true });

    await writeFile(outputPath, rendered, 'utf-8');
    generatedFiles.push(resumeOutput.outputPath);
  }

  // 9. Render all cover letter outputs
  for (const coverLetterOutput of coverLettersWithVariation) {
    const templatePath = getTemplatePath(resolvedTheme, coverLetterOutput.template);

    // Validate output path is safe
    const outputPath = join(buildDir, coverLetterOutput.outputPath);
    validateOutputPathSafe(buildDir, outputPath);

    // Create output-specific context with styles
    const outputContext: RenderContext = {
      ...context,
      outputStyles: coverLetterOutput.styles || [],
    };

    const rendered = await renderTemplate(templatePath, outputContext, resolvedTheme.themePath);

    // Ensure output directory exists
    await mkdir(dirname(outputPath), { recursive: true });

    await writeFile(outputPath, rendered, 'utf-8');
    generatedFiles.push(coverLetterOutput.outputPath);
  }

  // 10. Copy styles referenced by outputs (using variation styles if specified)
  const { copiedStyles } = await copyThemeStyles(
    resolvedTheme,
    resumesWithVariation,
    coverLettersWithVariation,
    buildDir
  );

  // 11. Copy assets if defined
  await copyThemeAssets(resolvedTheme, buildDir);

  return {
    outputDirectory: buildDir,
    files: generatedFiles,
  };
}
