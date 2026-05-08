import { ExerciseType, PaginatedResponse, Session } from '@models';
import { apiFetchSessions, apiFetchSession, apiUpdateSession, apiCreateSession } from '../api/session.api';

export type CreateSessionInput = Omit<Session, 'id' | 'dogNames' | 'dogIds'> & { dogIds?: string[] };

export class SessionService {
  static async getSessions(params?: {
    exerciseTypes?: ExerciseType[];
    page?: number;
    perPage?: number;
    userIds?: string[];
    dogIds?: string[];
  }): Promise<PaginatedResponse<Session>> {
    const result = await apiFetchSessions(params);
    return {
      ...result,
      data: result.data.map(session => ({
        ...session,
        date: new Date(session.date),
      })),
    };
  }

  static async getSession(id: string): Promise<Session> {
    const session = await apiFetchSession(id);
    return { ...session, date: new Date(session.date) };
  }

  static async updateSession(id: string, dto: Partial<CreateSessionInput>): Promise<Session> {
    const session = await apiUpdateSession(id, dto);
    return { ...session, date: new Date(session.date) };
  }

  static async createSession(dto: CreateSessionInput): Promise<Session> {
    const session = await apiCreateSession(dto);
    return { ...session, date: new Date(session.date) };
  }
}
