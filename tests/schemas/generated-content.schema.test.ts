import { describe, it, expect } from 'vitest';
import { generatedContentSchema } from '../../src/schemas/generated-content.schema.js';

describe('generated-content schema', () => {
  const minimalContent = {
    resume: 'Resume content here',
    coverLetter: {
      paragraphs: ['First paragraph', 'Second paragraph'],
    },
  };

  it('should accept minimal generated content', () => {
    const result = generatedContentSchema.safeParse(minimalContent);
    expect(result.success).toBe(true);
  });

  it('should accept content with all optional fields', () => {
    const fullContent = {
      resume: 'Resume content here',
      coverLetter: {
        paragraphs: ['First paragraph'],
        greeting: 'Dear Hiring Manager,',
        closing: 'Sincerely,',
      },
      jobTitle: 'Senior Developer',
      companyName: 'Acme Corp',
      generatedAt: '2024-01-01T00:00:00Z',
      notes: 'Some notes',
    };
    const result = generatedContentSchema.safeParse(fullContent);
    expect(result.success).toBe(true);
  });

  it('should require resume field', () => {
    const invalidContent = {
      coverLetter: {
        paragraphs: ['First paragraph'],
      },
    };
    const result = generatedContentSchema.safeParse(invalidContent);
    expect(result.success).toBe(false);
  });

  it('should require coverLetter field', () => {
    const invalidContent = {
      resume: 'Resume content',
    };
    const result = generatedContentSchema.safeParse(invalidContent);
    expect(result.success).toBe(false);
  });

  it('should require coverLetter.paragraphs', () => {
    const invalidContent = {
      resume: 'Resume content',
      coverLetter: {},
    };
    const result = generatedContentSchema.safeParse(invalidContent);
    expect(result.success).toBe(false);
  });

  it('should accept empty paragraphs array', () => {
    const content = {
      resume: 'Resume content',
      coverLetter: {
        paragraphs: [],
      },
    };
    const result = generatedContentSchema.safeParse(content);
    expect(result.success).toBe(true);
  });
});
