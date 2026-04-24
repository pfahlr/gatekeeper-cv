const ALLOWED_CONTENT_TYPES = [
  'text/html',
  'application/xhtml+xml',
] as const;

const ALLOWED_PROTOCOLS = ['http:', 'https:'] as const;

export class FetchError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'FetchError';
  }
}

export class InvalidUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidUrlError';
  }
}

export function validateUrl(url: string): URL {
  try {
    const parsed = new URL(url);
    if (!ALLOWED_PROTOCOLS.includes(parsed.protocol as any)) {
      throw new InvalidUrlError(
        `Unsupported protocol: "${parsed.protocol}". Only HTTP and HTTPS are allowed.`
      );
    }
    return parsed;
  } catch (error) {
    if (error instanceof InvalidUrlError) {
      throw error;
    }
    throw new InvalidUrlError(`Invalid URL: ${url}`);
  }
}

function getContentType(response: Response): string | null {
  const contentType = response.headers.get('content-type');
  if (!contentType) {
    return null;
  }
  // Return the MIME type without charset or other parameters
  return contentType.split(';')[0].trim().toLowerCase();
}

function isAllowedContentType(contentType: string | null): boolean {
  if (contentType === null) {
    // Missing content type - allow and rely on text content
    return true;
  }
  return ALLOWED_CONTENT_TYPES.includes(contentType as any);
}

export async function fetchPage(url: string): Promise<string> {
  validateUrl(url);

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0',
    },
  });

  if (!response.ok) {
    throw new FetchError(
      `Failed to fetch page: HTTP ${response.status} ${response.statusText}`,
      response.status
    );
  }

  const contentType = getContentType(response);
  if (contentType !== null && !isAllowedContentType(contentType)) {
    throw new FetchError(
      `Unsupported content type: "${contentType}". Expected HTML content (text/html or application/xhtml+xml).`
    );
  }

  const text = await response.text();

  const trimmed = text.trim();
  if (!trimmed) {
    throw new FetchError('Response body is empty');
  }

  return trimmed;
}
