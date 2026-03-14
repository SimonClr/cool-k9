import { ExerciseType, Session } from '@dog-trainer/models';

const API_URL = 'http://localhost:3000/api/sessions';

export class SessionService {
  static async getSessions(
    userId?: string,
    exerciseType?: ExerciseType
  ): Promise<Session[]> {
    const params = new URLSearchParams();

    if (userId) {
      params.set('userId', userId);
    }

    if (exerciseType) {
      params.set('exerciseType', exerciseType);
    }

    const url = params.toString() ? `${API_URL}?${params}` : API_URL;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch sessions');
    }

    const sessions: Session[] = await response.json();

    return sessions.map((session) => ({
      ...session,
      date: new Date(session.date),
    }));
  }
}