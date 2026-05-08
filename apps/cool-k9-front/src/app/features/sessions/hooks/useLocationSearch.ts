import { useEffect, useRef, useState } from 'react';
import { apiFetchLocationSuggestions, type NominatimResult } from '../api/location.api';

export function useLocationSearch() {
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const search = (q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await apiFetchLocationSuggestions(q);
        setSuggestions(data);
        setOpen(data.length > 0);
      } catch {
        setSuggestions([]);
        setOpen(false);
      }
    }, 400);
  };

  const clear = () => {
    setSuggestions([]);
    setOpen(false);
  };

  return { suggestions, open, setOpen, search, clear };
}
