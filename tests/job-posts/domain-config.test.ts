import { describe, it, expect } from 'vitest';
import { findJobSiteConfigForUrl, getUrlForFetching } from '../../src/job-posts/domain-config.js';
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
      'nextstepsystems.com': {
        name: 'NextStep Systems',
        urlPattern: 'https://www.nextstepsystems.com/*',
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

  describe('web archive URLs', () => {
    it('should extract domain from web archive URL', () => {
      const webArchiveUrl = 'https://web.archive.org/web/20260424184451/https://www.nextstepsystems.com/job/mid-senior-php-full-stack-developer-100-onsite/';
      const result = findJobSiteConfigForUrl(webArchiveUrl, mockConfig);

      expect(result).toBeDefined();
      expect(result?.matchedDomain).toBe('nextstepsystems.com');
      expect(result?.siteConfig.name).toBe('NextStep Systems');
    });

    it('should extract domain with subdomain from web archive URL', () => {
      const webArchiveUrl = 'https://web.archive.org/web/20260424184451/https://jobs.example.com/job/123';
      const result = findJobSiteConfigForUrl(webArchiveUrl, mockConfig);

      expect(result).toBeDefined();
      expect(result?.matchedDomain).toBe('jobs.example.com');
      expect(result?.siteConfig.name).toBe('Example Jobs');
    });

    it('should fall back to parent domain from web archive URL', () => {
      const webArchiveUrl = 'https://web.archive.org/web/20260424184451/https://subdomain.example.com/job/123';
      const result = findJobSiteConfigForUrl(webArchiveUrl, mockConfig);

      expect(result).toBeDefined();
      expect(result?.matchedDomain).toBe('example.com');
    });

    it('should handle web archive URL with query parameters', () => {
      const webArchiveUrl = 'https://web.archive.org/web/20260424184451/https://www.nextstepsystems.com/job/php-dev?utm_source=ziprecruiter';
      const result = findJobSiteConfigForUrl(webArchiveUrl, mockConfig);

      expect(result).toBeDefined();
      expect(result?.matchedDomain).toBe('nextstepsystems.com');
    });

    it('should return undefined for unknown domain in web archive URL', () => {
      const webArchiveUrl = 'https://web.archive.org/web/20260424184451/https://unknown-domain.com/job/123';
      const result = findJobSiteConfigForUrl(webArchiveUrl, mockConfig);

      expect(result).toBeUndefined();
    });
  });
});

describe('getUrlForFetching', () => {
  it('should return web archive URL as-is for fetching', () => {
    const webArchiveUrl = 'https://web.archive.org/web/20260424184451/https://www.nextstepsystems.com/job/php-dev';
    const result = getUrlForFetching(webArchiveUrl);

    expect(result).toBe(webArchiveUrl);
  });

  it('should return regular URL as-is for fetching', () => {
    const regularUrl = 'https://www.nextstepsystems.com/job/php-dev';
    const result = getUrlForFetching(regularUrl);

    expect(result).toBe(regularUrl);
  });
});

describe('findJobSiteConfigForUrl - new job sites', () => {
  const jobSitesConfig: JobSiteConfig = {
    jobSites: {
      'linkedin.com': {
        name: 'LinkedIn',
        urlPattern: 'https://www.linkedin.com/jobs/view/*',
        selectors: {
          title: 'h1',
          description: '.job-description',
        },
      },
      'dice.com': {
        name: 'Dice',
        urlPattern: 'https://www.dice.com/*',
        selectors: {
          title: 'h1',
          description: '.job-description',
        },
      },
      'indeed.com': {
        name: 'Indeed',
        urlPattern: 'https://www.indeed.com/*',
        selectors: {
          title: 'h1',
          description: '.job-description',
        },
      },
      'ziprecruiter.com': {
        name: 'ZipRecruiter',
        urlPattern: 'https://www.ziprecruiter.com/*',
        selectors: {
          title: 'h1',
          description: '.job-description',
        },
      },
      'careerbuilder.com': {
        name: 'CareerBuilder',
        urlPattern: 'https://www.careerbuilder.com/*',
        selectors: {
          title: 'h1',
          description: '.job-description',
        },
      },
    },
  };

  describe('linkedin.com', () => {
    it('should match LinkedIn jobs URL', () => {
      const result = findJobSiteConfigForUrl(
        'https://www.linkedin.com/jobs/view/4398765018',
        jobSitesConfig
      );

      expect(result).toBeDefined();
      expect(result?.matchedDomain).toBe('linkedin.com');
      expect(result?.siteConfig.name).toBe('LinkedIn');
    });

    it('should match LinkedIn web archive URL', () => {
      const result = findJobSiteConfigForUrl(
        'https://web.archive.org/web/20250101000000/https://www.linkedin.com/jobs/view/4398765018/',
        jobSitesConfig
      );

      expect(result).toBeDefined();
      expect(result?.matchedDomain).toBe('linkedin.com');
    });
  });

  describe('dice.com', () => {
    it('should match Dice job URL', () => {
      const result = findJobSiteConfigForUrl(
        'https://www.dice.com/job/detail/senior-developer-123456',
        jobSitesConfig
      );

      expect(result).toBeDefined();
      expect(result?.matchedDomain).toBe('dice.com');
      expect(result?.siteConfig.name).toBe('Dice');
    });

    it('should match Dice web archive URL', () => {
      const result = findJobSiteConfigForUrl(
        'https://web.archive.org/web/20250101000000/https://www.dice.com/job/detail/123',
        jobSitesConfig
      );

      expect(result).toBeDefined();
      expect(result?.matchedDomain).toBe('dice.com');
    });
  });

  describe('indeed.com', () => {
    it('should match Indeed job URL', () => {
      const result = findJobSiteConfigForUrl(
        'https://www.indeed.com/viewjob?jk=1234567890abcdef',
        jobSitesConfig
      );

      expect(result).toBeDefined();
      expect(result?.matchedDomain).toBe('indeed.com');
      expect(result?.siteConfig.name).toBe('Indeed');
    });

    it('should match Indeed web archive URL', () => {
      const result = findJobSiteConfigForUrl(
        'https://web.archive.org/web/20250101000000/https://www.indeed.com/viewjob?jk=123',
        jobSitesConfig
      );

      expect(result).toBeDefined();
      expect(result?.matchedDomain).toBe('indeed.com');
    });

    it('should match Indeed company pages URL', () => {
      const result = findJobSiteConfigForUrl(
        'https://www.indeed.com/cmp/Test-Company/jobs/Senior-Developer',
        jobSitesConfig
      );

      expect(result).toBeDefined();
      expect(result?.matchedDomain).toBe('indeed.com');
    });
  });

  describe('ziprecruiter.com', () => {
    it('should match ZipRecruiter job URL', () => {
      const result = findJobSiteConfigForUrl(
        'https://www.ziprecruiter.com/jobs/senior-developer-123456',
        jobSitesConfig
      );

      expect(result).toBeDefined();
      expect(result?.matchedDomain).toBe('ziprecruiter.com');
      expect(result?.siteConfig.name).toBe('ZipRecruiter');
    });

    it('should match ZipRecruiter web archive URL', () => {
      const result = findJobSiteConfigForUrl(
        'https://web.archive.org/web/20250101000000/https://www.ziprecruiter.com/jobs/123',
        jobSitesConfig
      );

      expect(result).toBeDefined();
      expect(result?.matchedDomain).toBe('ziprecruiter.com');
    });
  });

  describe('careerbuilder.com', () => {
    it('should match CareerBuilder job URL', () => {
      const result = findJobSiteConfigForUrl(
        'https://www.careerbuilder.com/job/jkl1234567890abcdef',
        jobSitesConfig
      );

      expect(result).toBeDefined();
      expect(result?.matchedDomain).toBe('careerbuilder.com');
      expect(result?.siteConfig.name).toBe('CareerBuilder');
    });

    it('should match CareerBuilder web archive URL', () => {
      const result = findJobSiteConfigForUrl(
        'https://web.archive.org/web/20250101000000/https://www.careerbuilder.com/job/123',
        jobSitesConfig
      );

      expect(result).toBeDefined();
      expect(result?.matchedDomain).toBe('careerbuilder.com');
    });
  });
});
