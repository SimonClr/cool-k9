import { z } from 'zod';

/**
 * Environment variables the API cannot run without.
 *
 * Validated at startup so a misconfigured deployment fails immediately, instead of
 * booting and serving traffic in a degraded state — an unset CORS_ORIGINS would
 * otherwise reject every browser call, and missing Supabase credentials would surface
 * as opaque errors on the first request.
 */
export const envSchema = z.object({
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY must not be empty'),
  CORS_ORIGINS: z.string().min(1, 'CORS_ORIGINS must not be empty'),
  PORT: z.coerce.number().int().positive().optional(),
  NODE_ENV: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Passed to ConfigModule's `validate` option. Throws with the offending variable names
 * so the failure message points straight at what to fix.
 */
export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const details = result.error.issues
      .map(issue => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid environment configuration. ${details}`);
  }

  // Return the original config so non-validated variables stay available.
  return config;
}
