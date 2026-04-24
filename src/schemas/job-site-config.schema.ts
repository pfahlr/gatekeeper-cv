import { z } from 'zod';
import { nameSchema } from '../utils/name-validation.js';

// Domain names can contain letters, numbers, dots, and hyphens
export const domainNameSchema = z.string().regex(/^[a-z0-9.-]+$/, {
  message: 'Domain name must contain only lowercase letters, numbers, dots, and hyphens',
});

// Selectors can be a single string or an array of strings
const selectorValue = z.union([z.string(), z.array(z.string())]);

export const selectorsSchema = z.object({
  title: selectorValue,
  description: selectorValue,
  company: selectorValue.optional(),
  location: selectorValue.optional(),
  salary: selectorValue.optional(),
  requirements: selectorValue.optional(),
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
export type SelectorValue = z.infer<typeof selectorValue>;
