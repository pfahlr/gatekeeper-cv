import { describe, it, expect } from 'vitest';
import * as cheerio from 'cheerio';
import {
  normalizeWhitespace,
  extractFirstText,
  extractListText,
} from '../../src/job-posts/extract-text.js';

describe('normalizeWhitespace', () => {
  it('should collapse multiple spaces', () => {
    expect(normalizeWhitespace('hello    world')).toBe('hello world');
  });

  it('should collapse tabs', () => {
    expect(normalizeWhitespace('hello\t\tworld')).toBe('hello world');
  });

  it('should collapse newlines', () => {
    expect(normalizeWhitespace('hello\n\nworld')).toBe('hello world');
  });

  it('should trim whitespace', () => {
    expect(normalizeWhitespace('  hello world  ')).toBe('hello world');
  });

  it('should handle mixed whitespace', () => {
    expect(normalizeWhitespace('  hello \t\n world  ')).toBe('hello world');
  });

  it('should handle empty string', () => {
    expect(normalizeWhitespace('')).toBe('');
  });

  it('should handle whitespace only', () => {
    expect(normalizeWhitespace('   \t\n  ')).toBe('');
  });
});

describe('extractFirstText', () => {
  it('should extract text from single selector', () => {
    const html = '<div class="test">Hello World</div>';
    const $ = cheerio.load(html);
    const result = extractFirstText($, '.test');
    expect(result).toBe('Hello World');
  });

  it('should extract text from first matching selector in array', () => {
    const html = '<div class="a">Text A</div><div class="b">Text B</div>';
    const $ = cheerio.load(html);
    const result = extractFirstText($, ['.c', '.a', '.b']);
    expect(result).toBe('Text A');
  });

  it('should return undefined when no selector matches', () => {
    const html = '<div class="test">Hello</div>';
    const $ = cheerio.load(html);
    const result = extractFirstText($, '.nonexistent');
    expect(result).toBeUndefined();
  });

  it('should return undefined when all selectors in array fail', () => {
    const html = '<div class="test">Hello</div>';
    const $ = cheerio.load(html);
    const result = extractFirstText($, ['.a', '.b', '.c']);
    expect(result).toBeUndefined();
  });

  it('should skip empty extractions in selector array', () => {
    const html = '<div class="empty">   </div><div class="content">Real Content</div>';
    const $ = cheerio.load(html);
    const result = extractFirstText($, ['.empty', '.content']);
    expect(result).toBe('Real Content');
  });
});

describe('extractListText', () => {
  it('should extract text from multiple elements', () => {
    const html = '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>';
    const $ = cheerio.load(html);
    const result = extractListText($, 'li');
    expect(result).toEqual(['Item 1', 'Item 2', 'Item 3']);
  });

  it('should extract from first matching selector in array', () => {
    const html = '<div class="a"><span>A1</span><span>A2</span></div><div class="b"><span>B1</span></div>';
    const $ = cheerio.load(html);
    const result = extractListText($, ['.c', '.a span']);
    expect(result).toEqual(['A1', 'A2']);
  });

  it('should return empty array when no selector matches', () => {
    const html = '<div class="test">Hello</div>';
    const $ = cheerio.load(html);
    const result = extractListText($, '.nonexistent');
    expect(result).toEqual([]);
  });

  it('should normalize whitespace for each item', () => {
    const html = '<ul><li>Item  One</li><li>Item   Two</li></ul>';
    const $ = cheerio.load(html);
    const result = extractListText($, 'li');
    expect(result).toEqual(['Item One', 'Item Two']);
  });

  it('should skip empty items', () => {
    const html = '<ul><li>Item 1</li><li>   </li><li>Item 3</li></ul>';
    const $ = cheerio.load(html);
    const result = extractListText($, 'li');
    expect(result).toEqual(['Item 1', 'Item 3']);
  });
});
