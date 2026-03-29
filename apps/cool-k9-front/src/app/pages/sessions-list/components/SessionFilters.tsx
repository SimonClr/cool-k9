import { useEffect, useState } from 'react';
import { useAuth } from '@authentication';
import { useUserSearch } from '@/app/hooks/useUsers';
import { useDogs, useMultiUserDogs } from '@/app/hooks/useDogs';
import { Label } from '@/components/ui/label';
import type { MultiSelectOption } from '@/components/ui/multi-select';
import { MultiSelect } from '@/components/ui/multi-select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Dog, ExerciseType } from '@models';
import { EXERCISE_TYPE_LABELS } from '@/app/utils/exercise-type';

interface SessionFiltersProps {
  userIds: string[];
  dogIds: string[];
  exerciseTypes: ExerciseType[];
  onUserIdsChange: (ids: string[]) => void;
  onDogIdsChange: (ids: string[]) => void;
  onExerciseTypesChange: (types: ExerciseType[]) => void;
  className?: string;
}

const exerciseTypeOptions: MultiSelectOption[] = Object.values(ExerciseType).map(value => ({
  value,
  label: EXERCISE_TYPE_LABELS[value]?.label ?? value,
  variant: EXERCISE_TYPE_LABELS[value]?.variant ?? 'secondary',
}));

export function SessionFilters({
  userIds,
  dogIds,
  exerciseTypes,
  onUserIdsChange,
  onDogIdsChange,
  onExerciseTypesChange,
  className,
}: SessionFiltersProps) {
  const { user } = useAuth();

  // ── Filtre clients (admin) ───────────────────────────────
  const [usersOpen, setUsersOpen] = useState(false);
  const [usersSearch, setUsersSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(usersSearch), 300);
    return () => clearTimeout(t);
  }, [usersSearch]);

  const {
    data: usersPages,
    isLoading: usersLoading,
    hasNextPage,
    fetchNextPage,
  } = useUserSearch(debouncedSearch, usersOpen);

  const userOptions: MultiSelectOption[] = (usersPages?.pages ?? [])
    .flatMap(p => p.users)
    .map(u => ({
      value: u.id,
      label: `${u.firstName} ${u.lastName}`.trim() || u.email,
      sublabel: u.email,
    }));

  // ── Filtre chiens ─────────────────────────────────────────────
  const { data: adminDogs, isLoading: adminDogsLoading } = useMultiUserDogs(
    user?.isAdmin ? userIds : []
  );
  const { data: ownDogs } = useDogs();

  // Pour un non-admin : afficher seulement si > 1 chien
  const showDogFilter = user?.isAdmin || (ownDogs?.length ?? 0) > 1;

  const dogDisabled = user?.isAdmin ? userIds.length === 0 : false;

  const availableDogs: Dog[] = user?.isAdmin ? adminDogs : (ownDogs ?? []);

  const dogOptions: MultiSelectOption[] = availableDogs.map(d => ({
    value: d.id,
    label: d.name,
    sublabel: `${Math.floor((Date.now() - new Date(d.birthDate).getTime()) / (365.25 * 24 * 3600 * 1000))} ans`,
  }));

  return (
    <TooltipProvider>
      <div
        className={cn(
          'rounded-lg border bg-card shadow-sm p-3 flex flex-col sm:flex-row gap-3',
          className
        )}
      >
        {user?.isAdmin && (
          <div className="flex flex-col gap-1.5 flex-1">
            <Label>Clients</Label>
            <MultiSelect
              options={userOptions}
              selected={userIds}
              onChange={onUserIdsChange}
              placeholder="Tous les clients"
              searchPlaceholder="Rechercher un client..."
              onSearchChange={setUsersSearch}
              isLoading={usersLoading}
              hasMore={hasNextPage}
              onLoadMore={() => fetchNextPage()}
              onOpenChange={setUsersOpen}
            />
          </div>
        )}

        {showDogFilter && (
          <div className="flex flex-col gap-1.5 flex-1">
            <Label className={dogDisabled ? 'text-muted-foreground' : ''}>Chiens</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="w-full">
                  <MultiSelect
                    options={dogOptions}
                    selected={dogIds}
                    onChange={onDogIdsChange}
                    placeholder="Tous les chiens"
                    searchPlaceholder="Rechercher un chien..."
                    disabled={dogDisabled || adminDogsLoading}
                  />
                </span>
              </TooltipTrigger>
              {dogDisabled && (
                <TooltipContent>Sélectionnez un client pour filtrer par chien</TooltipContent>
              )}
            </Tooltip>
          </div>
        )}

        <div className="flex flex-col gap-1.5 flex-1">
          <Label>Type de séance</Label>
          <MultiSelect
            options={exerciseTypeOptions}
            selected={exerciseTypes}
            onChange={types => onExerciseTypesChange(types as ExerciseType[])}
            placeholder="Tous les types"
            searchPlaceholder="Rechercher un type..."
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
