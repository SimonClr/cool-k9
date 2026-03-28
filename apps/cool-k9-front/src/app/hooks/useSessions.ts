import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@authentication';
import { SessionService, CreateSessionInput } from '../services/session.service';
import { ExerciseType } from '@models';

export const SESSIONS_QUERY_KEY = (userId: string) => ['sessions', userId] as const;

export const SESSION_QUERY_KEY = (userId: string, id: string) =>
  ['sessions', userId, id] as const;

export function useSessions(
  exerciseTypes?: ExerciseType[],
  page = 1,
  userIds?: string[],
  dogIds?: string[],
) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [
      ...SESSIONS_QUERY_KEY(user?.id ?? ''),
      exerciseTypes?.join(',') ?? '',
      page,
      userIds?.join(',') ?? '',
      dogIds?.join(',') ?? '',
    ],
    queryFn: () => SessionService.getSessions({ exerciseTypes, page, perPage: 20, userIds, dogIds }),
    enabled: !!user,
  });
}

export function useSession(id: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: SESSION_QUERY_KEY(user?.id ?? '', id),
    queryFn: () => SessionService.getSession(id),
    enabled: !!user,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (dto: CreateSessionInput) => SessionService.createSession(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', user?.id ?? ''] });
    },
  });
}

export function useUpdateSession(id: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (dto: Partial<CreateSessionInput>) => SessionService.updateSession(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY(user?.id ?? '', id) });
      queryClient.invalidateQueries({ queryKey: ['sessions', user?.id ?? ''] });
    },
  });
}
