import { z } from 'zod';
import { nameSchema } from '../utils/name-validation.js';

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
  jobSites: z.record(nameSchema, jobSiteSchema),
});

export type JobSiteConfig = z.infer<typeof jobSiteConfigSchema>;
export type JobSite = z.infer<typeof jobSiteSchema>;
export type Selectors = z.infer<typeof selectorsSchema>;
