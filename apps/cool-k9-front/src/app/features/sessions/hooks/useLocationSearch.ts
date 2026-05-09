import { useRef, useState } from 'react';
import { apiFetchLocationSuggestions } from '../api/location.api';
import type { NominatimResult } from '../models/location.model';

export function useLocationSearch() {
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = (q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await apiFetchLocationSuggestions(q);
        setSuggestions(data);
      } catch {
        setSuggestions([]);
      }
    }, 400);
  };

  const clear = () => setSuggestions([]);

  return { suggestions, search, clear };
}
