import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Test } from '@nestjs/testing';
import { SupabaseAuthGuard } from '../app/auth/supabase-auth.guard';

/** The three callers every protected endpoint has to tell apart. */
export type Profile =
  | { kind: 'anonymous' }
  | { kind: 'user'; userId?: string }
  | { kind: 'admin'; userId?: string };

export const anonymous = (): Profile => ({ kind: 'anonymous' });
export const asUser = (userId = 'user-1'): Profile => ({ kind: 'user', userId });
export const asAdmin = (userId = 'admin-1'): Profile => ({ kind: 'admin', userId });

/**
 * Stands in for `SupabaseAuthGuard`.
 *
 * The real guard calls the remote authentication service, which would make these
 * tests need a live token and network access. Replacing it keeps the behaviour that
 * matters here — reject when unauthenticated, otherwise attach the identity that the
 * downstream `AdminGuard` and the controllers read — and drops the network.
 *
 * The guard's own logic is covered separately in `supabase-auth.guard.spec.ts`.
 */
class StubAuthGuard implements CanActivate {
  constructor(private readonly profile: Profile) {}

  canActivate(context: ExecutionContext): boolean {
    // Mirrors the real guard, which throws rather than returning false: returning
    // false would answer 403, and the tests would then assert a status the running
    // application never produces for a missing token.
    if (this.profile.kind === 'anonymous') {
      throw new UnauthorizedException('Missing authorization token');
    }

    const request = context.switchToHttp().getRequest();
    request.user = {
      userId: this.profile.userId,
      email: `${this.profile.userId}@example.com`,
      role: this.profile.kind === 'admin' ? 'admin' : 'user',
    };
    return true;
  }
}

/** Always-open guard, so the rate limiter never interferes with these tests. */
class AllowAllGuard implements CanActivate {
  canActivate(): boolean {
    return true;
  }
}

export interface ApiTestAppOptions {
  /** Controllers under test. */
  controllers: unknown[];
  /** Providers the controllers depend on, already stubbed. */
  providers?: unknown[];
  /** Caller the request is issued as. */
  profile: Profile;
}

/**
 * Boots a Nest application around the given controllers.
 *
 * The global `ValidationPipe` is registered here with the very same options as
 * `main.ts`. It is configured on the application rather than in `AppModule`, so a
 * test module alone would not have it and the validation tests would pass without
 * ever exercising validation.
 */
export async function createApiTestApp({
  controllers,
  providers = [],
  profile,
}: ApiTestAppOptions): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    controllers: controllers as never[],
    providers: [
      ...(providers as never[]),
      // The throttler is a global guard in AppModule; neutralise it so a test run
      // cannot trip the limit and start returning 429 instead of what is asserted.
      { provide: APP_GUARD, useClass: AllowAllGuard },
    ],
  })
    .overrideGuard(SupabaseAuthGuard)
    .useValue(new StubAuthGuard(profile))
    .overrideGuard(ThrottlerGuard)
    .useClass(AllowAllGuard)
    .compile();

  const app = moduleRef.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  await app.init();
  return app;
}
