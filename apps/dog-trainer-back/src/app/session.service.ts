import { Injectable } from '@nestjs/common';
import { Session, ExerciseType } from './session.entity';

@Injectable()
export class SessionService {
  private sessions: Session[] = [
    {
      id: '1',
      date: new Date('2025-01-10T10:00:00'),
      dogName: 'Max',
      exerciseType: ExerciseType.OBEDIENCE,
      duration: 30,
      userId: 'user1',
      notes: 'Excellent progress on sit and stay commands',
    },
    {
      id: '2',
      date: new Date('2025-01-12T14:30:00'),
      dogName: 'Bella',
      exerciseType: ExerciseType.AGILITY,
      duration: 45,
      userId: 'user1',
      notes: 'First agility session, very enthusiastic',
    },
    {
      id: '3',
      date: new Date('2025-01-13T09:00:00'),
      dogName: 'Max',
      exerciseType: ExerciseType.RECALL,
      duration: 20,
      userId: 'user1',
      notes: 'Working on distance recall',
    },
    {
      id: '4',
      date: new Date('2025-01-14T16:00:00'),
      dogName: 'Charlie',
      exerciseType: ExerciseType.SOCIALIZATION,
      duration: 60,
      userId: 'user1',
      notes: 'Park visit with other dogs',
    },
    {
      id: '5',
      date: new Date('2025-01-15T11:00:00'),
      dogName: 'Bella',
      exerciseType: ExerciseType.TRICKS,
      duration: 25,
      userId: 'user1',
      notes: 'Learning to roll over',
    },
    {
      id: '6',
      date: new Date('2025-01-16T10:00:00'),
      dogName: 'Max',
      exerciseType: ExerciseType.LEASH_TRAINING,
      duration: 35,
      userId: 'user1',
      notes: 'Loose leash walking practice',
    },
  ];

  getAllSessions(userId: string, exerciseType?: ExerciseType): Session[] {
    let filteredSessions = this.sessions.filter(
      (session) => session.userId === userId
    );

    if (exerciseType) {
      filteredSessions = filteredSessions.filter(
        (session) => session.exerciseType === exerciseType
      );
    }

    return filteredSessions.sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );
  }

  getSessionById(id: string): Session | undefined {
    return this.sessions.find((session) => session.id === id);
  }

  createSession(session: Omit<Session, 'id'>): Session {
    const newSession: Session = {
      ...session,
      id: (this.sessions.length + 1).toString(),
      date: new Date(session.date),
    };
    this.sessions.push(newSession);
    return newSession;
  }
}