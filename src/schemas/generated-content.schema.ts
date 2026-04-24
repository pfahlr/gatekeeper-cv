import { z } from 'zod';

export const coverLetterSchema = z.object({
  paragraphs: z.array(z.string()),
  greeting: z.string().optional(),
  closing: z.string().optional(),
});

export const resumeExperienceItemSchema = z.object({
  company: z.string(),
  title: z.string(),
  startDate: z.string().datetime(), // ISO 8601 datetime
  endDate: z.string().datetime().nullable(), // ISO 8601 datetime or null for current position
  location: z.string().optional(),
  bullets: z.array(z.string()),
});

export const resumeEducationItemSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  field: z.string().optional(),
  startDate: z.string().datetime().optional(), // ISO 8601 datetime
  endDate: z.string().datetime().optional(), // ISO 8601 datetime
  gpa: z.string().optional(),
});

export const resumeProjectItemSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  url: z.string().url().optional(),
  startDate: z.string().datetime().optional(), // ISO 8601 datetime
  endDate: z.string().datetime().optional(), // ISO 8601 datetime
});

export const resumeSchema = z.object({
  summary: z.string().optional(),
  skills: z.array(z.string()),
  experience: z.array(resumeExperienceItemSchema),
  education: z.array(resumeEducationItemSchema).optional(),
  projects: z.array(resumeProjectItemSchema).optional(),
});

export const generatedContentSchema = z.object({
  resume: resumeSchema,
  coverLetter: coverLetterSchema,
  jobTitle: z.string().optional(),
  companyName: z.string().optional(),
  generatedAt: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export type GeneratedContent = z.infer<typeof generatedContentSchema>;
export type CoverLetter = z.infer<typeof coverLetterSchema>;
export type Resume = z.infer<typeof resumeSchema>;
export type ResumeExperienceItem = z.infer<typeof resumeExperienceItemSchema>;
export type ResumeEducationItem = z.infer<typeof resumeEducationItemSchema>;
export type ResumeProjectItem = z.infer<typeof resumeProjectItemSchema>;
