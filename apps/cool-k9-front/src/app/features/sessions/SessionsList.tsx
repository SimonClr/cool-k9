import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessions } from './hooks/useSessions';
import { ExerciseType } from '@models';
import { SessionCard } from './components/SessionCard';
import { SessionFilters } from './components/SessionFilters';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from '@/components/ui/empty';
import {
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Loader2,
  PlusCircle,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuth } from '@/app/features/auth';
import { cn } from '@/utils/cn.utils';

export function SessionsList() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ── Filtres ───────────────────────────────────────────────────
  const [filterUserIds, setFilterUserIds] = useState<string[]>([]);
  const [filterDogIds, setFilterDogIds] = useState<string[]>([]);
  const [filterExerciseTypes, setFilterExerciseTypes] = useState<ExerciseType[]>([]);

  const handleUserIdsChange = (ids: string[]) => {
    setFilterUserIds(ids);
    setFilterDogIds([]);
    setPage(1);
  };

  const handleDogIdsChange = (ids: string[]) => {
    setFilterDogIds(ids);
    setPage(1);
  };

  const handleExerciseTypesChange = (types: ExerciseType[]) => {
    setFilterExerciseTypes(types);
    setPage(1);
  };

  // ── Accordéon filtres (mobile) ────────────────────────────────
  const [filtersOpen, setFiltersOpen] = useState(true);
  const activeFiltersCount =
    filterUserIds.length + filterDogIds.length + filterExerciseTypes.length;

  // ── Pagination ────────────────────────────────────────────────
  const [page, setPage] = useState(1);

  // ── Sessions ──────────────────────────────────────────────────
  const { data, isLoading, isError } = useSessions(
    filterExerciseTypes,
    page,
    filterUserIds,
    filterDogIds
  );

  const sessions = data?.data ?? [];
  const totalPages = data ? Math.ceil(data.total / data.perPage) : 1;

  const handleNewSession = () => navigate('/sessions/new');

  return (
    <div className="pb-20 sm:pb-0">
      {/* FAB mobile */}
      {user?.isAdmin && (
        <Button
          onClick={handleNewSession}
          size="icon"
          className="sm:hidden fixed bottom-6 right-4 z-20 h-14 w-14 rounded-full shadow-lg"
          aria-label="Nouvelle séance"
          style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
        >
          <PlusCircle className="h-6 w-6" aria-hidden="true" />
        </Button>
      )}

      <header className="sticky top-0 z-10 -mx-4 -mt-4 px-4 pt-4 sm:pb-4 pb-8 mb-3">
        {/* Couche blur + dégradé — couvre toute la zone collante, padding compris */}
        <div
          className="absolute inset-0 bg-background/20 backdrop-blur-[6px] -z-10"
          style={{
            maskImage: 'linear-gradient(to bottom, black 55%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 55%, transparent 100%)',
          }}
        />

        {/* Desktop : filtres + bouton sur la même ligne */}
        <div className="hidden sm:flex items-center gap-4">
          <SessionFilters
            userIds={filterUserIds}
            dogIds={filterDogIds}
            exerciseTypes={filterExerciseTypes}
            onUserIdsChange={handleUserIdsChange}
            onDogIdsChange={handleDogIdsChange}
            onExerciseTypesChange={handleExerciseTypesChange}
            className="flex-1"
          />
          {user?.isAdmin && (
            <Button onClick={handleNewSession} className="shrink-0">
              <PlusCircle className="h-4 w-4 mr-2" aria-hidden="true" />
              Nouvelle séance
            </Button>
          )}
        </div>

        {/* Mobile : accordéon */}
        <div className="sm:hidden">
          <button
            onClick={() => setFiltersOpen(o => !o)}
            className="flex w-full items-center justify-between rounded-lg border bg-card px-3 py-2 text-sm shadow-sm"
          >
            <span className="flex items-center gap-2 text-muted-foreground">
              <SlidersHorizontal className="h-4 w-4" />
              Filtres
              {activeFiltersCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-medium text-primary-foreground">
                  {activeFiltersCount}
                </span>
              )}
            </span>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform duration-300',
                filtersOpen && 'rotate-180'
              )}
            />
          </button>

          <div
            className={cn(
              'overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out',
              filtersOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
            )}
          >
            <div className="pt-2">
              <SessionFilters
                userIds={filterUserIds}
                dogIds={filterDogIds}
                exerciseTypes={filterExerciseTypes}
                onUserIdsChange={handleUserIdsChange}
                onDogIdsChange={handleDogIdsChange}
                onExerciseTypesChange={handleExerciseTypesChange}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto">
        {/* Liste */}
        <section className="flex flex-col gap-2">
          {isError ? (
            <div role="alert" className="flex items-center gap-2 text-destructive py-4">
              <AlertCircle className="h-5 w-5" aria-hidden="true" />
              <p>Erreur lors du chargement des séances</p>
            </div>
          ) : isLoading ? (
            <div
              aria-live="polite"
              aria-busy="true"
              className="flex items-center justify-center gap-2 text-muted-foreground py-12"
            >
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
              <p>Chargement...</p>
            </div>
          ) : (
            <>
              {sessions.map(session => (
                <SessionCard key={session.id} session={session} />
              ))}

              {sessions.length === 0 && (
                <div className="col-span-full">
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia>
                        <Inbox className="h-12 w-12" aria-hidden="true" />
                      </EmptyMedia>
                      <EmptyDescription>Aucune séance trouvée</EmptyDescription>
                    </EmptyHeader>
                    {user?.isAdmin && filterUserIds.length === 0 && filterDogIds.length === 0 && (
                      <EmptyContent>
                        <Button onClick={handleNewSession}>
                          <PlusCircle className="h-4 w-4" aria-hidden="true" />
                          Nouvelle séance
                        </Button>
                      </EmptyContent>
                    )}
                  </Empty>
                </div>
              )}
            </>
          )}
        </section>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p - 1)}
              disabled={page === 1}
              aria-label="Page précédente"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={page === totalPages}
              aria-label="Page suivante"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
