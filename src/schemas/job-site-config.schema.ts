import { z } from 'zod';
import { nameSchema } from '../utils/name-validation.js';

// Domain names can contain letters, numbers, dots, and hyphens
export const domainNameSchema = z.string().regex(/^[a-z0-9.-]+$/, {
  message: 'Domain name must contain only lowercase letters, numbers, dots, and hyphens',
});

export const selectorsSchema = z.object({
  title: z.string(),
  description: z.string(),
  company: z.string().optional(),
  location: z.string().optional(),
  salary: z.string().optional(),
  requirements: z.string().optional(),
});

export const jobSiteSchema = z.object({
  name: z.string(),
  urlPattern: z.string(),
  selectors: selectorsSchema,
});

export const jobSiteConfigSchema = z.object({
  jobSites: z.record(domainNameSchema, jobSiteSchema),
});

export type JobSiteConfig = z.infer<typeof jobSiteConfigSchema>;
export type JobSite = z.infer<typeof jobSiteSchema>;
export type Selectors = z.infer<typeof selectorsSchema>;
