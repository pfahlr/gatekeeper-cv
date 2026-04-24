import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const PROJECT_ROOT = resolve(__dirname, '../..');

export function getUserInfoDir(): string {
  return join(PROJECT_ROOT, 'user-info');
}

export function getUserInfoFilePath(relativePath: string): string {
  return join(getUserInfoDir(), relativePath);
}

export function getDefaultProfilePath(): string {
  return getUserInfoFilePath('profile.json');
}
