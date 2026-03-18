import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export interface LocationValue {
  name: string;
  lat: number;
  lon: number;
}

interface LocationAutocompleteProps {
  id?: string;
  value: string;
  onChange: (value: LocationValue | null, displayName: string) => void;
  placeholder?: string;
  className?: string;
}

export function LocationAutocomplete({
  id,
  value,
  onChange,
  placeholder = 'Rechercher un lieu...',
  className,
}: LocationAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
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
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=0`,
          { headers: { 'Accept-Language': 'fr', 'User-Agent': 'cool-k9-app' } }
        );
        const data: NominatimResult[] = await res.json();
        setSuggestions(data);
        setOpen(data.length > 0);
      } catch {
        setSuggestions([]);
        setOpen(false);
      }
    }, 400);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    // Free text input → no coordinates yet
    onChange(null, q);
    search(q);
  };

  const handleFocus = () => {
    if (suggestions.length > 0) setOpen(true);
  };

  const createSuggestionMouseDownHandler = (result: NominatimResult) => (e: React.MouseEvent) => {
    e.preventDefault();
    handleSelect(result);
  };

  const handleSelect = (result: NominatimResult) => {
    const short = result.display_name.split(',').slice(0, 2).join(',').trim();
    setQuery(short);
    onChange(
      { name: short, lat: parseFloat(result.lat), lon: parseFloat(result.lon) },
      short
    );
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <Input
        id={id}
        type="text"
        value={query}
        onChange={handleInput}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={cn('pr-8', className)}
        autoComplete="off"
      />
      <MapPin className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      {open && (
        <ul className="absolute z-50 w-full mt-1 rounded-md border bg-popover text-popover-foreground shadow-md max-h-64 overflow-y-auto">
          {suggestions.map(result => {
            const parts = result.display_name.split(',');
            const primary = parts[0].trim();
            const secondary = parts.slice(1, 3).join(',').trim();
            return (
              <li
                key={result.place_id}
                className="px-3 py-2.5 cursor-pointer hover:bg-accent hover:text-accent-foreground border-b last:border-b-0"
                onMouseDown={createSuggestionMouseDownHandler(result)}
              >
                <p className="text-sm font-medium leading-tight">{primary}</p>
                {secondary && (
                  <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{secondary}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
