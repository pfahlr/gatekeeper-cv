import { describe, it, expect } from 'vitest';
import { loadJobSitesConfig } from '../../src/config/load-job-sites-config.js';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('loadJobSitesConfig', () => {
  const fixturesDir = join(__dirname, '../fixtures');

  it('should load valid job sites config', async () => {
    const configPath = join(fixturesDir, 'job-sites.config.valid.json');
    const config = await loadJobSitesConfig(configPath);

    expect(config.jobSites).toBeDefined();
    expect(Object.keys(config.jobSites)).toHaveLength(3);
    expect(config.jobSites['example.com']).toBeDefined();
    expect(config.jobSites['example.com'].name).toBe('Example Job Board');
  });

  it('should fail to load invalid config', async () => {
    const configPath = join(fixturesDir, 'job-sites.config.invalid.json');

    await expect(loadJobSitesConfig(configPath)).rejects.toThrow();
  });

  it('should throw when config file does not exist', async () => {
    const configPath = join(fixturesDir, 'nonexistent.json');

    await expect(loadJobSitesConfig(configPath)).rejects.toThrow();
  });
});
