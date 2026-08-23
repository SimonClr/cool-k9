/**
 * Parses the comma-separated CORS_ORIGINS variable into a list of allowed origins.
 * Blank entries and surrounding whitespace are dropped, so a trailing comma or a
 * value spread over several lines stays harmless.
 */
export function parseCorsOrigins(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map(origin => origin.trim())
    .filter(origin => origin.length > 0);
}
