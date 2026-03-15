import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SessionController } from './session/session.controller';
import { SessionService } from './session/session.service';
import { SupabaseModule } from './supabase/supabase.module';
import { SupabaseAuthGuard } from './auth/supabase-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule,
  ],
  controllers: [SessionController],
  providers: [SessionService, SupabaseAuthGuard],
})
export class AppModule {}
