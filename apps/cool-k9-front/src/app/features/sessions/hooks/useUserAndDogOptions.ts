import { useEffect, useMemo, useState } from 'react';
import { Dog as DogModel, Session } from '@models';
import type { MultiSelectOption } from '@/components/ui/multi-select';
import { useUserSearch } from '@/app/features/profile/hooks/useUsers';
import { useMultiUserDogs } from '@/app/features/dogs/hooks/useDogs';

export function useUserAndDogOptions(
  selectedUserIds: string[],
  isEdit: boolean,
  session?: Session,
) {
  const [usersEnabled, setUsersEnabled] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: usersPages, isLoading: usersLoading, hasNextPage, fetchNextPage } =
    useUserSearch(debouncedSearch, usersEnabled);

  const { data: availableDogs, isLoading: dogsLoading } = useMultiUserDogs(selectedUserIds);

  // User options: merge initial (edit mode) + search results
  const searchedOptions: MultiSelectOption[] = (usersPages?.pages ?? [])
    .flatMap(p => p.data)
    .map(u => ({
      value: u.id,
      label: `${u.firstName} ${u.lastName}`.trim() || u.email,
      sublabel: u.email,
    }));

  const initialUserOptions: MultiSelectOption[] = isEdit && session
    ? session.userIds.map((id, i) => ({
        value: id,
        label: session.userNames?.[i] ?? id,
      }))
    : [];

  const userOptions: MultiSelectOption[] = [
    ...initialUserOptions,
    ...searchedOptions.filter(o => !initialUserOptions.some(io => io.value === o.value)),
  ];

  // Dog options
  const dogOptions: MultiSelectOption[] = availableDogs.map((d: DogModel) => ({
    value: d.id,
    label: d.name,
    sublabel: `${Math.floor((Date.now() - new Date(d.birthDate).getTime()) / (365.25 * 24 * 3600 * 1000))} ans`,
  }));

  // Auto-selection: dog IDs to add when a user has exactly one dog (create mode only)
  const autoSelectedDogIds = useMemo(() => {
    if (isEdit || dogsLoading || availableDogs.length === 0) return [];
    const result: string[] = [];
    selectedUserIds.forEach(uid => {
      const userDogs = availableDogs.filter((d: DogModel) => d.userId === uid);
      if (userDogs.length === 1) result.push(userDogs[0].id);
    });
    return result;
  }, [availableDogs, dogsLoading, selectedUserIds, isEdit]);

  return {
    userOptions,
    usersLoading,
    hasNextPage,
    onFetchNextPage: () => fetchNextPage(),
    onUsersSearchChange: setSearch,
    onUsersOpenChange: setUsersEnabled,
    dogOptions,
    dogsLoading,
    autoSelectedDogIds,
    availableDogs,
  };
}
