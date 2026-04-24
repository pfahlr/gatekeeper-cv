import type { JobSiteConfig, JobSite } from '../config/load-job-sites-config.js';
import { InvalidUrlError } from './fetch-page.js';

// Use global decodeURIComponent
const decode = globalThis.decodeURIComponent;

export interface JobSiteMatch {
  matchedDomain: string;
  siteConfig: JobSite;
}

/**
 * Extract the original URL from a web.archive.org URL.
 * Pattern: https://web.archive.org/web/{timestamp}/{original_url}
 * Returns the original URL if it's a web archive URL, otherwise returns the input URL.
 */
function extractOriginalUrl(url: string): string {
  try {
    const parsed = new URL(url);

    // Check if this is a web archive URL
    if (parsed.hostname === 'web.archive.org') {
      // Match pattern: /web/{timestamp}/{original_url}
      const pathMatch = parsed.pathname.match(/^\/web\/\d+\/(.+)$/);
      if (pathMatch) {
        const originalUrlStr = pathMatch[1];
        // Decode URL-encoded characters
        return decode(originalUrlStr);
      }
    }

    return url;
  } catch {
    return url;
  }
}

/**
 * Extract hostname from URL and try to match against job site configs.
 * For a URL like https://jobs.example.com/posting/123, tries:
 * 1. jobs.example.com
 * 2. example.com
 *
 * Handles web.archive.org URLs by extracting the original URL first.
 */
export function findJobSiteConfigForUrl(
  jobPostUrl: string,
  config: JobSiteConfig
): JobSiteMatch | undefined {
  // Extract original URL from web archive if present
  const urlForMatching = extractOriginalUrl(jobPostUrl);

  let hostname: string;

  try {
    const url = new URL(urlForMatching);
    hostname = url.hostname;
  } catch (error) {
    throw new InvalidUrlError(`Invalid URL: ${jobPostUrl}`);
  }

  // Try exact match first
  if (hostname in config.jobSites) {
    return {
      matchedDomain: hostname,
      siteConfig: config.jobSites[hostname],
    };
  }

  // Try parent domain (remove subdomains one by one)
  const parts = hostname.split('.');
  while (parts.length > 1) {
    parts.shift(); // Remove the leftmost part (subdomain)
    const parentDomain = parts.join('.');

    if (parentDomain in config.jobSites) {
      return {
        matchedDomain: parentDomain,
        siteConfig: config.jobSites[parentDomain],
      };
    }
  }

  return undefined;
}

/**
 * Get the original URL (for fetching) from a possibly archived URL.
 * Web archive URLs should be fetched from the archive, while regular URLs
 * are fetched directly.
 */
export function getUrlForFetching(url: string): string {
  // web archive URLs are fetched as-is
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'web.archive.org') {
      return url;
    }
  } catch {
    // If URL parsing fails, return as-is
  }
  return url;
}
