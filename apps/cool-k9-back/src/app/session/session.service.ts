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
      userIds: (row['user_ids'] as string[]) ?? [],
      dogIds: (row['dog_ids'] as string[]) ?? [],
      dogNames: (row['dog_names'] as string[]) ?? [],
      exerciseType: row['exercise_type'] as ExerciseType,
      duration: row['duration'] as number,
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

  async getAllSessions(
    userId: string,
    role: string,
    exerciseType?: ExerciseType,
    page = 1,
    perPage = 20,
    userIds?: string[],
    dogIds?: string[],
  ): Promise<{ sessions: Session[]; total: number; page: number; perPage: number }> {
    let query = this.supabaseService.admin
      .from('sessions')
      .select('*', { count: 'exact' })
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (role !== 'admin') {
      query = query.contains('user_ids', [userId]);
    } else if (userIds?.length) {
      query = query.overlaps('user_ids', userIds);
    }

    if (exerciseType) {
      query = query.eq('exercise_type', exerciseType);
    }

    if (dogIds?.length) {
      query = query.overlaps('dog_ids', dogIds);
    }

    const from = (page - 1) * perPage;
    const { data, error, count } = await query.range(from, from + perPage - 1);

    if (error) throw new Error(error.message);

    return {
      sessions: (data ?? []).map(row => this.mapRow(row as Record<string, unknown>)),
      total: count ?? 0,
      page,
      perPage,
    };
  }

  async createSession(dto: import('./create-session.dto').CreateSessionDto): Promise<Session> {
    // Fetch dog names for denormalization
    let dogNames: string[] = [];
    if (dto.dogIds && dto.dogIds.length > 0) {
      const { data: dogsData } = await this.supabaseService.admin
        .from('dogs')
        .select('id, name')
        .in('id', dto.dogIds);
      if (dogsData) {
        dogNames = dto.dogIds.map(id => {
          const dog = (dogsData as { id: string; name: string }[]).find(d => d.id === id);
          return dog?.name ?? '';
        }).filter(Boolean);
      }
    }

    const { data, error } = await this.supabaseService.admin
      .from('sessions')
      .insert({
        user_ids: dto.userIds,
        date: dto.date,
        dog_ids: dto.dogIds ?? [],
        dog_names: dogNames,
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
      .select('*')
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Failed to create session');
    return this.mapRow(data as Record<string, unknown>);
  }

  async getSession(userId: string, role: string, id: string): Promise<Session> {
    let query = this.supabaseService.admin
      .from('sessions')
      .select('*')
      .eq('id', id);

    if (role !== 'admin') {
      query = query.contains('user_ids', [userId]);
    }

    const { data, error } = await query.single();

    if (error || !data) throw new NotFoundException();

    return this.mapRow(data as Record<string, unknown>);
  }
}
