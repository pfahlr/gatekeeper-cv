import type { ResolvedPromptPreferences } from '../config/resolve-prompt-preferences.js';

export function formatPromptPreferences(preferences: ResolvedPromptPreferences): string {
  const sections: string[] = [];

  if (preferences.tone) {
    sections.push(`Tone: ${preferences.tone}`);
  }

  if (preferences.targetRoleTypes.length > 0) {
    sections.push(`Target role types: ${preferences.targetRoleTypes.join(', ')}`);
  }

  if (preferences.industriesToEmphasize.length > 0) {
    sections.push(`Industries to emphasize: ${preferences.industriesToEmphasize.join(', ')}`);
  }

  if (preferences.skillsToEmphasize.length > 0) {
    sections.push(`Skills to emphasize: ${preferences.skillsToEmphasize.join(', ')}`);
  }

  if (preferences.skillsToAvoidOverstating.length > 0) {
    sections.push(`Skills to avoid overstating: ${preferences.skillsToAvoidOverstating.join(', ')}`);
  }

  if (preferences.experienceToEmphasize.length > 0) {
    sections.push(`Experience to emphasize: ${preferences.experienceToEmphasize.join(', ')}`);
  }

  if (preferences.experienceToDeemphasize.length > 0) {
    sections.push(`Experience to deemphasize: ${preferences.experienceToDeemphasize.join(', ')}`);
  }

  if (preferences.jobTypesToPrioritize.length > 0) {
    sections.push(`Job types to prioritize: ${preferences.jobTypesToPrioritize.join(', ')}`);
  }

  if (preferences.jobTypesToDeprioritize.length > 0) {
    sections.push(`Job types to deprioritize: ${preferences.jobTypesToDeprioritize.join(', ')}`);
  }

  // Cover letter guidance
  sections.push('Cover letter guidance:');
  sections.push(`  Opening style: ${preferences.coverLetterGuidance.openingStyle}`);
  sections.push(`  Include personal motivation: ${preferences.coverLetterGuidance.includePersonalMotivation}`);
  sections.push(`  Avoid generic praise: ${preferences.coverLetterGuidance.avoidGenericPraise}`);
  sections.push(`  Preferred length: ${preferences.coverLetterGuidance.preferredLength}`);

  // Resume guidance
  sections.push('Resume guidance:');
  sections.push(`  Summary style: ${preferences.resumeGuidance.summaryStyle}`);
  sections.push(`  Bullet style: ${preferences.resumeGuidance.bulletStyle}`);
  sections.push(`  Max bullet length: ${preferences.resumeGuidance.maxBulletLength}`);
  sections.push(`  Prioritize keywords: ${preferences.resumeGuidance.prioritizeKeywords}`);

  if (preferences.customInstructions.length > 0) {
    sections.push(`Custom instructions:\n${preferences.customInstructions.map((i, idx) => `  ${idx + 1}. ${i}`).join('\n')}`);
  }

  return sections.join('\n');
}
