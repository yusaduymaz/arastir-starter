interface CacheEntry<T> {
  data: T;
  expiry: number;
  provider: string;
}

export class RapidApiCache {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttlSeconds: number, provider: string): void {
    const expiry = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { data, expiry, provider });
  }

  get<T>(key: string): { data: T; ttlRemaining: number } | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return {
      data: entry.data as T,
      ttlRemaining: Math.max(0, Math.floor((entry.expiry - now) / 1000)),
    };
  }

  clear(): void {
    this.cache.clear();
  }

  clearProvider(provider: string): void {
    this.cache.forEach((entry, key) => {
      if (entry.provider === provider) {
        this.cache.delete(key);
      }
    });
  }
}

export const globalRapidApiCache = new RapidApiCache();
