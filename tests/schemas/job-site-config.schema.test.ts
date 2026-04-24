import { describe, it, expect } from 'vitest';
import { jobSiteConfigSchema } from '../../src/schemas/job-site-config.schema.js';

describe('job-site-config schema', () => {
  const validConfig = {
    jobSites: {
      example: {
        name: 'Example Job Board',
        urlPattern: 'https://example.com/jobs/*',
        selectors: {
          title: 'h1.job-title',
          description: '.job-description',
          company: '.company-name',
          location: '.job-location',
        },
      },
    },
  };

  it('should accept valid job site config', () => {
    const result = jobSiteConfigSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
  });

  it('should accept config with optional fields', () => {
    const configWithOptionals = {
      jobSites: {
        example: {
          name: 'Example Job Board',
          urlPattern: 'https://example.com/jobs/*',
          selectors: {
            title: 'h1.job-title',
            description: '.job-description',
            salary: '.salary',
            requirements: '.requirements',
          },
        },
      },
    };
    const result = jobSiteConfigSchema.safeParse(configWithOptionals);
    expect(result.success).toBe(true);
  });

  it('should fail on invalid job site name', () => {
    const invalidConfig = {
      jobSites: {
        'invalid-name': {
          name: 'Example',
          urlPattern: 'https://example.com/jobs/*',
          selectors: {
            title: 'h1',
            description: '.desc',
          },
        },
      },
    };
    const result = jobSiteConfigSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });

  it('should require title and description selectors', () => {
    const invalidConfig = {
      jobSites: {
        example: {
          name: 'Example',
          urlPattern: 'https://example.com/jobs/*',
          selectors: {
            company: '.company',
          },
        },
      },
    };
    const result = jobSiteConfigSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });
});
