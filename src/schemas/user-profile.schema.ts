import { z } from 'zod';
import { nameSchema } from '../utils/name-validation.js';

export const resumeMetadataSchema = z.object({
  path: z.string(),
  description: z.string().optional(),
});

export const profileSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  location: z.string().optional(),
  website: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  resumes: z.record(nameSchema, resumeMetadataSchema),
  skills: z.array(z.string()).default([]),
  summary: z.string().optional(),
});

export const userProfileSchema = z
  .object({
    defaultProfile: nameSchema,
    profiles: z.record(nameSchema, profileSchema),
  })
  .refine(
    (data) => Object.keys(data.profiles).includes(data.defaultProfile),
    {
      message: 'defaultProfile must exist in profiles',
      path: ['defaultProfile'],
    }
  );

export type UserProfile = z.infer<typeof userProfileSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type ResumeMetadata = z.infer<typeof resumeMetadataSchema>;
