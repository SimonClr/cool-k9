import { Injectable } from '@nestjs/common';
import { ExerciseType } from './session.entity';
import { Session } from '@dog-trainer/models';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class SessionService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getAllSessions(userId: string, exerciseType?: ExerciseType): Promise<Session[]> {
    let query = this.supabaseService.admin
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (exerciseType) {
      query = query.eq('exercise_type', exerciseType);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    return (data ?? []).map((row) => ({
      id: row['id'],
      date: new Date(row['date']),
      dogName: row['dog_name'],
      exerciseType: row['exercise_type'] as ExerciseType,
      duration: row['duration'],
      userId: row['user_id'],
      notes: row['notes'] ?? undefined,
    }));
  }
}
