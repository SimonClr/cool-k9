import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AdminGuard } from './admin.guard';

describe('AdminGuard', () => {
  const guard = new AdminGuard();

  /** Minimal execution context carrying the request the guard inspects. */
  const contextFor = (user?: Record<string, unknown>) =>
    ({
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    }) as unknown as ExecutionContext;

  it('admits a caller carrying the admin role', () => {
    expect(guard.canActivate(contextFor({ userId: 'u-1', role: 'admin' }))).toBe(true);
  });

  it('refuses a caller with no role at all', () => {
    expect(() => guard.canActivate(contextFor({ userId: 'u-1' }))).toThrow(ForbiddenException);
  });

  it('refuses a caller holding a different role', () => {
    expect(() => guard.canActivate(contextFor({ userId: 'u-1', role: 'user' }))).toThrow(
      ForbiddenException
    );
  });

  // The guard runs behind the authentication guard, but must not assume it:
  // an unauthenticated request has to be refused rather than crash.
  it('refuses an unauthenticated request', () => {
    expect(() => guard.canActivate(contextFor(undefined))).toThrow(ForbiddenException);
  });

  it('refuses a role that merely resembles the admin one', () => {
    expect(() => guard.canActivate(contextFor({ userId: 'u-1', role: 'Admin' }))).toThrow(
      ForbiddenException
    );
  });
});
