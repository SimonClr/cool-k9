import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { SessionModule } from './features/sessions/session.module';
import { DogModule } from './features/dogs/dog.module';
import { UserModule } from './features/users/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: 'apps/cool-k9-back/.env' }),
    SupabaseModule,
    AuthModule,
    SessionModule,
    DogModule,
    UserModule,
  ],
})
export class AppModule {}
