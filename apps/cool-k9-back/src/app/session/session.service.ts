import { Injectable, NotFoundException } from '@nestjs/common';
import { Environment, ExerciseType, ObservationStatus, Session, Weather } from '@models';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class SessionService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private mapRow(row: Record<string, unknown>, userMap?: Map<string, string>): Session {
    const userIds = (row['user_ids'] as string[]) ?? [];
    return {
      id: row['id'] as string,
      date: new Date(row['date'] as string),
      userIds,
      dogIds: (row['dog_ids'] as string[]) ?? [],
      dogNames: (row['dog_names'] as string[]) ?? [],
      userNames: userMap ? userIds.map(id => userMap.get(id) ?? id) : undefined,
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

  private async buildUserMap(userIds: string[]): Promise<Map<string, string>> {
    if (!userIds.length) return new Map();
    const { data } = await this.supabaseService.admin.auth.admin.listUsers({ perPage: 500 });
    const map = new Map<string, string>();
    for (const u of data?.users ?? []) {
      if (!userIds.includes(u.id)) continue;
      const first = (u.user_metadata?.['first_name'] as string) ?? '';
      const last = (u.user_metadata?.['last_name'] as string) ?? '';
      map.set(u.id, `${first} ${last}`.trim() || u.email || u.id);
    }
    return map;
  }

  async getAllSessions(
    userId: string,
    role: string,
    exerciseTypes?: ExerciseType[],
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

    if (exerciseTypes?.length) {
      query = query.in('exercise_type', exerciseTypes);
    }

    if (dogIds?.length) {
      query = query.overlaps('dog_ids', dogIds);
    }

    const from = (page - 1) * perPage;
    const { data, error, count } = await query.range(from, from + perPage - 1);

    if (error) throw new Error(error.message);

    const rows = (data ?? []) as Record<string, unknown>[];
    const allUserIds = [...new Set(rows.flatMap(r => (r['user_ids'] as string[]) ?? []))];
    const userMap = await this.buildUserMap(allUserIds);

    return {
      sessions: rows.map(row => this.mapRow(row, userMap)),
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

    const row = data as Record<string, unknown>;
    const userIds = (row['user_ids'] as string[]) ?? [];
    const userMap = await this.buildUserMap(userIds);
    return this.mapRow(row, userMap);
  }
}
