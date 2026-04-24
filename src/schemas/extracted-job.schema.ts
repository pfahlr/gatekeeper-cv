import { z } from 'zod';

export const extractedJobSchema = z.object({
  url: z.string().url(),
  sourceUrl: z.string().url().optional(),
  sourceDomain: z.string().optional(),
  title: z.string(),
  company: z.string().optional(),
  location: z.string().optional(),
  employmentType: z.string().optional(),
  compensation: z.string().optional(),
  salary: z.string().optional(),
  description: z.string(),
  requirements: z.string().optional(),
  responsibilities: z.string().optional(),
  qualifications: z.string().optional(),
  benefits: z.string().optional(),
  rawText: z.string().optional(),
  extractedAt: z.string().datetime().optional(),
});

export type ExtractedJob = z.infer<typeof extractedJobSchema>;
