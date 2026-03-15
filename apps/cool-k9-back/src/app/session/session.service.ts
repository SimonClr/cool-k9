import { Injectable, NotFoundException } from '@nestjs/common';
import { Environment, ExerciseType, ObservationStatus, Session, Weather } from '@models';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class SessionService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private mapRow(row: Record<string, unknown>): Session {
    return {
      id: row['id'] as string,
      date: new Date(row['date'] as string),
      dogId: (row['dog_id'] as string | null) ?? undefined,
      dogName: (row['dogs'] as { name: string } | null)?.name ?? '',
      exerciseType: row['exercise_type'] as ExerciseType,
      duration: row['duration'] as number,
      userId: row['user_id'] as string,
      location: (row['location'] as string | null) ?? undefined,
      locationLat: (row['location_lat'] as number | null) ?? undefined,
      locationLon: (row['location_lon'] as number | null) ?? undefined,
      environment: (row['environment'] as Environment | null) ?? undefined,
      weather: (row['weather'] as Weather | null) ?? undefined,
      route: (row['route'] as string | null) ?? undefined,
      previousObjectives: (row['previous_objectives'] as string | null) ?? undefined,
      nextObjectives: (row['next_objectives'] as string | null) ?? undefined,
      ownerObservations: (row['owner_observations'] as string | null) ?? undefined,
      trainerObservations: (row['trainer_observations'] as string | null) ?? undefined,
      observationStatus: (row['observation_status'] as ObservationStatus | null) ?? undefined,
    };
  }

  async getAllSessions(userId: string, exerciseType?: ExerciseType): Promise<Session[]> {
    let query = this.supabaseService.admin
      .from('sessions')
      .select('*, dogs(name)')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (exerciseType) {
      query = query.eq('exercise_type', exerciseType);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    return (data ?? []).map(row => this.mapRow(row as Record<string, unknown>));
  }

  async createSession(userId: string, dto: import('./create-session.dto').CreateSessionDto): Promise<Session> {
    const { data, error } = await this.supabaseService.admin
      .from('sessions')
      .insert({
        user_id: userId,
        date: dto.date,
        dog_id: dto.dogId ?? null,
        exercise_type: dto.exerciseType,
        duration: dto.duration,
        location: dto.location ?? null,
        location_lat: dto.locationLat ?? null,
        location_lon: dto.locationLon ?? null,
        environment: dto.environment ?? null,
        weather: dto.weather ?? null,
        route: dto.route ?? null,
        previous_objectives: dto.previousObjectives ?? null,
        next_objectives: dto.nextObjectives ?? null,
        owner_observations: dto.ownerObservations ?? null,
        trainer_observations: dto.trainerObservations ?? null,
        observation_status: dto.observationStatus ?? null,
      })
      .select('*, dogs(name)')
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Failed to create session');
    return this.mapRow(data as Record<string, unknown>);
  }

  async getSession(userId: string, id: string): Promise<Session> {
    const { data, error } = await this.supabaseService.admin
      .from('sessions')
      .select('*, dogs(name)')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !data) throw new NotFoundException();

    return this.mapRow(data as Record<string, unknown>);
  }
}
