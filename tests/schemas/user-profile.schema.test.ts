import { describe, it, expect } from 'vitest';
import { userProfileSchema } from '../../src/schemas/user-profile.schema.js';

describe('user-profile schema', () => {
  const validProfile = {
    defaultProfile: 'default',
    profiles: {
      default: {
        name: 'John Doe',
        email: 'john@example.com',
        resumes: {
          main: {
            path: './resumes/default.md',
            description: 'My main resume',
          },
        },
        skills: ['TypeScript', 'Node.js'],
      },
    },
  };

  it('should accept valid profile config', () => {
    const result = userProfileSchema.safeParse(validProfile);
    expect(result.success).toBe(true);
  });

  it('should fail when defaultProfile does not exist in profiles', () => {
    const invalidProfile = {
      ...validProfile,
      defaultProfile: 'nonexistent',
    };
    const result = userProfileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('defaultProfile must exist');
    }
  });

  it('should fail on invalid profile name', () => {
    const invalidProfile = {
      defaultProfile: 'invalid-name-with-dash',
      profiles: {
        'invalid-name-with-dash': {
          name: 'John Doe',
          email: 'john@example.com',
          resumes: {},
        },
      },
    };
    const result = userProfileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
  });

  it('should accept valid profile names', () => {
    const validNames = ['default', 'my_profile', 'profile123', 'abc_123'];
    for (const name of validNames) {
      const profile = {
        defaultProfile: name,
        profiles: {
          [name]: {
            name: 'John Doe',
            email: 'john@example.com',
            resumes: {},
          },
        },
      };
      const result = userProfileSchema.safeParse(profile);
      expect(result.success).toBe(true);
    }
  });
});
