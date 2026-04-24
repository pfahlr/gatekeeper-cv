import { describe, it, expect } from 'vitest';
import { generatedContentSchema } from '../../src/schemas/generated-content.schema.js';

describe('generated-content schema', () => {
  const minimalContent = {
    resume: {
      skills: ['JavaScript', 'TypeScript'],
      experience: [],
    },
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
      resume: {
        summary: 'Experienced developer',
        skills: ['JavaScript', 'TypeScript'],
        experience: [
          {
            company: 'Acme Corp',
            title: 'Senior Developer',
            startDate: '2020-01-01T00:00:00Z',
            endDate: null,
            bullets: ['Led development'],
          },
        ],
        education: [
          {
            institution: 'University',
            degree: 'BS Computer Science',
            startDate: '2014-09-01T00:00:00Z',
            endDate: '2018-05-15T00:00:00Z',
          },
        ],
      },
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
      resume: {
        skills: [],
        experience: [],
      },
    };
    const result = generatedContentSchema.safeParse(invalidContent);
    expect(result.success).toBe(false);
  });

  it('should require coverLetter.paragraphs', () => {
    const invalidContent = {
      resume: {
        skills: [],
        experience: [],
      },
      coverLetter: {},
    };
    const result = generatedContentSchema.safeParse(invalidContent);
    expect(result.success).toBe(false);
  });

  it('should accept empty paragraphs array', () => {
    const content = {
      resume: {
        skills: [],
        experience: [],
      },
      coverLetter: {
        paragraphs: [],
      },
    };
    const result = generatedContentSchema.safeParse(content);
    expect(result.success).toBe(true);
  });

  it('should require resume.skills', () => {
    const invalidContent = {
      resume: {
        experience: [],
      },
      coverLetter: {
        paragraphs: [],
      },
    };
    const result = generatedContentSchema.safeParse(invalidContent);
    expect(result.success).toBe(false);
  });

  it('should require resume.experience', () => {
    const invalidContent = {
      resume: {
        skills: [],
      },
      coverLetter: {
        paragraphs: [],
      },
    };
    const result = generatedContentSchema.safeParse(invalidContent);
    expect(result.success).toBe(false);
  });

  it('should validate datetime format for dates', () => {
    const invalidContent = {
      resume: {
        skills: [],
        experience: [
          {
            company: 'Acme Corp',
            title: 'Developer',
            startDate: 'not-a-datetime',
            endDate: null,
            bullets: [],
          },
        ],
      },
      coverLetter: {
        paragraphs: [],
      },
    };
    const result = generatedContentSchema.safeParse(invalidContent);
    expect(result.success).toBe(false);
  });

  it('should accept grouped skills with category and items', () => {
    const content = {
      resume: {
        skills: [
          { category: 'Languages', items: ['JavaScript', 'TypeScript', 'Python'] },
          { category: 'Frameworks', items: ['React', 'Vue.js', 'Express'] },
        ],
        experience: [],
      },
      coverLetter: {
        paragraphs: [],
      },
    };
    const result = generatedContentSchema.safeParse(content);
    expect(result.success).toBe(true);
  });

  it('should accept volunteering section', () => {
    const content = {
      resume: {
        skills: [],
        experience: [],
        volunteering: [
          {
            organization: 'Tech Nonprofit',
            title: 'Volunteer Developer',
            startDate: '2022-01-01T00:00:00Z',
            endDate: '2023-01-01T00:00:00Z',
            location: 'Remote',
            bullets: [
              'Built web application for community outreach',
              'Mentored underserved youth in coding',
            ],
          },
        ],
      },
      coverLetter: {
        paragraphs: [],
      },
    };
    const result = generatedContentSchema.safeParse(content);
    expect(result.success).toBe(true);
  });

  it('should accept education with bullets', () => {
    const content = {
      resume: {
        skills: [],
        experience: [],
        education: [
          {
            institution: 'University',
            degree: 'BS Computer Science',
            field: 'Computer Science',
            startDate: '2014-09-01T00:00:00Z',
            endDate: '2018-05-15T00:00:00Z',
            gpa: '3.8',
            bullets: [
              'Dean\'s List: Fall 2014 - Spring 2018',
              'CS Club President',
            ],
          },
        ],
      },
      coverLetter: {
        paragraphs: [],
      },
    };
    const result = generatedContentSchema.safeParse(content);
    expect(result.success).toBe(true);
  });
});
