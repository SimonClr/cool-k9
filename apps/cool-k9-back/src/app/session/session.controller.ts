import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { SessionService } from './session.service';
import { CreateSessionDto } from './create-session.dto';
import { ExerciseType } from '@models';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string; role?: string };
}

@Controller('sessions')
@UseGuards(SupabaseAuthGuard)
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  getAllSessions(
    @Request() req: AuthenticatedRequest,
    @Query('exerciseType') exerciseType?: ExerciseType
  ) {
    return this.sessionService.getAllSessions(req.user.userId, req.user.role ?? '', exerciseType);
  }

  @Post()
  @UseGuards(AdminGuard)
  createSession(
    @Body() dto: CreateSessionDto
  ) {
    return this.sessionService.createSession(dto);
  }

  @Get(':id')
  getSession(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string
  ) {
    return this.sessionService.getSession(req.user.userId, req.user.role ?? '', id);
  }
}
