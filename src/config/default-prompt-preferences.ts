export const defaultPromptPreferences = {
  tone: 'professional',
  targetRoleTypes: [] as string[],
  industriesToEmphasize: [] as string[],
  skillsToEmphasize: [] as string[],
  skillsToAvoidOverstating: [] as string[],
  experienceToEmphasize: [] as string[],
  experienceToDeemphasize: [] as string[],
  jobTypesToPrioritize: [] as string[],
  jobTypesToDeprioritize: [] as string[],
  coverLetterGuidance: {
    openingStyle: 'direct' as const,
    includePersonalMotivation: false,
    avoidGenericPraise: true,
    preferredLength: 'medium' as const,
  },
  resumeGuidance: {
    summaryStyle: 'specific' as const,
    bulletStyle: 'achievement_oriented' as const,
    maxBulletLength: 'medium' as const,
    prioritizeKeywords: true,
  },
  customInstructions: [] as string[],
};
