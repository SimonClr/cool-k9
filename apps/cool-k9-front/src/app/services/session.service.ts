import { ExerciseType, Session } from '@models';
import { supabase } from '@authentication';

const API_URL = 'http://localhost:3000/api/sessions';

async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : {};
}

export class SessionService {
  static async getSessions(exerciseType?: ExerciseType): Promise<Session[]> {
    const params = new URLSearchParams();

    if (exerciseType) {
      params.set('exerciseType', exerciseType);
    }

    const url = params.toString() ? `${API_URL}?${params}` : API_URL;

    const response = await fetch(url, {
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sessions');
    }

    const sessions: Session[] = await response.json();

    return sessions.map((session) => ({
      ...session,
      date: new Date(session.date),
    }));
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
}
