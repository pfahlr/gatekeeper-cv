import * as cheerio from 'cheerio';
import type { ExtractedJob } from '../schemas/extracted-job.schema.js';
import { normalizeWhitespace } from './extract-text.js';

interface FallbackExtractParams {
  url: string;
  html: string;
}

export function fallbackExtractJobPost(params: FallbackExtractParams): ExtractedJob {
  const { url, html } = params;

  // Get source domain from URL
  let sourceDomain = 'unknown';
  try {
    const urlObj = new URL(url);
    sourceDomain = urlObj.hostname;
  } catch {
    // Keep 'unknown' as default
  }

  // Parse HTML with Cheerio
  const $ = cheerio.load(html);

  // Remove unwanted elements (more aggressive than regular extraction)
  $('script').remove();
  $('style').remove();
  $('noscript').remove();
  $('nav').remove();
  $('footer').remove();
  $('header').remove();
  $('aside').remove();
  $('iframe').remove();
  $('svg').remove();

  // Extract title - try multiple fallbacks
  let title = '';
  const h1Text = $('h1').first().text();
  if (h1Text.trim()) {
    title = normalizeWhitespace(h1Text);
  } else {
    const titleText = $('title').text();
    title = normalizeWhitespace(titleText).replace(/^[|-]\s*/, '').split('|')[0].split('-')[0].trim();
  }

  // Extract body text as raw text
  const rawText = normalizeWhitespace($('body').text());

  // Try to find a main content area for description
  let description = rawText;

  // Try common selectors for main content
  const contentSelectors = [
    '[role="main"]',
    'main',
    'article',
    '.job-description',
    '.description',
    '.job-details',
    '#job-description',
    '#description',
    '.content',
    '.post-content',
  ];

  for (const selector of contentSelectors) {
    const element = $(selector).first();
    if (element.length > 0) {
      const text = normalizeWhitespace(element.text());
      if (text.length > rawText.length * 0.3) { // At least 30% of raw text
        description = text;
        break;
      }
    }
  }

  // Build the extracted job object
  const job: ExtractedJob = {
    url,
    sourceUrl: url,
    sourceDomain,
    title: title || 'Job Posting',
    description: description || rawText || 'No description available',
    rawText,
    extractedAt: new Date().toISOString(),
  };

  return job;
}

export function isWeakExtraction(job: ExtractedJob): boolean {
  const descLength = job.description.trim().length;
  const rawLength = (job.rawText || '').trim().length;

  // Weak if description is short but raw text is longer
  const weakByLength = descLength < 500 && rawLength > descLength;

  // Weak if raw text is very short
  const weakByShortRaw = rawLength < 200 && rawLength > 0;

  return weakByLength || weakByShortRaw;
}
