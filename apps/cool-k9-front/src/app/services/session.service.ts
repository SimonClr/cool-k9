import { ExerciseType, Session } from '@models';

export type CreateSessionInput = Omit<Session, 'id' | 'dogNames' | 'dogIds'> & { dogIds?: string[] };
import { supabase } from '@authentication';

const API_URL = 'http://localhost:3000/api/sessions';

async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : {};
}

export interface SessionsPage {
  sessions: Session[];
  total: number;
  page: number;
  perPage: number;
}

export class SessionService {
  static async getSessions(params?: {
    exerciseTypes?: ExerciseType[];
    page?: number;
    perPage?: number;
    userIds?: string[];
    dogIds?: string[];
  }): Promise<SessionsPage> {
    const query = new URLSearchParams();

    if (params?.exerciseTypes?.length) query.set('exerciseTypes', params.exerciseTypes.join(','));
    if (params?.page != null) query.set('page', String(params.page));
    if (params?.perPage != null) query.set('perPage', String(params.perPage));
    if (params?.userIds?.length) query.set('userIds', params.userIds.join(','));
    if (params?.dogIds?.length) query.set('dogIds', params.dogIds.join(','));

    const url = query.toString() ? `${API_URL}?${query}` : API_URL;

    const response = await fetch(url, {
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sessions');
    }

    const result: SessionsPage = await response.json();

    return {
      ...result,
      sessions: result.sessions.map(session => ({
        ...session,
        date: new Date(session.date),
      })),
    };
  }

  static async getSession(id: string): Promise<Session> {
    const response = await fetch(`${API_URL}/${id}`, {
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch session');
    }

    const session: Session = await response.json();
    return { ...session, date: new Date(session.date) };
  }

  static async updateSession(id: string, dto: Partial<CreateSessionInput>): Promise<Session> {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: { ...(await getAuthHeaders()), 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      throw new Error('Failed to update session');
    }

    const session: Session = await response.json();
    return { ...session, date: new Date(session.date) };
  }

  static async createSession(dto: CreateSessionInput): Promise<Session> {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { ...(await getAuthHeaders()), 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      throw new Error('Failed to create session');
    }

    const session: Session = await response.json();
    return { ...session, date: new Date(session.date) };
  }
}
