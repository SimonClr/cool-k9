import { Test } from '@nestjs/testing';
import { ExerciseType } from '@models';
import { SessionService } from '../app/features/sessions/session.service';
import { SupabaseService } from '../app/supabase/supabase.service';
import { createMockSupabase, MockSupabase } from './supabase-service.mock';

/**
 * Exercises the mock against a real service, which is the only way to know it
 * matches the chains the services actually build.
 */
describe('createMockSupabase', () => {
  let supabase: MockSupabase;
  let service: SessionService;

  beforeEach(async () => {
    supabase = createMockSupabase({ data: [], error: null, count: 0 });

    const moduleRef = await Test.createTestingModule({
      providers: [SessionService, { provide: SupabaseService, useValue: supabase.service }],
    }).compile();

    service = moduleRef.get(SessionService);
  });

  it('resolves a chain that ends on range()', async () => {
    const result = await service.getAllSessions('user-1', 'user');

    expect(result.data).toEqual([]);
    expect(supabase.tables).toContain('sessions');
    expect(supabase.wasCalled('range')).toBe(true);
  });

  it('records the arguments of each builder call', async () => {
    await service.getAllSessions('user-1', 'user', [ExerciseType.INITIATION]);

    expect(supabase.wasCalledWith('in', 'exercise_type', [ExerciseType.INITIATION])).toBe(true);
  });

  it('resolves a chain that ends on single()', async () => {
    supabase.setResult({
      data: { id: 'session-1', user_ids: ['user-1'], date: '2026-01-01T10:00:00Z' },
      error: null,
    });

    const session = await service.getSession('user-1', 'user', 'session-1');

    expect(session.id).toBe('session-1');
    expect(supabase.wasCalledWith('eq', 'id', 'session-1')).toBe(true);
  });

  it('serves queued results to a service that queries twice', async () => {
    supabase.queueResults([
      { data: [{ id: 'dog-1', name: 'Rex' }], error: null },
      { data: { id: 'session-1', user_ids: ['user-1'], dog_names: ['Rex'], date: '2026-01-01T10:00:00Z' }, error: null },
    ]);

    const session = await service.createSession('user-1', {
      userIds: ['user-1'],
      date: '2026-01-01T10:00:00Z',
      dogIds: ['dog-1'],
      exerciseType: ExerciseType.INITIATION,
      duration: 60,
    } as never);

    expect(session.dogNames).toEqual(['Rex']);
    expect(supabase.tables).toEqual(['dogs', 'sessions']);
  });

  it('exposes users to the listUsers path', async () => {
    supabase.setUsers([
      { id: 'user-1', user_metadata: { first_name: 'Ada', last_name: 'Lovelace' } },
    ]);
    supabase.setResult({
      data: { id: 'session-1', user_ids: ['user-1'], date: '2026-01-01T10:00:00Z' },
      error: null,
    });

    const session = await service.getSession('user-1', 'admin', 'session-1');

    expect(session.userNames).toEqual(['Ada Lovelace']);
  });
});
