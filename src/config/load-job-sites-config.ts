import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { jobSiteConfigSchema, type JobSite, type JobSiteConfig } from '../schemas/job-site-config.schema.js';

export { type JobSite, type JobSiteConfig };

export async function loadJobSitesConfig(
  configPath?: string
): Promise<JobSiteConfig> {
  const path = configPath ?? resolve(process.cwd(), 'job-sites.config.json');

  const content = await readFile(path, 'utf-8');
  const parsed = JSON.parse(content);
  const config = jobSiteConfigSchema.parse(parsed);

  return config;
}
