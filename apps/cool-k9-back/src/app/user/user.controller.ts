import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('users')
@UseGuards(SupabaseAuthGuard, AdminGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getUsers() {
    return this.userService.getUsers();
  }
}
