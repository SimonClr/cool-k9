import { Injectable, NotFoundException } from '@nestjs/common';
import { User as SupabaseUser } from '@supabase/supabase-js';
import {
  ExportedDog,
  ExportedSession,
  PaginatedResponse,
  User,
  UserDataExport,
} from '@models';
import { SupabaseService } from '../../supabase/supabase.service';

/** Bumped whenever the shape of the export document changes. */
const EXPORT_FORMAT_VERSION = '1.0';

/** Supabase caps a single range at 1000 rows; sessions are paged through in slices of this size. */
const EXPORT_PAGE_SIZE = 500;

interface GetUsersParams {
  search?: string;
  page?: number;
  perPage?: number;
}

function mapUser(user: SupabaseUser): User {
  return {
    id: user.id,
    email: user.email ?? '',
    firstName: (user.user_metadata?.['first_name'] as string) ?? '',
    lastName: (user.user_metadata?.['last_name'] as string) ?? '',
  };
}

@Injectable()
export class UserService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getUsers({ search, page = 1, perPage = 20 }: GetUsersParams = {}): Promise<PaginatedResponse<User>> {
    if (search) {
      // Supabase Admin API has no text search — fetch a large batch and filter in-memory
      const { data, error } = await this.supabaseService.admin.auth.admin.listUsers({
        page: 1,
        perPage: 500,
      });
      if (error) throw new Error(error.message);

      const q = search.toLowerCase();
      const matched = (data.users ?? []).filter(
        u =>
          u.email?.toLowerCase().includes(q) ||
          (u.user_metadata?.['first_name'] as string | undefined)?.toLowerCase().includes(q) ||
          (u.user_metadata?.['last_name'] as string | undefined)?.toLowerCase().includes(q),
      );

      const start = (page - 1) * perPage;
      return {
        data: matched.slice(start, start + perPage).map(mapUser),
        total: matched.length,
        page,
        perPage,
      };
    }

    // No search → native Supabase pagination
    const { data, error } = await this.supabaseService.admin.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error) throw new Error(error.message);

    return {
      data: (data.users ?? []).map(mapUser),
      total: (data as unknown as { total?: number }).total ?? 0,
      page,
      perPage,
    };
  }

  /**
   * Everything held about one user, for the GDPR portability right.
   *
   * Scope is the requester alone: sessions are exported as the activity they
   * document, stripped of the other participants' identifiers and names. Only
   * how many others took part is disclosed, which says nothing about who they are.
   */
  async exportUserData(userId: string): Promise<UserDataExport> {
    const { data: userData, error: userError } =
      await this.supabaseService.admin.auth.admin.getUserById(userId);
    if (userError || !userData?.user) throw new NotFoundException('User not found');

    const user = userData.user;
    const metadata = user.user_metadata ?? {};

    const [dogs, sessions] = await Promise.all([
      this.exportDogs(userId),
      this.exportSessions(userId),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      formatVersion: EXPORT_FORMAT_VERSION,
      account: {
        email: user.email ?? '',
        firstName: (metadata['first_name'] as string) ?? '',
        lastName: (metadata['last_name'] as string) ?? '',
        createdAt: user.created_at ?? null,
        lastSignInAt: user.last_sign_in_at ?? null,
      },
      consent: {
        acceptedAt: (metadata['terms_accepted_at'] as string) ?? null,
        documentsVersion: (metadata['terms_version'] as string) ?? null,
      },
      preferences: {
        // Announced by the privacy policy as a collected category: the theme is
        // saved on the account, not merely in the browser.
        theme: (metadata['theme'] as string) ?? null,
      },
      dogs,
      sessions,
    };
  }

  private async exportDogs(userId: string): Promise<ExportedDog[]> {
    const { data, error } = await this.supabaseService.admin
      .from('dogs')
      .select('name, birth_date, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);

    return (data ?? []).map(row => ({
      name: row['name'],
      birthDate: row['birth_date'],
      createdAt: row['created_at'],
    }));
  }

  private async exportSessions(userId: string): Promise<ExportedSession[]> {
    const sessions: ExportedSession[] = [];

    // An export must be exhaustive, so every page is walked rather than the
    // first one only. The loop stops on a short page, which is the last one.
    for (let page = 0; ; page++) {
      const from = page * EXPORT_PAGE_SIZE;
      const { data, error } = await this.supabaseService.admin
        .from('sessions')
        .select('*')
        .contains('user_ids', [userId])
        .order('date', { ascending: true })
        .range(from, from + EXPORT_PAGE_SIZE - 1);

      if (error) throw new Error(error.message);

      const rows = (data ?? []) as Record<string, unknown>[];
      sessions.push(...rows.map(row => this.mapSessionForExport(row, userId)));

      if (rows.length < EXPORT_PAGE_SIZE) break;
    }

    return sessions;
  }

  private mapSessionForExport(row: Record<string, unknown>, userId: string): ExportedSession {
    const participants = (row['user_ids'] as string[]) ?? [];

    return {
      date: row['date'] as string,
      exerciseType: row['exercise_type'] as string,
      duration: row['duration'] as number,
      dogNames: (row['dog_names'] as string[]) ?? [],
      location: (row['location'] as string | null) ?? null,
      locationLat: (row['location_lat'] as number | null) ?? null,
      locationLon: (row['location_lon'] as number | null) ?? null,
      environment: (row['environment'] as string | null) ?? null,
      weather: (row['weather'] as string | null) ?? null,
      route: (row['route'] as string | null) ?? null,
      previousObjectives: (row['previous_objectives'] as string | null) ?? null,
      nextObjectives: (row['next_objectives'] as string | null) ?? null,
      ownerObservations: (row['owner_observations'] as string | null) ?? null,
      trainerObservations: (row['trainer_observations'] as string | null) ?? null,
      otherParticipantCount: participants.filter(id => id !== userId).length,
    };
  }
}
