import type { JobSiteConfig, JobSite } from '../config/load-job-sites-config.js';
import { InvalidUrlError } from './fetch-page.js';

export interface JobSiteMatch {
  matchedDomain: string;
  siteConfig: JobSite;
}

/**
 * Extract hostname from URL and try to match against job site configs.
 * For a URL like https://jobs.example.com/posting/123, tries:
 * 1. jobs.example.com
 * 2. example.com
 */
export function findJobSiteConfigForUrl(
  jobPostUrl: string,
  config: JobSiteConfig
): JobSiteMatch | undefined {
  let hostname: string;

  try {
    const url = new URL(jobPostUrl);
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
