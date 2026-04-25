import { z } from 'zod';
import { nameSchema } from '../utils/name-validation.js';

export const resumeOutputSchema = z.object({
  template: z.string(),
  outputPath: z.string(),
  styles: z.array(z.string()).default([]),
});

export const coverLetterOutputSchema = z.object({
  template: z.string(),
  outputPath: z.string(),
  styles: z.array(z.string()).default([]),
});

export const themeVariationSchema = z.object({
  description: z.string().optional(),
  styles: z.array(z.string()).default([]),
});

export const themeConfigSchema = z
  .object({
    name: nameSchema,
    description: z.string().optional(),
    assetsDir: z.string().optional(),
    resumes: z.array(resumeOutputSchema).default([]),
    coverLetters: z.array(coverLetterOutputSchema).default([]),
    variations: z
      .record(z.string().regex(/^[a-zA-Z0-9_-]+$/, 'Variation names must be alphanumeric with underscores and hyphens allowed'), themeVariationSchema)
      .optional(),
  })
  .refine(
    (data) => data.resumes.length > 0 || data.coverLetters.length > 0,
    {
      message: 'Theme must have at least one resume or cover letter output',
      path: ['resumes', 'coverLetters'],
    }
  )
  .refine(
    (data) => {
      if (!data.variations) return true;
      return data.variations.default !== undefined;
    },
    {
      message: 'Theme variations must include a "default" variation',
      path: ['variations'],
    }
  );

export type ThemeConfig = z.infer<typeof themeConfigSchema>;
export type ResumeOutput = z.infer<typeof resumeOutputSchema>;
export type CoverLetterOutput = z.infer<typeof coverLetterOutputSchema>;
