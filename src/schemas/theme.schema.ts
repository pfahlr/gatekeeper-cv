import { z } from 'zod';
import { nameSchema } from '../utils/name-validation.js';

export const resumeOutputSchema = z.object({
  template: z.string(),
  outputPath: z.string(),
});

export const coverLetterOutputSchema = z.object({
  template: z.string(),
  outputPath: z.string(),
});

export const themeConfigSchema = z
  .object({
    name: nameSchema,
    description: z.string().optional(),
    resumes: z.array(resumeOutputSchema).default([]),
    coverLetters: z.array(coverLetterOutputSchema).default([]),
  })
  .refine(
    (data) => data.resumes.length > 0 || data.coverLetters.length > 0,
    {
      message: 'Theme must have at least one resume or cover letter output',
      path: ['resumes', 'coverLetters'],
    }
  );

export type ThemeConfig = z.infer<typeof themeConfigSchema>;
export type ResumeOutput = z.infer<typeof resumeOutputSchema>;
export type CoverLetterOutput = z.infer<typeof coverLetterOutputSchema>;
