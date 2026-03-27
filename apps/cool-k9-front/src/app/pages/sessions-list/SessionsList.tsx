import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessions } from '../../hooks/useSessions';
import { useUserSearch } from '../../hooks/useUsers';
import { useDogs, useMultiUserDogs } from '../../hooks/useDogs';
import { SessionCard } from './components/SessionCard';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia } from '@/components/ui/empty';
import { AlertCircle, ChevronLeft, ChevronRight, Inbox, Loader2, PlusCircle } from 'lucide-react';
import { useAuth } from '@authentication';
import { Dog } from '@models';
import type { MultiSelectOption } from '@/components/ui/multi-select';

export function SessionsList() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ── Pagination ────────────────────────────────────────────────
  const [page, setPage] = useState(1);

  // ── Filtre utilisateurs (admin) ───────────────────────────────
  const [usersOpen, setUsersOpen] = useState(false);
  const [usersSearch, setUsersSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterUserIds, setFilterUserIds] = useState<string[]>([]);

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
  const [filterDogIds, setFilterDogIds] = useState<string[]>([]);

  // Admin : chiens des utilisateurs sélectionnés dans le filtre
  const { data: adminDogs, isLoading: adminDogsLoading } = useMultiUserDogs(
    user?.isAdmin ? filterUserIds : [],
  );

  // Non-admin : propres chiens de l'utilisateur
  const { data: ownDogs } = useDogs();

  const showDogFilter = user?.isAdmin
    ? filterUserIds.length > 0
    : (ownDogs?.length ?? 0) > 1;

  const availableDogs: Dog[] = user?.isAdmin ? adminDogs : (ownDogs ?? []);

  const dogOptions: MultiSelectOption[] = availableDogs.map(d => ({
    value: d.id,
    label: d.name,
    sublabel: `${d.age} ans`,
  }));

  // ── Handlers filtres ──────────────────────────────────────────
  const handleFilterUsersChange = (ids: string[]) => {
    setFilterUserIds(ids);
    setFilterDogIds([]); // reset chiens quand les users changent
    setPage(1);
  };

  const handleFilterDogsChange = (ids: string[]) => {
    setFilterDogIds(ids);
    setPage(1);
  };

  // ── Sessions ──────────────────────────────────────────────────
  const { data, isLoading, isError } = useSessions(undefined, page, filterUserIds, filterDogIds);

  const sessions = data?.sessions ?? [];
  const totalPages = data ? Math.ceil(data.total / data.perPage) : 1;

  const handleNewSession = () => navigate('/sessions/new');

  const hasFilters = user?.isAdmin || showDogFilter;

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mes séances</h1>
        {user?.isAdmin && sessions.length > 0 && (
          <Button onClick={handleNewSession}>
            <PlusCircle className="h-4 w-4 mr-2" aria-hidden="true" />
            Nouvelle séance
          </Button>
        )}
      </header>

      {/* Filtres */}
      {hasFilters && (
        <div className="flex flex-col gap-3 mb-6">
          {user?.isAdmin && (
            <div className="flex flex-col gap-1.5">
              <Label>Utilisateurs</Label>
              <MultiSelect
                options={userOptions}
                selected={filterUserIds}
                onChange={handleFilterUsersChange}
                placeholder="Tous les utilisateurs"
                searchPlaceholder="Rechercher un utilisateur..."
                onSearchChange={setUsersSearch}
                isLoading={usersLoading}
                hasMore={hasNextPage}
                onLoadMore={() => fetchNextPage()}
                onOpenChange={setUsersOpen}
              />
            </div>
          )}

          {showDogFilter && (
            <div className="flex flex-col gap-1.5">
              <Label>Chiens</Label>
              <MultiSelect
                options={dogOptions}
                selected={filterDogIds}
                onChange={handleFilterDogsChange}
                placeholder="Tous les chiens"
                searchPlaceholder="Rechercher un chien..."
                disabled={adminDogsLoading}
              />
            </div>
          )}
        </div>
      )}

      {/* Liste */}
      <section className="flex flex-col gap-4">
        {isError ? (
          <div role="alert" className="flex items-center gap-2 text-destructive py-4">
            <AlertCircle className="h-5 w-5" aria-hidden="true" />
            <p>Erreur lors du chargement des séances</p>
          </div>
        ) : isLoading ? (
          <div aria-live="polite" aria-busy="true" className="flex items-center justify-center gap-2 text-muted-foreground py-12">
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
  );
}
