import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchPage, validateUrl, FetchError, InvalidUrlError } from '../../src/job-posts/fetch-page.js';

// Mock global fetch
global.fetch = vi.fn();

describe('fetchPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should fetch valid HTML page', async () => {
    const html = '<html><body>Test content</body></html>';
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'content-type': 'text/html; charset=utf-8' }),
      text: async () => html,
    } as Response);

    const result = await fetchPage('https://example.com/job');
    expect(result).toBe(html);
  });

  it('should handle application/xhtml+xml content type', async () => {
    const html = '<html><body>Test content</body></html>';
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'content-type': 'application/xhtml+xml' }),
      text: async () => html,
    } as Response);

    const result = await fetchPage('https://example.com/job');
    expect(result).toBe(html);
  });

  it('should allow missing content type with non-empty response', async () => {
    const html = '<html><body>Test content</body></html>';
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
      text: async () => html,
    } as Response);

    const result = await fetchPage('https://example.com/job');
    expect(result).toBe(html);
  });

  it('should throw for 404 response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: new Headers(),
      text: async () => 'Not found',
    } as Response);

    const promise = fetchPage('https://example.com/job');
    await expect(promise).rejects.toThrow(FetchError);
    await expect(promise).rejects.toThrow('Failed to fetch page');
    await expect(promise).rejects.toThrow('HTTP 404');
  });

  it('should throw for 500 response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      headers: new Headers(),
      text: async () => 'Error',
    } as Response);

    const promise = fetchPage('https://example.com/job');
    await expect(promise).rejects.toThrow(FetchError);
    await expect(promise).rejects.toThrow('Failed to fetch page');
    await expect(promise).rejects.toThrow('HTTP 500');
  });

  it('should throw for empty response body', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'content-type': 'text/html' }),
      text: async () => '   ',
    } as Response);

    await expect(fetchPage('https://example.com/job')).rejects.toThrow('empty');
  });

  it('should throw for non-HTML content type', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'content-type': 'application/json' }),
      text: async () => '{}',
    } as Response);

    await expect(fetchPage('https://example.com/job')).rejects.toThrow('content type');
  });

  it('should throw for invalid URL', async () => {
    await expect(fetchPage('not-a-url')).rejects.toThrow(InvalidUrlError);
    await expect(fetchPage('not-a-url')).rejects.toThrow('Invalid URL');
  });

  it('should throw for unsupported protocol', async () => {
    await expect(fetchPage('ftp://example.com')).rejects.toThrow(InvalidUrlError);
    await expect(fetchPage('ftp://example.com')).rejects.toThrow('Unsupported protocol');
  });

  it('should throw for file:// protocol', async () => {
    await expect(fetchPage('file:///etc/passwd')).rejects.toThrow(InvalidUrlError);
    await expect(fetchPage('file:///etc/passwd')).rejects.toThrow('Unsupported protocol');
  });

  it('should handle http:// protocol', async () => {
    const html = '<html><body>Test content</body></html>';
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'content-type': 'text/html' }),
      text: async () => html,
    } as Response);

    const result = await fetchPage('http://example.com/job');
    expect(result).toBe(html);
  });
});

describe('validateUrl', () => {
  it('should accept valid HTTPS URLs', () => {
    const url = validateUrl('https://example.com/path');
    expect(url.protocol).toBe('https:');
    expect(url.href).toBe('https://example.com/path');
  });

  it('should accept valid HTTP URLs', () => {
    const url = validateUrl('http://example.com/path');
    expect(url.protocol).toBe('http:');
  });

  it('should accept URLs with query parameters', () => {
    const url = validateUrl('https://example.com/path?query=value&other=123');
    expect(url.href).toBe('https://example.com/path?query=value&other=123');
  });

  it('should accept URLs with fragments', () => {
    const url = validateUrl('https://example.com/path#section');
    expect(url.href).toBe('https://example.com/path#section');
  });

  it('should throw for invalid URL format', () => {
    expect(() => validateUrl('not-a-url')).toThrow(InvalidUrlError);
  });

  it('should throw for unsupported protocol - ftp', () => {
    expect(() => validateUrl('ftp://example.com')).toThrow(InvalidUrlError);
    expect(() => validateUrl('ftp://example.com')).toThrow('Unsupported protocol');
  });

  it('should throw for file:// protocol', () => {
    expect(() => validateUrl('file:///etc/passwd')).toThrow(InvalidUrlError);
    expect(() => validateUrl('file:///etc/passwd')).toThrow('Unsupported protocol');
  });

  it('should throw for javascript: protocol', () => {
    expect(() => validateUrl('javascript:alert(1)')).toThrow(InvalidUrlError);
  });

  it('should throw for data: protocol', () => {
    expect(() => validateUrl('data:text/html,<html></html>')).toThrow(InvalidUrlError);
  });
});
