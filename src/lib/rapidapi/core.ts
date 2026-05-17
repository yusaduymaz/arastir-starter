import { RapidApiClient, RapidApiError, RapidApiProvider, getRapidApiKey } from './types';

export function createRapidApiClient(
  provider: RapidApiProvider,
  baseUrl: string
): RapidApiClient {
  const apiKey = getRapidApiKey(provider);

  if (!apiKey) {
    const error = new RapidApiError(
      `API key for ${provider} is missing.`,
      { provider, kind: 'missing_key' }
    );
    // Return a client that always returns the error
    return {
      get: () => Promise.resolve(error),
      post: () => Promise.resolve(error),
    };
  }

  const headers = {
    'x-rapidapi-host': new URL(baseUrl).host,
    'x-rapidapi-key': apiKey,
    'Content-Type': 'application/json',
  };

  const handleResponse = async (response: Response) => {
    if (!response.ok) {
      const errorBody = await response.text();
      throw new RapidApiError(
        `Request failed with status ${response.status}: ${errorBody}`,
        {
          provider,
          kind: 'http_error',
          status: response.status,
          code: response.statusText,
        }
      );
    }
    return response.json();
  };

  return {
    get: async <T>(path: string, params?: Record<string, string | number>): Promise<T | RapidApiError> => {
      try {
        const url = new URL(path, baseUrl);
        if (params) {
          Object.entries(params).forEach(([key, value]) =>
            url.searchParams.append(key, String(value))
          );
        }
        const response = await fetch(url.toString(), { headers });
        return await handleResponse(response);
      } catch (error) {
        if (error instanceof RapidApiError) {
          return error;
        }
        return new RapidApiError(error instanceof Error ? error.message : 'A network error occurred', {
          provider,
          kind: 'network_error',
        });
      }
    },
    post: async <T>(path: string, body?: any): Promise<T | RapidApiError> => {
      try {
        const url = new URL(path, baseUrl);
        const response = await fetch(url.toString(), {
          method: 'POST',
          headers,
          body: body ? JSON.stringify(body) : null,
        });
        return await handleResponse(response);
      } catch (error) {
        if (error instanceof RapidApiError) {
          return error;
        }
        return new RapidApiError(error instanceof Error ? error.message : 'A network error occurred', {
          provider,
          kind: 'network_error',
        });
      }
    },
  };
}
