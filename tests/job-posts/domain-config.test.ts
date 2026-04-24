import { describe, it, expect } from 'vitest';
import { findJobSiteConfigForUrl } from '../../src/job-posts/domain-config.js';
import type { JobSiteConfig } from '../../src/config/load-job-sites-config.js';

describe('findJobSiteConfigForUrl', () => {
  const mockConfig: JobSiteConfig = {
    jobSites: {
      'example.com': {
        name: 'Example',
        urlPattern: 'https://example.com/*',
        selectors: {
          title: 'h1',
          description: '.description',
        },
      },
      'jobs.example.com': {
        name: 'Example Jobs',
        urlPattern: 'https://jobs.example.com/*',
        selectors: {
          title: 'h1',
          description: '.description',
        },
      },
      'company.careers': {
        name: 'Company Careers',
        urlPattern: 'https://company.careers/*',
        selectors: {
          title: 'h1',
          description: '.description',
        },
      },
    },
  };

  it('should match exact domain', () => {
    const result = findJobSiteConfigForUrl(
      'https://example.com/job/123',
      mockConfig
    );

    expect(result).toBeDefined();
    expect(result?.matchedDomain).toBe('example.com');
    expect(result?.siteConfig.name).toBe('Example');
  });

  it('should prefer subdomain over parent domain', () => {
    const result = findJobSiteConfigForUrl(
      'https://jobs.example.com/job/123',
      mockConfig
    );

    expect(result).toBeDefined();
    expect(result?.matchedDomain).toBe('jobs.example.com');
    expect(result?.siteConfig.name).toBe('Example Jobs');
  });

  it('should fall back to parent domain when subdomain not in config', () => {
    const result = findJobSiteConfigForUrl(
      'https://subdomain.example.com/job/123',
      mockConfig
    );

    expect(result).toBeDefined();
    expect(result?.matchedDomain).toBe('example.com');
    expect(result?.siteConfig.name).toBe('Example');
  });

  it('should match careers subdomain', () => {
    const result = findJobSiteConfigForUrl(
      'https://company.careers/job/123',
      mockConfig
    );

    expect(result).toBeDefined();
    expect(result?.matchedDomain).toBe('company.careers');
    expect(result?.siteConfig.name).toBe('Company Careers');
  });

  it('should return undefined when no match found', () => {
    const result = findJobSiteConfigForUrl(
      'https://unknown-domain.com/job/123',
      mockConfig
    );

    expect(result).toBeUndefined();
  });

  it('should handle URLs with paths and query parameters', () => {
    const result = findJobSiteConfigForUrl(
      'https://example.com/jobs/software-engineer?location=nyc',
      mockConfig
    );

    expect(result).toBeDefined();
    expect(result?.matchedDomain).toBe('example.com');
  });

  it('should handle URLs with fragments', () => {
    const result = findJobSiteConfigForUrl(
      'https://example.com/job/123#details',
      mockConfig
    );

    expect(result).toBeDefined();
    expect(result?.matchedDomain).toBe('example.com');
  });

  it('should throw for invalid URL', () => {
    expect(() =>
      findJobSiteConfigForUrl('not-a-url', mockConfig)
    ).toThrow('Invalid URL');
  });

  it('should handle http protocol', () => {
    const result = findJobSiteConfigForUrl(
      'http://example.com/job/123',
      mockConfig
    );

    expect(result).toBeDefined();
    expect(result?.matchedDomain).toBe('example.com');
  });

  it('should handle multi-level subdomains correctly', () => {
    const result = findJobSiteConfigForUrl(
      'https://www.jobs.example.com/job/123',
      mockConfig
    );

    // Should match jobs.example.com first, then fall back to example.com
    // Since www.jobs.example.com is not in config, it falls back
    expect(result).toBeDefined();
    expect(result?.matchedDomain).toBe('jobs.example.com');
    expect(result?.siteConfig.name).toBe('Example Jobs');
  });

  it('should handle TLD-only domains', () => {
    const result = findJobSiteConfigForUrl(
      'https://com/job/123',
      mockConfig
    );

    expect(result).toBeUndefined();
  });
});
