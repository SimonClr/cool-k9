import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  readonly admin: SupabaseClient;

  constructor() {
    this.admin = createClient(
      process.env['SUPABASE_URL'] as string,
      process.env['SUPABASE_SERVICE_ROLE_KEY'] as string
    );
  }
}
