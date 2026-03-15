import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DogService } from '../services/dog.service';

export const DOGS_QUERY_KEY = ['dogs'] as const;

export function useDogs() {
  return useQuery({
    queryKey: DOGS_QUERY_KEY,
    queryFn: DogService.getDogs,
  });
}

export function useCreateDog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, age }: { name: string; age: number }) =>
      DogService.createDog(name, age),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOGS_QUERY_KEY });
    },
  });
}
