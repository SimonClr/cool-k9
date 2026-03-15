import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@authentication';
import { SessionService, CreateSessionInput } from '../services/session.service';
import { ExerciseType } from '@models';

export const SESSIONS_QUERY_KEY = (userId: string, exerciseType?: ExerciseType) =>
  exerciseType ? (['sessions', userId, exerciseType] as const) : (['sessions', userId] as const);

export const SESSION_QUERY_KEY = (userId: string, id: string) =>
  ['sessions', userId, id] as const;

export function useSessions(exerciseType?: ExerciseType) {
  const { user } = useAuth();
  return useQuery({
    queryKey: SESSIONS_QUERY_KEY(user?.id ?? '', exerciseType),
    queryFn: () => SessionService.getSessions(exerciseType),
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
