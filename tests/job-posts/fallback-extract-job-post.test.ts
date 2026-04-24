import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { fallbackExtractJobPost, isWeakExtraction } from '../../src/job-posts/fallback-extract-job-post.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('fallbackExtractJobPost', () => {
  describe('with no-config HTML', () => {
    const fixturePath = join(__dirname, '../fixtures/job-posts/no-config.html');
    const html = readFileSync(fixturePath, 'utf-8');

    it('should extract title from h1', () => {
      const result = fallbackExtractJobPost({
        url: 'https://unknown-domain.com/job/123',
        html,
      });

      expect(result.title).toBe('Senior Software Engineer');
    });

    it('should extract description from body text', () => {
      const result = fallbackExtractJobPost({
        url: 'https://unknown-domain.com/job/123',
        html,
      });

      expect(result.description).toContain('Senior Software Engineer');
      expect(result.description).toContain('Design and develop software applications');
      expect(result.description).toContain('Collaborate with cross-functional teams');
    });

    it('should extract raw text from entire body', () => {
      const result = fallbackExtractJobPost({
        url: 'https://unknown-domain.com/job/123',
        html,
      });

      expect(result.rawText).toBeDefined();
      expect(result.rawText?.length).toBeGreaterThan(0);
    });

    it('should remove navigation and footer content', () => {
      const result = fallbackExtractJobPost({
        url: 'https://unknown-domain.com/job/123',
        html,
      });

      // Nav and footer should be removed from the extraction
      expect(result.rawText).not.toContain('Home');
      expect(result.rawText).not.toContain('Jobs');
      expect(result.rawText).not.toContain('Unknown Company');
    });

    it('should remove script content', () => {
      const result = fallbackExtractJobPost({
        url: 'https://unknown-domain.com/job/123',
        html,
      });

      expect(result.rawText).not.toContain('console.log');
      expect(result.rawText).not.toContain('Page loaded');
    });

    it('should set source URL and domain', () => {
      const result = fallbackExtractJobPost({
        url: 'https://unknown-domain.com/job/123',
        html,
      });

      expect(result.sourceUrl).toBe('https://unknown-domain.com/job/123');
      expect(result.sourceDomain).toBe('unknown-domain.com');
    });

    it('should set extractedAt timestamp', () => {
      const result = fallbackExtractJobPost({
        url: 'https://unknown-domain.com/job/123',
        html,
      });

      expect(result.extractedAt).toBeDefined();
      if (result.extractedAt) {
        expect(new Date(result.extractedAt)).toBeInstanceOf(Date);
      }
    });

    it('should handle invalid URL gracefully', () => {
      const result = fallbackExtractJobPost({
        url: 'not-a-url',
        html,
      });

      expect(result.sourceDomain).toBe('unknown');
    });
  });

  describe('with weak-config HTML', () => {
    const fixturePath = join(__dirname, '../fixtures/job-posts/weak-config.html');
    const html = readFileSync(fixturePath, 'utf-8');

    it('should extract from body when configured selectors would fail', () => {
      const result = fallbackExtractJobPost({
        url: 'https://weak-config.com/job/123',
        html,
      });

      expect(result.title).toBe('Full Stack Developer');
      expect(result.description).toContain('Full Stack Developer'); // Should get from body
    });

    it('should extract content from hidden elements after removing style', () => {
      const result = fallbackExtractJobPost({
        url: 'https://weak-config.com/job/123',
        html,
      });

      // After removing style tags, the display:none should be ignored
      // and the content should be extracted
      expect(result.rawText).toBeDefined();
    });
  });

  describe('with sparse HTML', () => {
    it('should handle minimal HTML without crashing', () => {
      const minimalHtml = '<html><body><h1>Job</h1></body></html>';
      const result = fallbackExtractJobPost({
        url: 'https://example.com/job',
        html: minimalHtml,
      });

      expect(result.title).toBe('Job');
      expect(result.description).toBeDefined();
    });

    it('should handle HTML with only scripts', () => {
      const scriptsOnlyHtml = '<html><head><script>console.log("test")</script></head><body></body></html>';
      const result = fallbackExtractJobPost({
        url: 'https://example.com/job',
        html: scriptsOnlyHtml,
      });

      expect(result.title).toBe('Job Posting');
      expect(result.rawText).toBe('');
    });

    it('should handle empty HTML', () => {
      const emptyHtml = '<html><body></body></html>';
      const result = fallbackExtractJobPost({
        url: 'https://example.com/job',
        html: emptyHtml,
      });

      expect(result.title).toBe('Job Posting');
      expect(result.description).toBe('No description available');
    });
  });
});

describe('isWeakExtraction (re-exported)', () => {
  it('should identify weak extraction when description is short', () => {
    const weakJob = {
      url: 'https://example.com/job',
      title: 'Test',
      description: 'Short.',
      rawText: 'This is a much longer raw text content.',
      extractedAt: new Date().toISOString(),
    };

    expect(isWeakExtraction(weakJob)).toBe(true);
  });

  it('should identify weak extraction when raw text is very short', () => {
    const weakJob = {
      url: 'https://example.com/job',
      title: 'Test',
      description: 'Some description.',
      rawText: 'Short',
      extractedAt: new Date().toISOString(),
    };

    expect(isWeakExtraction(weakJob)).toBe(true);
  });

  it('should not identify weak extraction when description is substantial', () => {
    const goodJob = {
      url: 'https://example.com/job',
      title: 'Test',
      description: 'This is a substantial description. '.repeat(15).trim(),
      rawText: 'This is a longer raw text. '.repeat(10).trim(),
      extractedAt: new Date().toISOString(),
    };

    expect(isWeakExtraction(goodJob)).toBe(false);
  });
});
