import { z } from 'zod';

export const coverLetterSchema = z.object({
  paragraphs: z.array(z.string()),
  greeting: z.string().optional(),
  closing: z.string().optional(),
});

// Skills can be grouped by category
export const resumeSkillsGroupSchema = z.object({
  category: z.string(),
  items: z.array(z.string()),
});

export const resumeExperienceItemSchema = z.object({
  company: z.string(),
  title: z.string(),
  startDate: z.string().datetime(), // ISO 8601 datetime
  endDate: z.string().datetime().nullable(), // ISO 8601 datetime or null for current position
  location: z.string().optional(),
  bullets: z.array(z.string()),
});

// Volunteering and leadership
export const resumeVolunteeringItemSchema = z.object({
  organization: z.string(),
  title: z.string(),
  startDate: z.string().datetime().optional(), // ISO 8601 datetime
  endDate: z.string().datetime().optional(), // ISO 8601 datetime
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
  bullets: z.array(z.string()).optional(), // Honors, awards, achievements
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
  skills: z.union([
    z.array(z.string()), // Flat list of skills
    z.array(resumeSkillsGroupSchema), // Grouped skills by category
  ]),
  experience: z.array(resumeExperienceItemSchema),
  volunteering: z.array(resumeVolunteeringItemSchema).optional(), // Volunteering & Leadership
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
export type ResumeSkillsGroup = z.infer<typeof resumeSkillsGroupSchema>;
export type ResumeExperienceItem = z.infer<typeof resumeExperienceItemSchema>;
export type ResumeVolunteeringItem = z.infer<typeof resumeVolunteeringItemSchema>;
export type ResumeEducationItem = z.infer<typeof resumeEducationItemSchema>;
export type ResumeProjectItem = z.infer<typeof resumeProjectItemSchema>;
