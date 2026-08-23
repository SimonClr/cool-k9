import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { SupabaseService } from '../supabase/supabase.service';

/**
 * Liveness endpoint for the hosting platform and external uptime monitoring.
 *
 * Left unauthenticated so a monitor can reach it, and exempt from rate limiting: a
 * monitor polls on a fixed schedule and would otherwise start tripping the limiter and
 * raising false alarms.
 */
@Controller('health')
@SkipThrottle()
export class HealthController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get()
  async check() {
    // Cheap reachability probe: a head-only count transfers no rows. A full select would
    // turn a once-a-minute health check into recurring load.
    const { error } = await this.supabaseService.admin
      .from('dogs')
      .select('*', { count: 'exact', head: true });

    if (error) {
      // Name the failing dependency, but never echo credentials or the database URL:
      // this endpoint is public.
      throw new ServiceUnavailableException({
        status: 'error',
        dependencies: { supabase: 'unreachable' },
      });
    }

    return {
      status: 'ok',
      dependencies: { supabase: 'ok' },
      timestamp: new Date().toISOString(),
    };
  }
}
