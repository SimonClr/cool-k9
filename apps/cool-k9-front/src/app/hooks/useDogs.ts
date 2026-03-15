import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@authentication';
import { DogService } from '../services/dog.service';

export const DOGS_QUERY_KEY = (userId: string) => ['dogs', userId] as const;

export function useDogs() {
  const { user } = useAuth();
  return useQuery({
    queryKey: DOGS_QUERY_KEY(user?.id ?? ''),
    queryFn: DogService.getDogs,
    enabled: !!user,
  });
}

export function useCreateDog() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ name, age }: { name: string; age: number }) =>
      DogService.createDog(name, age),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOGS_QUERY_KEY(user?.id ?? '') });
    },
  });
}
