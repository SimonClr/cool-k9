import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { SessionService } from './session.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { ExerciseType } from '@models';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { AdminGuard } from '../../auth/admin.guard';

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
    @Query('exerciseTypes') exerciseTypesRaw?: string,
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('userIds') userIdsRaw?: string,
    @Query('dogIds') dogIdsRaw?: string,
  ) {
    return this.sessionService.getAllSessions(
      req.user.userId,
      req.user.role ?? '',
      exerciseTypesRaw ? (exerciseTypesRaw.split(',').filter(Boolean) as ExerciseType[]) : undefined,
      page ? parseInt(page, 10) : undefined,
      perPage ? parseInt(perPage, 10) : undefined,
      userIdsRaw ? userIdsRaw.split(',').filter(Boolean) : undefined,
      dogIdsRaw ? dogIdsRaw.split(',').filter(Boolean) : undefined,
    );
  }

  @Post()
  @UseGuards(AdminGuard)
  createSession(
    @Body() dto: CreateSessionDto
  ) {
    return this.sessionService.createSession(dto);
  }

  @Patch(':id')
  updateSession(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateSessionDto,
  ) {
    return this.sessionService.updateSession(req.user.userId, req.user.role ?? '', id, dto);
  }

  @Get(':id')
  getSession(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string
  ) {
    return this.sessionService.getSession(req.user.userId, req.user.role ?? '', id);
  }
}
