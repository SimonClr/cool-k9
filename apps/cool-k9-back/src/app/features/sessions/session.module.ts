import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../supabase/supabase.module';
import { AuthModule } from '../../auth/auth.module';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';

@Module({
  imports: [SupabaseModule, AuthModule],
  controllers: [SessionController],
  providers: [SessionService],
})
export class SessionModule {}
