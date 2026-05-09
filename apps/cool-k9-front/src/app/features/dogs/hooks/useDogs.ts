import { useMemo } from 'react';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/app/features/auth';
import { DogService } from '@/app/features/dogs';

export const DOGS_QUERY_KEY = (userId: string) => ['dogs', userId] as const;

export function useDogs() {
  const { user } = useAuth();
  return useQuery({
    queryKey: DOGS_QUERY_KEY(user?.id ?? ''),
    queryFn: () => DogService.getDogs(),
    enabled: !!user,
  });
}

export function useMultiUserDogs(userIds: string[]) {
  const results = useQueries({
    queries: userIds.map(id => ({
      queryKey: DOGS_QUERY_KEY(id),
      queryFn: () => DogService.getDogs(id),
      enabled: !!id,
    })),
  });
  // Stable key so the memoized array only changes when dog IDs actually change
  const dataKey = results.map(r => r.data?.map(d => d.id).join(',') ?? '').join('|');
  const allDogs = useMemo(() => results.flatMap(r => r.data ?? []), [dataKey]);
  const isLoading = results.some(r => r.isLoading);
  return { data: allDogs, isLoading };
}

export function useCreateDog() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ name, birthDate }: { name: string; birthDate: Date }) =>
      DogService.createDog(name, birthDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOGS_QUERY_KEY(user?.id ?? '') });
    },
  });
}

export function useUpdateDog() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, name, birthDate }: { id: string; name: string; birthDate: Date }) =>
      DogService.updateDog(id, name, birthDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOGS_QUERY_KEY(user?.id ?? '') });
    },
  });
}
