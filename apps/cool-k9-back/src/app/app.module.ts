import { Module } from '@nestjs/common';
import { SessionController } from './session/session.controller';
import { SessionService } from './session/session.service';

@Module({
  imports: [],
  controllers: [SessionController],
  providers: [SessionService],
})
export class AppModule {}
