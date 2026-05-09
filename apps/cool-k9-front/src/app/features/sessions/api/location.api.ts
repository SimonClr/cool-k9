import type { NominatimResult } from '../models/location.model';

export async function apiFetchLocationSuggestions(query: string): Promise<NominatimResult[]> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=0`,
    { headers: { 'Accept-Language': 'fr', 'User-Agent': 'cool-k9-app' } }
  );
  return res.json();
}
