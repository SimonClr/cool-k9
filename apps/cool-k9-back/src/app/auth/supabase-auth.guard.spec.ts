import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { SupabaseService } from '../supabase/supabase.service';
import { createMockSupabase, MockSupabase } from '../../testing/supabase-service.mock';
import { SupabaseAuthGuard } from './supabase-auth.guard';

describe('SupabaseAuthGuard', () => {
  let supabase: MockSupabase;
  let guard: SupabaseAuthGuard;

  /** Minimal execution context carrying just the request the guard reads and writes. */
  const contextFor = (headers: Record<string, string>) => {
    const request = { headers } as unknown as Record<string, unknown>;
    return {
      context: {
        switchToHttp: () => ({ getRequest: () => request }),
      } as unknown as ExecutionContext,
      request,
    };
  };

  beforeEach(async () => {
    supabase = createMockSupabase();
    const moduleRef = await Test.createTestingModule({
      providers: [SupabaseAuthGuard, { provide: SupabaseService, useValue: supabase.service }],
    }).compile();
    guard = moduleRef.get(SupabaseAuthGuard);
  });

  describe('missing token', () => {
    it('rejects a request with no authorization header', async () => {
      const { context } = contextFor({});

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('rejects a header that does not carry a bearer token', async () => {
      const { context } = contextFor({ authorization: 'Basic dXNlcjpwYXNz' });

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('does not call the authentication service when no token is present', async () => {
      const { context } = contextFor({});

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      expect(supabase.wasCalled('getUser')).toBe(false);
    });
  });

  describe('invalid token', () => {
    it('rejects a token the authentication service refuses', async () => {
      supabase.setAuthUser({ data: { user: null }, error: { message: 'jwt expired' } });
      const { context } = contextFor({ authorization: 'Bearer expired-token' });

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('rejects a token that resolves to no user', async () => {
      supabase.setAuthUser({ data: { user: null }, error: null });
      const { context } = contextFor({ authorization: 'Bearer stale-token' });

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('forwards the bare token, without the scheme prefix', async () => {
      supabase.setAuthUser({ data: { user: null }, error: { message: 'jwt expired' } });
      const { context } = contextFor({ authorization: 'Bearer abc.def.ghi' });

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      expect(supabase.tokens).toEqual(['abc.def.ghi']);
    });

    it('leaves the request unauthenticated when the token is refused', async () => {
      supabase.setAuthUser({ data: { user: null }, error: { message: 'jwt expired' } });
      const { context, request } = contextFor({ authorization: 'Bearer expired-token' });

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      expect(request['user']).toBeUndefined();
    });
  });

  describe('valid token', () => {
    it('admits the request', async () => {
      supabase.setAuthUser({
        data: { user: { id: 'u-1', email: 'ada@example.com', app_metadata: {} } },
        error: null,
      });
      const { context } = contextFor({ authorization: 'Bearer good-token' });

      await expect(guard.canActivate(context)).resolves.toBe(true);
    });

    it('records the authenticated identity on the request', async () => {
      supabase.setAuthUser({
        data: { user: { id: 'u-1', email: 'ada@example.com', app_metadata: {} } },
        error: null,
      });
      const { context, request } = contextFor({ authorization: 'Bearer good-token' });

      await guard.canActivate(context);

      expect(request['user']).toMatchObject({ userId: 'u-1', email: 'ada@example.com' });
    });

    it('carries the role over from the custom claim', async () => {
      // The role lives under `app_role`: GoTrue reserves `role` itself.
      supabase.setAuthUser({
        data: { user: { id: 'u-9', email: 'boss@example.com', app_metadata: { app_role: 'admin' } } },
        error: null,
      });
      const { context, request } = contextFor({ authorization: 'Bearer admin-token' });

      await guard.canActivate(context);

      expect((request['user'] as { role?: string }).role).toBe('admin');
    });

    it('leaves the role undefined when the claim is absent', async () => {
      supabase.setAuthUser({
        data: { user: { id: 'u-1', email: 'ada@example.com', app_metadata: {} } },
        error: null,
      });
      const { context, request } = contextFor({ authorization: 'Bearer good-token' });

      await guard.canActivate(context);

      expect((request['user'] as { role?: string }).role).toBeUndefined();
    });

    it('falls back to an empty email when the account has none', async () => {
      supabase.setAuthUser({
        data: { user: { id: 'u-3', app_metadata: {} } },
        error: null,
      });
      const { context, request } = contextFor({ authorization: 'Bearer good-token' });

      await guard.canActivate(context);

      expect((request['user'] as { email: string }).email).toBe('');
    });
  });
});
