import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { parseJobPost, isWeakExtraction } from '../../src/job-posts/parse-job-post.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('parseJobPost', () => {
  const fixturePath = join(__dirname, '../fixtures/job-posts/example.html');
  const html = readFileSync(fixturePath, 'utf-8');

  const mockSiteConfig = {
    name: 'NextStep Systems',
    urlPattern: 'https://www.nextstepsystems.com/*',
    selectors: {
      title: 'h1',
      description: '.job-description',
      company: '.company-name',
      location: '.location',
      salary: '.salary',
      requirements: '.requirements',
    },
  };

  it('should parse job with site config', () => {
    const result = parseJobPost({
      url: 'https://www.nextstepsystems.com/job/test',
      html,
      matchedDomain: 'nextstepsystems.com',
      siteConfig: mockSiteConfig,
    });

    expect(result.title).toBe('Mid-Senior PHP Full Stack Developer');
    expect(result.company).toBe('NextStep Systems');
    expect(result.location).toBe('On-site');
    expect(result.description).toContain('We are seeking a talented');
    expect(result.sourceDomain).toBe('nextstepsystems.com');
    expect(result.sourceUrl).toBe('https://www.nextstepsystems.com/job/test');
    expect(result.extractedAt).toBeDefined();
  });

  it('should parse job without site config', () => {
    const result = parseJobPost({
      url: 'https://example.com/job/test',
      html,
    });

    expect(result.title).toBeDefined();
    expect(result.sourceDomain).toBe('example.com');
  });

  it('should extract description from configured selector', () => {
    const result = parseJobPost({
      url: 'https://www.nextstepsystems.com/job/test',
      html,
      siteConfig: mockSiteConfig,
    });

    expect(result.description).toBeTruthy();
    expect(result.description).toContain('PHP Full Stack Developer');
  });

  it('should extract raw text from body', () => {
    const result = parseJobPost({
      url: 'https://www.nextstepsystems.com/job/test',
      html,
    });

    expect(result.rawText).toBeDefined();
    expect(result.rawText).toContain('Mid-Senior PHP Full Stack Developer');
    expect(result.rawText).not.toContain('tracking'); // Script content should be removed
  });

  it('should handle selector arrays', () => {
    const configWithArray = {
      ...mockSiteConfig,
      selectors: {
        ...mockSiteConfig.selectors,
        title: ['h1', 'h2', '.title'],
        company: ['.company-name', '[itemprop="hiringOrganization"]'],
      },
    };

    const result = parseJobPost({
      url: 'https://www.nextstepsystems.com/job/test',
      html,
      siteConfig: configWithArray,
    });

    expect(result.title).toBe('Mid-Senior PHP Full Stack Developer');
    expect(result.company).toBe('NextStep Systems');
  });

  it('should set default values for missing fields', () => {
    const minimalHtml = '<html><body><h1>Test Job</h1><p>Description here</p></body></html>';
    const result = parseJobPost({
      url: 'https://example.com/job/test',
      html: minimalHtml,
    });

    expect(result.title).toBe('Test Job');
    expect(result.description).toContain('Description here');
    expect(result.company).toBeUndefined();
    expect(result.location).toBeUndefined();
  });

  it('should always set required fields', () => {
    const result = parseJobPost({
      url: 'https://www.nextstepsystems.com/job/test',
      html,
    });

    expect(result.url).toBeDefined();
    expect(result.sourceUrl).toBeDefined();
    expect(result.sourceDomain).toBeDefined();
    expect(result.description).toBeDefined();
    expect(result.extractedAt).toBeDefined();
  });

  it('should remove script content from rawText', () => {
    const result = parseJobPost({
      url: 'https://www.nextstepsystems.com/job/test',
      html,
    });

    expect(result.rawText).not.toContain('tracking');
  });

  it('should remove style content from rawText', () => {
    const result = parseJobPost({
      url: 'https://www.nextstepsystems.com/job/test',
      html,
    });

    expect(result.rawText).not.toContain('font-family');
  });

  it('should remove noscript content from rawText', () => {
    const result = parseJobPost({
      url: 'https://www.nextstepsystems.com/job/test',
      html,
    });

    expect(result.rawText).not.toContain('JavaScript is required');
  });

  it('should handle invalid URL gracefully', () => {
    const result = parseJobPost({
      url: 'not-a-url',
      html,
    });

    expect(result.sourceDomain).toBe('unknown');
  });
});

describe('isWeakExtraction', () => {
  it('should identify weak extraction when description is short', () => {
    const weakJob = {
      url: 'https://example.com/job',
      title: 'Test',
      description: 'Short description.',
      rawText: 'This is a much longer raw text content that should trigger weak extraction detection.',
      extractedAt: new Date().toISOString(),
    };

    expect(isWeakExtraction(weakJob)).toBe(true);
  });

  it('should identify weak extraction when raw text is very short', () => {
    const weakJob = {
      url: 'https://example.com/job',
      title: 'Test',
      description: 'Short description.',
      rawText: 'Short',
      extractedAt: new Date().toISOString(),
    };

    expect(isWeakExtraction(weakJob)).toBe(true);
  });

  it('should not identify weak extraction when description is substantial', () => {
    const goodJob = {
      url: 'https://example.com/job',
      title: 'Test',
      description: 'This is a substantial description that is long enough to be considered good extraction. '.repeat(15).trim(),
      rawText: 'This is a much longer raw text content that should demonstrate good extraction with sufficient length. '.repeat(5).trim(),
      extractedAt: new Date().toISOString(),
    };

    expect(isWeakExtraction(goodJob)).toBe(false);
  });

  it('should handle missing raw text', () => {
    const job = {
      url: 'https://example.com/job',
      title: 'Test',
      description: 'Short description.',
      extractedAt: new Date().toISOString(),
    };

    expect(isWeakExtraction(job)).toBe(false);
  });
});
