import https from 'https';
import { RapidApiClient, RapidApiError, RapidApiProvider, getRapidApiKey } from '../types';
import { ForexApiResponse } from './types';

const provider = RapidApiProvider.ForexAPI;
const baseUrl = 'https://alpha-vantage.p.rapidapi.com';

function createForexApiClient(): RapidApiClient {
  const apiKey = getRapidApiKey(provider);

  if (!apiKey) {
    const error = new RapidApiError(`API key for ${provider} is missing.`, { provider, kind: 'missing_key' });
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

  return {
    get: async <T>(path: string, params?: Record<string, string | number>): Promise<T | RapidApiError> => {
      return new Promise((resolve) => {
        const url = new URL(path, baseUrl);
        if (params) {
          Object.entries(params).forEach(([key, value]) =>
            url.searchParams.append(key, String(value))
          );
        }

        const options = {
          method: 'GET',
          hostname: url.hostname,
          port: null,
          path: url.pathname + url.search,
          headers: headers,
        };

        const req = https.request(options, (res) => {
          const chunks: any[] = [];

          res.on('data', (chunk) => {
            chunks.push(chunk);
          });

          res.on('end', () => {
            const body = Buffer.concat(chunks);
            if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
              resolve(new RapidApiError(`Request failed with status ${res.statusCode}: ${body.toString()}`, {
                provider,
                kind: 'http_error',
                status: res.statusCode,
                code: res.statusMessage,
              }));
            } else {
              try {
                const json = JSON.parse(body.toString());
                resolve(json as T);
              } catch (e) {
                resolve(new RapidApiError('Failed to parse JSON response', { provider, kind: 'network_error' }));
              }
            }
          });
        });

        req.on('error', (e) => {
          resolve(new RapidApiError(e.message, { provider, kind: 'network_error' }));
        });

        req.end();
      });
    },
    post: async <T>(): Promise<T | RapidApiError> => {
      // Not implemented for this client
      return Promise.resolve(new RapidApiError('POST method not supported for Forex API client', { provider, kind: 'network_error' }));
    },
  };
}

export const forexApiClient = createForexApiClient();

export async function getCurrencyExchangeRate(fromCurrency: string, toCurrency: string): Promise<ForexApiResponse | RapidApiError> {
  const result = await forexApiClient.get<ForexApiResponse>('/query', { function: 'CURRENCY_EXCHANGE_RATE', from_currency: fromCurrency, to_currency: toCurrency });
  return result;
}
