import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../supabase/supabase.module';
import { AuthModule } from '../../auth/auth.module';
import { DogController } from './dog.controller';
import { DogService } from './dog.service';

@Module({
  imports: [SupabaseModule, AuthModule],
  controllers: [DogController],
  providers: [DogService],
})
export class DogModule {}
