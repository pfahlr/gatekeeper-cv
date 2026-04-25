import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spoofHeadersConfigSchema, type SpoofHeadersConfig, type HeadersRecord } from '../schemas/spoof-headers.schema.js';

export { type SpoofHeadersConfig, type HeadersRecord };

export async function loadSpoofHeadersConfig(
  configPath?: string
): Promise<SpoofHeadersConfig> {
  const path = configPath ?? resolve(process.cwd(), 'spoof-headers.config.json');

  try {
    const content = await readFile(path, 'utf-8');
    const parsed = JSON.parse(content);
    return spoofHeadersConfigSchema.parse(parsed);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // Config file doesn't exist, return default disabled config
      return { enabled: false, headers: {} };
    }
    throw error;
  }
}
