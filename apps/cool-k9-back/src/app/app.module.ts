import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { validateEnv } from './config/env.schema';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { SessionModule } from './features/sessions/session.module';
import { DogModule } from './features/dogs/dog.module';
import { UserModule } from './features/users/user.module';

/**
 * Absolute path to the app's .env, resolved from the bundle location rather than the
 * working directory, so a local run picks it up whatever directory it was started from.
 * The bundle lives in dist/apps/cool-k9-back, so the app source sits three levels up.
 * The file is gitignored and never shipped with the build, as it holds secrets.
 */
const ENV_FILE_PATH = join(__dirname, '..', '..', '..', 'apps', 'cool-k9-back', '.env');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ENV_FILE_PATH,
      validate: validateEnv,
      // In production the platform injects variables into the environment directly,
      // and no .env file is shipped alongside the bundle.
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    // A single global allowance, sized for normal browsing: opening the session list and
    // then a session fires several calls in quick succession. Every named profile listed
    // here is enforced on every route, so a stricter budget must not be declared globally
    // — expensive endpoints override this one with @Throttle instead.
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 100 }]),
    SupabaseModule,
    AuthModule,
    HealthModule,
    SessionModule,
    DogModule,
    UserModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
