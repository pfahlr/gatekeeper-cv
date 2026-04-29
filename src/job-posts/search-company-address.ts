import { fetchPage } from './fetch-page.js';
import * as cheerio from 'cheerio';

/**
 * Search for a company's corporate address using DuckDuckGo HTML search
 */
export async function searchCompanyAddress(companyName: string): Promise<string | undefined> {
  if (!companyName || companyName.trim().length === 0) {
    return undefined;
  }

  try {
    const searchQuery = encodeURIComponent(`${companyName} corporate address headquarters`);
    const duckDuckGoUrl = `https://html.duckduckgo.com/html/?q=${searchQuery}`;

    const html = await fetchPage(duckDuckGoUrl);
    const $ = cheerio.load(html);

    // Try to extract address from search result snippets first
    const snippets: string[] = [];
    $('.result__snippet').each((_, el) => {
      const text = $(el).text().trim();
      if (text) snippets.push(text);
    });

    // Also check the result body text for addresses
    $('.result__body').each((_, el) => {
      const text = $(el).text().trim();
      if (text && !snippets.includes(text)) {
        snippets.push(text);
      }
    });

    // Look for address patterns in snippets (must include street address)
    const addressPatterns = [
      // US Address pattern with ZIP: street number + street + city, state ZIP
      /\d+\s+[\w\s]+(?:St|Street|Ave|Avenue|Blvd|Boulevard|Rd|Road|Ln|Lane|Dr|Drive|Way|Court|Ct|Place|Pl|Suite|Ste|Unit)\s*,?\s*[\w\s]+,\s*[A-Z]{2}\s+\d{5}/i,
      // More lenient: number + street name + city, state ZIP
      /\d+\s+[A-Z][a-z0-9\s]+,\s*[A-Z][a-z\s]+,\s*[A-Z]{2}\s+\d{5}/i,
    ];

    for (const snippet of snippets) {
      for (const pattern of addressPatterns) {
        const match = snippet.match(pattern);
        if (match && isValidAddress(match[0])) {
          return cleanAddress(match[0]);
        }
      }
    }

    // If no address found in snippets, try to fetch from the first official company result
    const firstResultLink = $('.result__url').first();
    if (firstResultLink.length > 0) {
      const href = firstResultLink.attr('href');
      if (href) {
        // DuckDuckGo uses redirect URLs, extract the actual URL
        const actualUrlMatch = href.match(/uddg=([^&]+)/);
        if (actualUrlMatch) {
          const actualUrl = decodeURIComponent(actualUrlMatch[1]);
          const addressFromPage = await extractAddressFromCompanyPage(actualUrl);
          if (addressFromPage) {
            return addressFromPage;
          }
        }
      }
    }

    return undefined;
  } catch (error) {
    // Silently fail - address lookup is optional
    return undefined;
  }
}

/**
 * Try to extract address from a company's website
 */
async function extractAddressFromCompanyPage(url: string): Promise<string | undefined> {
  try {
    const html = await fetchPage(url);
    const $ = cheerio.load(html);

    // Common selectors for address elements
    const addressSelectors = [
      '[itemprop="address"]',
      '.address',
      '#address',
      'footer address',
      'address',
      '[class*="address" i]',
      '[id*="address" i]',
    ];

    for (const selector of addressSelectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        const text = element.text().trim();
        if (text && isValidAddress(text)) {
          return cleanAddress(text);
        }
      }
    }

    // Also look for microdata address with street address
    const microdataAddress = $('[itemprop="streetAddress"]');
    if (microdataAddress.length > 0) {
      const street = microdataAddress.first().text().trim();
      const locality = $('[itemprop="addressLocality"]').first().text().trim();
      const region = $('[itemprop="addressRegion"]').first().text().trim();
      const postal = $('[itemprop="postalCode"]').first().text().trim();

      if (street && locality && region && postal) {
        const fullAddress = `${street}, ${locality}, ${region} ${postal}`;
        if (isValidAddress(fullAddress)) {
          return cleanAddress(fullAddress);
        }
      }
    }

    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Check if text looks like an address
 */
function looksLikeAddress(text: string): boolean {
  // Must have a number (street address) and ZIP code pattern
  return /\d/.test(text) && /\d{5}/.test(text);
}

/**
 * Validate that an extracted address is actually a valid address
 */
function isValidAddress(text: string): boolean {
  // Must be at least 15 characters long (street addresses are longer)
  if (text.length < 15) return false;

  // Must contain a ZIP code (5 digits)
  if (!/\d{5}/.test(text)) return false;

  // Must not start with a year (like "2019 that specializes in...")
  if (/^(19|20)\d{2}\s+(?:that|specializes|incorporated|founded)/i.test(text)) {
    return false;
  }

  // Must start with a street number (required for corporate addresses)
  const hasStreetNumber = /^\d+\s+[A-Za-z]/.test(text);
  if (!hasStreetNumber) return false;

  // Must contain city, state ZIP pattern
  const hasCityStateZip = /\s[A-Z]{2}\s+\d{5}/.test(text);
  if (!hasCityStateZip) return false;

  // Must not contain obvious non-address phrases
  const badPhrases = [
    'specializes in',
    'connecting skilled',
    'remote opportunities',
    'ecosystem, including',
    'founded in',
    'view details',
    'learn more',
    'click here',
    'read more',
    'headquarters & corporate',
  ];
  const lowerText = text.toLowerCase();
  for (const phrase of badPhrases) {
    if (lowerText.includes(phrase)) {
      return false;
    }
  }

  return true;
}

/**
 * Clean up extracted address text
 */
function cleanAddress(address: string): string {
  return address
    .replace(/\s+/g, ' ')
    .replace(/,\s*/, ', ')
    .split(/[.,]\s*(?:and|or|plus|&)\s*$/i)[0] // Remove trailing "and", "or", etc.
    .replace(/\s+(?:and|or|plus|&)\s*$/i, '') // Remove trailing conjunctions without separator
    .trim()
    .substring(0, 200); // Limit length
}
