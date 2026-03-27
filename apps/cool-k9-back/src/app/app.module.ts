import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SessionController } from './session/session.controller';
import { SessionService } from './session/session.service';
import { SupabaseModule } from './supabase/supabase.module';
import { SupabaseAuthGuard } from './auth/supabase-auth.guard';
import { DogController } from './dog/dog.controller';
import { DogService } from './dog/dog.service';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: 'apps/cool-k9-back/.env' }),
    SupabaseModule,
  ],
  controllers: [SessionController, DogController, UserController],
  providers: [SessionService, DogService, UserService, SupabaseAuthGuard],
})
export class AppModule {}
