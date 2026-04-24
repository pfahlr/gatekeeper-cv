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

export interface BuildDocsParams {
  generatedJsonFile: string;
  themeName: string;
  outputDirectory: string;
  profileName?: string;
}

export interface BuildDocsResult {
  outputDirectory: string;
  files: string[];
}

export async function buildDocs(params: BuildDocsParams): Promise<BuildDocsResult> {
  const { generatedJsonFile, themeName, outputDirectory, profileName } = params;

  // 1. Load generated JSON
  const jsonContent = await readFile(generatedJsonFile, 'utf-8');
  const generatedData = JSON.parse(jsonContent);
  const content = generatedContentSchema.parse(generatedData);

  // 2. Resolve theme
  const resolvedTheme = await resolveTheme(themeName);

  // 3. Create timestamped output directory
  const timestamp = Date.now().toString();
  const buildDir = join(outputDirectory, timestamp);
  await mkdir(buildDir, { recursive: true });

  const generatedFiles: string[] = [];

  // 4. Prepare render context (shared by all outputs)
  const context: RenderContext = {
    profile: content,
    selectedProfileName: profileName || 'default',
    resume: content.resume,
    coverLetter: content.coverLetter,
    metadata: {
      jobTitle: content.jobTitle,
      companyName: content.companyName,
      generatedAt: content.generatedAt,
    },
    theme: resolvedTheme.config,
    build: {
      timestamp,
      outputDirectory: buildDir,
    },
  };

  // 5. Render all resume outputs
  for (const resumeOutput of resolvedTheme.config.resumes) {
    const templatePath = getTemplatePath(resolvedTheme, resumeOutput.template);

    // Validate output path is safe
    const outputPath = join(buildDir, resumeOutput.outputPath);
    validateOutputPathSafe(buildDir, outputPath);

    const rendered = await renderTemplate(templatePath, context, resolvedTheme.themePath);

    // Ensure output directory exists
    await mkdir(dirname(outputPath), { recursive: true });

    await writeFile(outputPath, rendered, 'utf-8');
    generatedFiles.push(resumeOutput.outputPath);
  }

  // 6. Render all cover letter outputs
  for (const coverLetterOutput of resolvedTheme.config.coverLetters) {
    const templatePath = getTemplatePath(resolvedTheme, coverLetterOutput.template);

    // Validate output path is safe
    const outputPath = join(buildDir, coverLetterOutput.outputPath);
    validateOutputPathSafe(buildDir, outputPath);

    const rendered = await renderTemplate(templatePath, context, resolvedTheme.themePath);

    // Ensure output directory exists
    await mkdir(dirname(outputPath), { recursive: true });

    await writeFile(outputPath, rendered, 'utf-8');
    generatedFiles.push(coverLetterOutput.outputPath);
  }

  // 7. Copy styles referenced by outputs
  const { copiedStyles } = await copyThemeStyles(
    resolvedTheme,
    resolvedTheme.config.resumes,
    resolvedTheme.config.coverLetters,
    buildDir
  );

  // 8. Copy assets if defined
  await copyThemeAssets(resolvedTheme, buildDir);

  return {
    outputDirectory: buildDir,
    files: generatedFiles,
  };
}
