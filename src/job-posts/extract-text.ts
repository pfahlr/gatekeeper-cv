import type { CheerioAPI, Cheerio } from 'cheerio';

export function normalizeWhitespace(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractFirstText(
  $: CheerioAPI,
  selectorOrSelectors: string | string[]
): string | undefined {
  const selectors = Array.isArray(selectorOrSelectors)
    ? selectorOrSelectors
    : [selectorOrSelectors];

  for (const selector of selectors) {
    const element = $(selector).first();
    if (element.length > 0) {
      const text = element.text();
      const normalized = normalizeWhitespace(text);
      if (normalized) {
        return normalized;
      }
    }
  }

  return undefined;
}

export function extractListText(
  $: CheerioAPI,
  selectorOrSelectors: string | string[]
): string[] {
  const selectors = Array.isArray(selectorOrSelectors)
    ? selectorOrSelectors
    : [selectorOrSelectors];

  for (const selector of selectors) {
    const elements = $(selector);
    if (elements.length > 0) {
      const texts: string[] = [];
      elements.each((_, el) => {
        const text = $(el).text();
        const normalized = normalizeWhitespace(text);
        if (normalized) {
          texts.push(normalized);
        }
      });
      if (texts.length > 0) {
        return texts;
      }
    }
  }

  return [];
}

export function extractTextContent($: CheerioAPI, element: Cheerio<any>): string {
  return normalizeWhitespace(element.text());
}
