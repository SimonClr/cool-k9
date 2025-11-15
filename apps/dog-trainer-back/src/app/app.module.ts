import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';

@Module({
  imports: [],
  controllers: [AppController, SessionController],
  providers: [AppService, SessionService],
})
export class AppModule {}
