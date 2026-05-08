import { Injectable } from '@nestjs/common';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User, PaginatedResponse } from '@models';
import { SupabaseService } from '../../supabase/supabase.service';

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
}
