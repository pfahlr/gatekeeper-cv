import * as cheerio from 'cheerio';
import type { JobSite } from '../config/load-job-sites-config.js';
import type { ExtractedJob } from '../schemas/extracted-job.schema.js';
import { extractFirstText, extractListText, normalizeWhitespace } from './extract-text.js';

interface ParseJobPostParams {
  url: string;
  html: string;
  matchedDomain?: string;
  siteConfig?: JobSite;
}

export function parseJobPost(params: ParseJobPostParams): ExtractedJob {
  const { url, html, matchedDomain, siteConfig } = params;

  // Parse HTML with Cheerio
  const $ = cheerio.load(html);

  // Remove unwanted elements
  $('script').remove();
  $('style').remove();
  $('noscript').remove();

  // Get source domain from URL if not provided
  let sourceDomain = matchedDomain;
  if (!sourceDomain) {
    try {
      const urlObj = new URL(url);
      sourceDomain = urlObj.hostname;
    } catch {
      sourceDomain = 'unknown';
    }
  }

  // Extract fields using site config if available
  const selectors = siteConfig?.selectors;

  // Extract title
  let title = selectors?.title
    ? extractFirstText($, selectors.title)
    : undefined;
  if (!title) {
    // Fallback to h1 or title tag
    title = extractFirstText($, 'h1');
    if (!title) {
      title = extractFirstText($, 'title');
    }
  }

  // Extract company
  const company = selectors?.company
    ? extractFirstText($, selectors.company)
    : undefined;

  // Extract location
  const location = selectors?.location
    ? extractFirstText($, selectors.location)
    : undefined;

  // Extract salary/compensation
  const compensation = selectors?.salary
    ? extractFirstText($, selectors.salary)
    : undefined;

  // Extract requirements
  const requirements = selectors?.requirements
    ? extractFirstText($, selectors.requirements)
    : undefined;

  // Extract description - try multiple common selectors if not configured
  let description: string | undefined;
  if (selectors?.description) {
    description = extractFirstText($, selectors.description);
  }

  // Fallback description extraction
  if (!description) {
    const commonDescSelectors = [
      '[itemprop="description"]',
      '.job-description',
      '.description',
      '.job_details',
      '#job-description',
      '#description',
      'article',
    ];
    description = extractFirstText($, commonDescSelectors);
  }

  // Extract raw text from body
  const rawText = normalizeWhitespace($('body').text());

  // Build the extracted job object
  const job: ExtractedJob = {
    url,
    sourceUrl: url,
    sourceDomain,
    title: title || 'Unknown',
    description: description || rawText || 'No description available',
    company,
    location,
    compensation,
    requirements,
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
