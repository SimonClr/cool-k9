import { Controller, Get, Query } from '@nestjs/common';
import { SessionService } from './session.service';
import { Session, ExerciseType } from './session.entity';

@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  getAllSessions(
    @Query('userId') userId: string,
    @Query('exerciseType') exerciseType?: ExerciseType
  ): Session[] {
    // For now, using a hardcoded userId until authentication is implemented
    const currentUserId = userId || 'user1';
    return this.sessionService.getAllSessions(currentUserId, exerciseType);
  }
}