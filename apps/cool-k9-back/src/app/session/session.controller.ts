import { Controller, Get, Param, Query, Request, UseGuards } from '@nestjs/common';
import { SessionService } from './session.service';
import { ExerciseType } from '@models';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string };
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
    return this.sessionService.getAllSessions(req.user.userId, exerciseType);
  }

  @Get(':id')
  getSession(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string
  ) {
    return this.sessionService.getSession(req.user.userId, id);
  }
}
