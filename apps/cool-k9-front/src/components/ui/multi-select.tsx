import { useState } from 'react';
import { Check, ChevronDown, Loader2, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils/cn.utils';

export interface MultiSelectOption {
  value: string;
  label: string;
  sublabel?: string;
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'info' | 'error' | 'destructive' | 'outline';
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
  hasError?: boolean;
  /** If provided, search is server-side: called on every input change, client-side filter disabled */
  onSearchChange?: (term: string) => void;
  /** Show a loading spinner at the bottom of the list */
  isLoading?: boolean;
  /** Show a "Charger plus" button at the bottom */
  hasMore?: boolean;
  /** Called when the user clicks "Charger plus" */
  onLoadMore?: () => void;
  /** Called when the popover opens/closes */
  onOpenChange?: (open: boolean) => void;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Sélectionner...',
  searchPlaceholder = 'Rechercher...',
  disabled = false,
  className,
  hasError = false,
  onSearchChange,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  onOpenChange,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setSearch('');
    onOpenChange?.(next);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearchChange?.(value);
  };

  // If server-side search is active, skip client-side filtering
  const filtered = onSearchChange
    ? options
    : options.filter(opt =>
        `${opt.label} ${opt.sublabel ?? ''}`.toLowerCase().includes(search.toLowerCase())
      );

  const toggle = (value: string) => {
    onChange(selected.includes(value) ? selected.filter(v => v !== value) : [...selected, value]);
  };

  const remove = (e: React.MouseEvent, value: string) => {
    e.stopPropagation();
    onChange(selected.filter(v => v !== value));
  };

  const selectedOptions = selected
    .map(v => options.find(o => o.value === v))
    .filter(Boolean) as MultiSelectOption[];

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'flex min-h-9 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-1.5 text-sm shadow-xs transition-colors',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50',
            hasError ? 'border-destructive' : 'border-input',
            className
          )}
          aria-invalid={hasError}
        >
          <span className="flex flex-wrap gap-1 flex-1 min-w-0">
            {selectedOptions.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              selectedOptions.map(opt => (
                <Badge key={opt.value} variant={opt.variant ?? 'secondary'} className="gap-1 pr-1 max-w-[160px]">
                  <span className="truncate">{opt.label}</span>
                  <span
                    role="button"
                    aria-label={`Retirer ${opt.label}`}
                    onClick={e => remove(e, opt.value)}
                    className="rounded-sm hover:bg-muted cursor-pointer shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </span>
                </Badge>
              ))
            )}
          </span>
          {selectedOptions.length > 0 && (
            <span
              role="button"
              aria-label="Tout effacer"
              onClick={e => {
                e.stopPropagation();
                onChange([]);
              }}
              className="shrink-0 rounded-sm hover:bg-muted cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </span>
          )}
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        onOpenAutoFocus={e => e.preventDefault()}
      >
        <div className="p-2 border-b">
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            className="h-8"
            autoFocus
          />
        </div>
        <ul className="max-h-56 overflow-y-auto py-1" role="listbox" aria-multiselectable="true">
          {filtered.length === 0 && !isLoading ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">Aucun résultat</li>
          ) : (
            filtered.map(opt => {
              const isSelected = selected.includes(opt.value);
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => toggle(opt.value)}
                  className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground select-none"
                >
                  <Check
                    className={cn('h-4 w-4 shrink-0', isSelected ? 'opacity-100' : 'opacity-0')}
                  />
                  {opt.variant ? (
                    <div className="flex-1 flex items-center gap-2 min-w-0">
                      <Badge variant={opt.variant}>
                        {opt.label}
                      </Badge>
                      {opt.sublabel && (
                        <span className="text-xs text-muted-foreground truncate">{opt.sublabel}</span>
                      )}
                    </div>
                  ) : (
                    <>
                      <span className="flex-1 truncate">{opt.label}</span>
                      {opt.sublabel && (
                        <span className="text-xs text-muted-foreground truncate">{opt.sublabel}</span>
                      )}
                    </>
                  )}
                </li>
              );
            })
          )}
        </ul>

        {isLoading && (
          <div className="flex justify-center items-center py-2 border-t">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}

        {hasMore && !isLoading && (
          <div className="border-t p-1">
            <button
              type="button"
              onClick={onLoadMore}
              className="w-full text-xs text-muted-foreground hover:text-foreground py-1.5 hover:bg-accent rounded-sm transition-colors"
            >
              Charger plus
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
