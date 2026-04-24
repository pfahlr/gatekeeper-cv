import { readFile } from 'node:fs/promises';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import { resolveTheme } from './resolve-theme.js';
import { renderTemplate, getTemplatePath, type RenderContext } from './render-theme.js';
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

  // 4. Render first resume output
  if (resolvedTheme.config.resumes.length > 0) {
    const resumeOutput = resolvedTheme.config.resumes[0];
    const templatePath = getTemplatePath(resolvedTheme, resumeOutput.template);

    const context: RenderContext = {
      profile: content, // Using generated content as profile for now
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

    const rendered = await renderTemplate(templatePath, context, resolvedTheme.themePath);
    const outputPath = join(buildDir, resumeOutput.outputPath);
    await writeFile(outputPath, rendered, 'utf-8');
    generatedFiles.push(resumeOutput.outputPath);
  }

  // 5. Render first cover letter output
  if (resolvedTheme.config.coverLetters.length > 0) {
    const coverLetterOutput = resolvedTheme.config.coverLetters[0];
    const templatePath = getTemplatePath(resolvedTheme, coverLetterOutput.template);

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

    const rendered = await renderTemplate(templatePath, context, resolvedTheme.themePath);
    const outputPath = join(buildDir, coverLetterOutput.outputPath);
    await writeFile(outputPath, rendered, 'utf-8');
    generatedFiles.push(coverLetterOutput.outputPath);
  }

  return {
    outputDirectory: buildDir,
    files: generatedFiles,
  };
}
