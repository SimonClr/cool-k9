import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { UserService } from './user.service';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { AdminGuard } from '../../auth/admin.guard';
import { AuthenticatedRequest } from '../../common/authenticated-request.model';

// Authentication is required on every route, but AdminGuard is applied per route:
// the export serves the requester's own data and must stay open to any account.
@Controller('users')
@UseGuards(SupabaseAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Expensive endpoint: a search fetches up to 500 users and filters them in memory, so
  // it overrides the global allowance with a much tighter one. The key must match the
  // globally declared profile name, otherwise this adds a second limit instead of
  // replacing the first.
  @Get()
  @UseGuards(AdminGuard)
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

  // Aggregates the account, its dogs and every session it takes part in, so it is
  // far heavier than a regular read and is deliberately rate-limited: exercising a
  // portability right is an occasional act, not a routine one.
  @Get('me/export')
  @Throttle({ default: { ttl: 60_000, limit: 3 } })
  exportMyData(@Req() req: AuthenticatedRequest) {
    // The identifier comes from the verified token, never from the request, so a
    // caller cannot ask for somebody else's export.
    return this.userService.exportUserData(req.user.userId);
  }
}
