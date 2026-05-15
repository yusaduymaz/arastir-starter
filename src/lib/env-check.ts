/**
 * Centralized environment variable validation.
 * - REQUIRED: missing → throw (returns 500 to user).
 * - DEGRADED: missing → log once per process, pipeline continues with reduced capability.
 *
 * Call validateEnv() at the top of any API route that depends on these vars.
 */

const REQUIRED_KEYS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'CLERK_SECRET_KEY',
] as const;

const DEGRADED_KEYS: { key: string; impact: string }[] = [
  { key: 'SUPABASE_SERVICE_ROLE_KEY', impact: 'falls back to NEXT_PUBLIC_SUPABASE_ANON_KEY (limited write access)' },
  { key: 'CURRENTS_API_KEY', impact: 'News agent will fail (no Türkçe news fetch)' },
  { key: 'ALPHA_VANTAGE_API_KEY', impact: 'Market agent will fail (no BIST price/overview)' },
  { key: 'ANTHROPIC_API_KEY', impact: 'Analyst will use canned mock insights (no real AI synthesis)' },
  { key: 'TCMB_EVDS_API_KEY', impact: 'Macro agent (TCMB EVDS) cannot fetch USD/CPI/rate context' },
];

let degradedAlreadyLogged = false;

export class EnvValidationError extends Error {
  constructor(public readonly missing: string[]) {
    super(`Required environment variables missing: ${missing.join(', ')}`);
    this.name = 'EnvValidationError';
  }
}

export function validateEnv(): { degraded: string[] } {
  const missingRequired = REQUIRED_KEYS.filter((k) => !process.env[k]);
  if (missingRequired.length > 0) {
    throw new EnvValidationError(missingRequired);
  }

  const degraded = DEGRADED_KEYS.filter(({ key }) => !process.env[key]);

  if (degraded.length > 0 && !degradedAlreadyLogged) {
    console.warn('[env-check] Running in degraded mode — missing optional keys:');
    for (const { key, impact } of degraded) {
      console.warn(`  - ${key}: ${impact}`);
    }
    degradedAlreadyLogged = true;
  }

  return { degraded: degraded.map((d) => d.key) };
}
