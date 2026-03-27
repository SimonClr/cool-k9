import { useInfiniteQuery } from '@tanstack/react-query';
import { UserService } from '../services/user.service';

export function useUserSearch(search: string, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: ['users', search],
    queryFn: ({ pageParam = 1 }) =>
      UserService.getUsers({ search: search || undefined, page: pageParam as number, perPage: 20 }),
    getNextPageParam: lastPage => {
      const loaded = lastPage.page * lastPage.perPage;
      return loaded < lastPage.total ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled,
  });
}
