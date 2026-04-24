import { Liquid } from 'liquidjs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { ResolvedTheme } from './resolve-theme.js';
import type { ThemeConfig } from '../schemas/theme.schema.js';

const engine = new Liquid({
  root: ['/'], // Will be overridden with theme path
  extname: '.liquid',
});

export interface RenderContext {
  profile: any;
  selectedProfileName: string;
  resume: any; // Resume structured data from generated-content schema
  coverLetter: any;
  metadata?: any;
  theme: ThemeConfig;
  build: {
    timestamp: string;
    outputDirectory: string;
  };
}

export async function renderTemplate(
  templatePath: string,
  context: RenderContext,
  themePath: string
): Promise<string> {
  const templateContent = await readFile(templatePath, 'utf-8');

  // Create a new engine instance with the theme path as root
  const engine = new Liquid({
    root: themePath,
    extname: '.liquid',
  });

  return engine.parseAndRender(templateContent, context);
}

export function getTemplatePath(
  theme: ResolvedTheme,
  templateFile: string
): string {
  return resolve(theme.themePath, 'templates', templateFile);
}
