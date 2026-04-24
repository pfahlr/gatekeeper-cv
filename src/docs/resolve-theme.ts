import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { existsSync } from 'node:fs';
import { themeConfigSchema, type ThemeConfig } from '../schemas/theme.schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ROOT = resolve(__dirname, '../..');

export interface ResolvedTheme {
  name: string;
  config: ThemeConfig;
  themePath: string;
}

export async function resolveTheme(themeName: string): Promise<ResolvedTheme> {
  // Validate theme name
  if (!/^[a-z0-9_]+$/.test(themeName)) {
    throw new Error(
      `Invalid theme name "${themeName}". Theme names must contain only lowercase letters, numbers, and underscores.`
    );
  }

  // Lookup order: user themes first, then stock themes
  const userThemePath = resolve(PROJECT_ROOT, 'themes/user', themeName);
  const stockThemePath = resolve(PROJECT_ROOT, 'themes/stock', themeName);

  let themePath = '';
  if (existsSync(userThemePath)) {
    themePath = userThemePath;
  } else if (existsSync(stockThemePath)) {
    themePath = stockThemePath;
  } else {
    throw new Error(
      `Theme "${themeName}" not found. Looked in themes/user/ and themes/stock/.`
    );
  }

  const configPath = resolve(themePath, 'theme.json');
  if (!existsSync(configPath)) {
    throw new Error(`Theme configuration file not found: ${configPath}`);
  }

  const configContent = await readFile(configPath, 'utf-8');
  const config = themeConfigSchema.parse(JSON.parse(configContent));

  // Validate that the config name matches the requested theme name
  if (config.name !== themeName) {
    throw new Error(
      `Theme configuration name mismatch: expected "${themeName}" but found "${config.name}" in ${configPath}`
    );
  }

  return {
    name: themeName,
    config,
    themePath,
  };
}
