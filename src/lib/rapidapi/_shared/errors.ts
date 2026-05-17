export type RapidApiErrorKind = 
  | 'missing_key'
  | 'rate_limited'
  | 'provider_error'
  | 'network'
  | 'parse'
  | 'timeout';

export class RapidApiError extends Error {
  constructor(
    public kind: RapidApiErrorKind,
    public provider: string,
    message: string,
    public status?: number,
    public code?: string,
    public retryAfter?: number
  ) {
    super(`[${provider}] ${kind.toUpperCase()}: ${message}`);
    this.name = 'RapidApiError';
  }

  static missingKey(provider: string) {
    return new RapidApiError('missing_key', provider, `API key for ${provider} is missing or empty.`);
  }

  static rateLimited(provider: string, retryAfter?: number) {
    return new RapidApiError('rate_limited', provider, `Rate limit exceeded for ${provider}.`, 429, 'RATE_LIMIT_EXCEEDED', retryAfter);
  }

  static providerError(provider: string, message: string, status?: number) {
    return new RapidApiError('provider_error', provider, message, status);
  }

  static parseError(provider: string, message: string) {
    return new RapidApiError('parse', provider, `Failed to parse response: ${message}`);
  }
}
