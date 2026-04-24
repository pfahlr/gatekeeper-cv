import { z } from 'zod';
import { defaultPromptPreferences } from './default-prompt-preferences.js';

export const coverLetterGuidanceSchema = z.object({
  openingStyle: z.enum(['direct', 'narrative', 'creative']).default('direct'),
  includePersonalMotivation: z.boolean().default(false),
  avoidGenericPraise: z.boolean().default(true),
  preferredLength: z.enum(['short', 'medium', 'long']).default('medium'),
});

export const resumeGuidanceSchema = z.object({
  summaryStyle: z.enum(['concise', 'specific', 'narrative']).default('specific'),
  bulletStyle: z.enum(['concise', 'achievement_oriented', 'detailed']).default('achievement_oriented'),
  maxBulletLength: z.enum(['short', 'medium', 'long']).default('medium'),
  prioritizeKeywords: z.boolean().default(true),
});

export const promptPreferencesSchema = z.object({
  tone: z.string().default('professional'),
  targetRoleTypes: z.array(z.string()).default([]),
  industriesToEmphasize: z.array(z.string()).default([]),
  skillsToEmphasize: z.array(z.string()).default([]),
  skillsToAvoidOverstating: z.array(z.string()).default([]),
  experienceToEmphasize: z.array(z.string()).default([]),
  experienceToDeemphasize: z.array(z.string()).default([]),
  jobTypesToPrioritize: z.array(z.string()).default([]),
  jobTypesToDeprioritize: z.array(z.string()).default([]),
  coverLetterGuidance: coverLetterGuidanceSchema.optional(),
  resumeGuidance: resumeGuidanceSchema.optional(),
  customInstructions: z.array(z.string()).default([]),
});

export type CoverLetterGuidance = z.infer<typeof coverLetterGuidanceSchema>;
export type ResumeGuidance = z.infer<typeof resumeGuidanceSchema>;
export type PromptPreferences = z.infer<typeof promptPreferencesSchema>;

export type ResolvedPromptPreferences = {
  tone: string;
  targetRoleTypes: string[];
  industriesToEmphasize: string[];
  skillsToEmphasize: string[];
  skillsToAvoidOverstating: string[];
  experienceToEmphasize: string[];
  experienceToDeemphasize: string[];
  jobTypesToPrioritize: string[];
  jobTypesToDeprioritize: string[];
  coverLetterGuidance: {
    openingStyle: 'direct' | 'narrative' | 'creative';
    includePersonalMotivation: boolean;
    avoidGenericPraise: boolean;
    preferredLength: 'short' | 'medium' | 'long';
  };
  resumeGuidance: {
    summaryStyle: 'concise' | 'specific' | 'narrative';
    bulletStyle: 'concise' | 'achievement_oriented' | 'detailed';
    maxBulletLength: 'short' | 'medium' | 'long';
    prioritizeKeywords: boolean;
  };
  customInstructions: string[];
};

export interface ProfilePromptPreferences {
  tone?: string;
  targetRoleTypes?: string[];
  industriesToEmphasize?: string[];
  skillsToEmphasize?: string[];
  skillsToAvoidOverstating?: string[];
  experienceToEmphasize?: string[];
  experienceToDeemphasize?: string[];
  jobTypesToPrioritize?: string[];
  jobTypesToDeprioritize?: string[];
  coverLetterGuidance?: Partial<CoverLetterGuidance>;
  resumeGuidance?: Partial<ResumeGuidance>;
  customInstructions?: string[];
}

export function resolvePromptPreferences(
  profilePromptPreferences?: ProfilePromptPreferences
): ResolvedPromptPreferences {
  if (!profilePromptPreferences) {
    return {
      ...defaultPromptPreferences,
      targetRoleTypes: [...defaultPromptPreferences.targetRoleTypes],
      industriesToEmphasize: [...defaultPromptPreferences.industriesToEmphasize],
      skillsToEmphasize: [...defaultPromptPreferences.skillsToEmphasize],
      skillsToAvoidOverstating: [...defaultPromptPreferences.skillsToAvoidOverstating],
      experienceToEmphasize: [...defaultPromptPreferences.experienceToEmphasize],
      experienceToDeemphasize: [...defaultPromptPreferences.experienceToDeemphasize],
      jobTypesToPrioritize: [...defaultPromptPreferences.jobTypesToPrioritize],
      jobTypesToDeprioritize: [...defaultPromptPreferences.jobTypesToDeprioritize],
      customInstructions: [...defaultPromptPreferences.customInstructions],
      coverLetterGuidance: { ...defaultPromptPreferences.coverLetterGuidance },
      resumeGuidance: { ...defaultPromptPreferences.resumeGuidance },
    };
  }

  return {
    tone: profilePromptPreferences.tone ?? defaultPromptPreferences.tone,
    targetRoleTypes: profilePromptPreferences.targetRoleTypes
      ? [...profilePromptPreferences.targetRoleTypes]
      : [...defaultPromptPreferences.targetRoleTypes],
    industriesToEmphasize: profilePromptPreferences.industriesToEmphasize
      ? [...profilePromptPreferences.industriesToEmphasize]
      : [...defaultPromptPreferences.industriesToEmphasize],
    skillsToEmphasize: profilePromptPreferences.skillsToEmphasize
      ? [...profilePromptPreferences.skillsToEmphasize]
      : [...defaultPromptPreferences.skillsToEmphasize],
    skillsToAvoidOverstating: profilePromptPreferences.skillsToAvoidOverstating
      ? [...profilePromptPreferences.skillsToAvoidOverstating]
      : [...defaultPromptPreferences.skillsToAvoidOverstating],
    experienceToEmphasize: profilePromptPreferences.experienceToEmphasize
      ? [...profilePromptPreferences.experienceToEmphasize]
      : [...defaultPromptPreferences.experienceToEmphasize],
    experienceToDeemphasize: profilePromptPreferences.experienceToDeemphasize
      ? [...profilePromptPreferences.experienceToDeemphasize]
      : [...defaultPromptPreferences.experienceToDeemphasize],
    jobTypesToPrioritize: profilePromptPreferences.jobTypesToPrioritize
      ? [...profilePromptPreferences.jobTypesToPrioritize]
      : [...defaultPromptPreferences.jobTypesToPrioritize],
    jobTypesToDeprioritize: profilePromptPreferences.jobTypesToDeprioritize
      ? [...profilePromptPreferences.jobTypesToDeprioritize]
      : [...defaultPromptPreferences.jobTypesToDeprioritize],
    coverLetterGuidance: {
      openingStyle: profilePromptPreferences.coverLetterGuidance?.openingStyle ?? defaultPromptPreferences.coverLetterGuidance.openingStyle,
      includePersonalMotivation: profilePromptPreferences.coverLetterGuidance?.includePersonalMotivation ?? defaultPromptPreferences.coverLetterGuidance.includePersonalMotivation,
      avoidGenericPraise: profilePromptPreferences.coverLetterGuidance?.avoidGenericPraise ?? defaultPromptPreferences.coverLetterGuidance.avoidGenericPraise,
      preferredLength: profilePromptPreferences.coverLetterGuidance?.preferredLength ?? defaultPromptPreferences.coverLetterGuidance.preferredLength,
    },
    resumeGuidance: {
      summaryStyle: profilePromptPreferences.resumeGuidance?.summaryStyle ?? defaultPromptPreferences.resumeGuidance.summaryStyle,
      bulletStyle: profilePromptPreferences.resumeGuidance?.bulletStyle ?? defaultPromptPreferences.resumeGuidance.bulletStyle,
      maxBulletLength: profilePromptPreferences.resumeGuidance?.maxBulletLength ?? defaultPromptPreferences.resumeGuidance.maxBulletLength,
      prioritizeKeywords: profilePromptPreferences.resumeGuidance?.prioritizeKeywords ?? defaultPromptPreferences.resumeGuidance.prioritizeKeywords,
    },
    customInstructions: profilePromptPreferences.customInstructions
      ? [...profilePromptPreferences.customInstructions]
      : [...defaultPromptPreferences.customInstructions],
  };
}
