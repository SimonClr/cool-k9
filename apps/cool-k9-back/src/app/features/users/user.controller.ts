import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { UserService } from './user.service';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { AdminGuard } from '../../auth/admin.guard';

@Controller('users')
@UseGuards(SupabaseAuthGuard, AdminGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Expensive endpoint: a search fetches up to 500 users and filters them in memory, so
  // it overrides the global allowance with a much tighter one. The key must match the
  // globally declared profile name, otherwise this adds a second limit instead of
  // replacing the first.
  @Get()
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  getUsers(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
  ) {
    return this.userService.getUsers({
      search,
      page: page ? parseInt(page, 10) : undefined,
      perPage: perPage ? parseInt(perPage, 10) : undefined,
    });
  }
}
