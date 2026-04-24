import { z } from 'zod';

export const extractedJobSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  description: z.string(),
  company: z.string().optional(),
  location: z.string().optional(),
  salary: z.string().optional(),
  requirements: z.string().optional(),
  extractedAt: z.string().datetime().optional(),
});

export type ExtractedJob = z.infer<typeof extractedJobSchema>;
