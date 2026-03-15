import { useQuery } from '@tanstack/react-query';
import { SessionService } from '../services/session.service';
import { ExerciseType } from '@models';

export const SESSIONS_QUERY_KEY = (exerciseType?: ExerciseType) =>
  exerciseType ? (['sessions', exerciseType] as const) : (['sessions'] as const);

export const SESSION_QUERY_KEY = (id: string) => ['sessions', id] as const;

export function useSessions(exerciseType?: ExerciseType) {
  return useQuery({
    queryKey: SESSIONS_QUERY_KEY(exerciseType),
    queryFn: () => SessionService.getSessions(exerciseType),
  });
}

export function useSession(id: string) {
  return useQuery({
    queryKey: SESSION_QUERY_KEY(id),
    queryFn: () => SessionService.getSession(id),
  });
}
