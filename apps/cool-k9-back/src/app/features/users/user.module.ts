import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../supabase/supabase.module';
import { AuthModule } from '../../auth/auth.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [SupabaseModule, AuthModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
