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

  const response = await fetch(url);

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
