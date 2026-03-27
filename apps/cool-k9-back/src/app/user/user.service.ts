import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface AppUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

@Injectable()
export class UserService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getUsers(): Promise<AppUser[]> {
    const { data, error } = await this.supabaseService.admin.auth.admin.listUsers();

    if (error) throw new Error(error.message);

    return (data.users ?? []).map(user => ({
      id: user.id,
      email: user.email ?? '',
      firstName: (user.user_metadata?.['firstName'] as string) ?? '',
      lastName: (user.user_metadata?.['lastName'] as string) ?? '',
    }));
  }
}
