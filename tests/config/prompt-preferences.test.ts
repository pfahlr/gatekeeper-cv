import { describe, it, expect } from 'vitest';
import { resolvePromptPreferences } from '../../src/config/resolve-prompt-preferences.js';
import { promptPreferencesSchema } from '../../src/config/resolve-prompt-preferences.js';

describe('prompt preferences', () => {
  describe('resolvePromptPreferences', () => {
    it('should return defaults when no preferences provided', () => {
      const result = resolvePromptPreferences();

      expect(result.tone).toBe('professional');
      expect(result.targetRoleTypes).toEqual([]);
      expect(result.coverLetterGuidance.openingStyle).toBe('direct');
      expect(result.resumeGuidance.summaryStyle).toBe('specific');
    });

    it('should not mutate default object', () => {
      const result1 = resolvePromptPreferences();
      const result2 = resolvePromptPreferences({ tone: 'casual' });

      expect(result1.tone).toBe('professional');
      expect(result2.tone).toBe('casual');
    });

    it('should merge top-level overrides', () => {
      const result = resolvePromptPreferences({
        tone: 'casual',
        skillsToEmphasize: ['TypeScript', 'React'],
      });

      expect(result.tone).toBe('casual');
      expect(result.skillsToEmphasize).toEqual(['TypeScript', 'React']);
      expect(result.targetRoleTypes).toEqual([]);
    });

    it('should replace arrays when provided', () => {
      const result = resolvePromptPreferences({
        targetRoleTypes: ['Senior', 'Lead'],
        skillsToEmphasize: ['Python'],
      });

      expect(result.targetRoleTypes).toEqual(['Senior', 'Lead']);
      expect(result.skillsToEmphasize).toEqual(['Python']);
    });

    it('should merge nested coverLetterGuidance', () => {
      const result = resolvePromptPreferences({
        coverLetterGuidance: {
          openingStyle: 'narrative',
          includePersonalMotivation: true,
        },
      });

      expect(result.coverLetterGuidance.openingStyle).toBe('narrative');
      expect(result.coverLetterGuidance.includePersonalMotivation).toBe(true);
      expect(result.coverLetterGuidance.avoidGenericPraise).toBe(true);
      expect(result.coverLetterGuidance.preferredLength).toBe('medium');
    });

    it('should merge nested resumeGuidance', () => {
      const result = resolvePromptPreferences({
        resumeGuidance: {
          bulletStyle: 'detailed',
          prioritizeKeywords: false,
        },
      });

      expect(result.resumeGuidance.bulletStyle).toBe('detailed');
      expect(result.resumeGuidance.prioritizeKeywords).toBe(false);
      expect(result.resumeGuidance.summaryStyle).toBe('specific');
      expect(result.resumeGuidance.maxBulletLength).toBe('medium');
    });

    it('should merge both nested objects', () => {
      const result = resolvePromptPreferences({
        coverLetterGuidance: {
          preferredLength: 'long',
        },
        resumeGuidance: {
          maxBulletLength: 'short',
        },
      });

      expect(result.coverLetterGuidance.preferredLength).toBe('long');
      expect(result.resumeGuidance.maxBulletLength).toBe('short');
    });

    it('should handle empty objects', () => {
      const result = resolvePromptPreferences({
        coverLetterGuidance: {},
        resumeGuidance: {},
      });

      expect(result.coverLetterGuidance.openingStyle).toBe('direct');
      expect(result.resumeGuidance.summaryStyle).toBe('specific');
    });
  });

  describe('promptPreferencesSchema', () => {
    it('should accept valid preferences', () => {
      const valid = {
        tone: 'professional',
        targetRoleTypes: ['Senior'],
        coverLetterGuidance: {
          openingStyle: 'direct',
          preferredLength: 'medium',
        },
        resumeGuidance: {
          summaryStyle: 'specific',
        },
      };

      const result = promptPreferencesSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should accept partial preferences', () => {
      const partial = {
        tone: 'casual',
      };

      const result = promptPreferencesSchema.safeParse(partial);
      expect(result.success).toBe(true);
    });

    it('should fail on invalid preferredLength', () => {
      const invalid = {
        coverLetterGuidance: {
          preferredLength: 'invalid',
        },
      };

      const result = promptPreferencesSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should fail on invalid maxBulletLength', () => {
      const invalid = {
        resumeGuidance: {
          maxBulletLength: 'invalid',
        },
      };

      const result = promptPreferencesSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should fail on invalid openingStyle', () => {
      const invalid = {
        coverLetterGuidance: {
          openingStyle: 'invalid',
        },
      };

      const result = promptPreferencesSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should fail on invalid summaryStyle', () => {
      const invalid = {
        resumeGuidance: {
          summaryStyle: 'invalid',
        },
      };

      const result = promptPreferencesSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should apply default values', () => {
      const empty = {};

      const result = promptPreferencesSchema.parse(empty);
      expect(result.tone).toBe('professional');
      expect(result.targetRoleTypes).toEqual([]);
      expect(result.customInstructions).toEqual([]);
    });
  });
});
