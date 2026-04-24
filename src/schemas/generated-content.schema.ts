import { z } from 'zod';

export const coverLetterSchema = z.object({
  paragraphs: z.array(z.string()),
  greeting: z.string().optional(),
  closing: z.string().optional(),
});

export const generatedContentSchema = z.object({
  resume: z.string(),
  coverLetter: coverLetterSchema,
  jobTitle: z.string().optional(),
  companyName: z.string().optional(),
  generatedAt: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export type GeneratedContent = z.infer<typeof generatedContentSchema>;
export type CoverLetter = z.infer<typeof coverLetterSchema>;
