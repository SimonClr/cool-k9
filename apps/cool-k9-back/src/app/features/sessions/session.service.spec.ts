import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ExerciseType, ObservationStatus } from '@models';
import { SupabaseService } from '../../supabase/supabase.service';
import {
  createMockSupabase,
  MockSupabase,
  SupabaseResult,
} from '../../../testing/supabase-service.mock';
import { SessionService } from './session.service';

describe('SessionService', () => {
  let supabase: MockSupabase;
  let service: SessionService;

  const build = async (initial: SupabaseResult = { data: [], error: null, count: 0 }) => {
    supabase = createMockSupabase(initial);
    const moduleRef = await Test.createTestingModule({
      providers: [SessionService, { provide: SupabaseService, useValue: supabase.service }],
    }).compile();
    service = moduleRef.get(SessionService);
  };

  beforeEach(() => build());

  describe('role filtering', () => {
    // The filter is invisible in the result — the stubbed rows come back either way —
    // so the assertion is on the query that was built.
    it('restricts a regular user to the sessions they take part in', async () => {
      await service.getAllSessions('user-1', 'user');

      expect(supabase.wasCalledWith('contains', 'user_ids', ['user-1'])).toBe(true);
    });

    it('does not restrict an admin to their own sessions', async () => {
      await service.getAllSessions('admin-1', 'admin');

      expect(supabase.wasCalled('contains')).toBe(false);
    });

    it('lets an admin narrow the list to chosen users instead', async () => {
      await service.getAllSessions('admin-1', 'admin', undefined, 1, 20, ['user-7']);

      expect(supabase.wasCalledWith('overlaps', 'user_ids', ['user-7'])).toBe(true);
      expect(supabase.wasCalled('contains')).toBe(false);
    });

    it('applies the participant restriction when reading a single session as a user', async () => {
      supabase.setResult({ data: { id: 's-1', user_ids: ['user-1'] }, error: null });

      await service.getSession('user-1', 'user', 's-1');

      expect(supabase.wasCalledWith('contains', 'user_ids', ['user-1'])).toBe(true);
    });

    it('omits the participant restriction when reading a single session as an admin', async () => {
      supabase.setResult({ data: { id: 's-1', user_ids: ['user-1'] }, error: null });

      await service.getSession('admin-1', 'admin', 's-1');

      expect(supabase.wasCalled('contains')).toBe(false);
    });

    it('hides trainer observations from an owner who has not submitted their own', async () => {
      supabase.setResult({
        data: {
          id: 's-1',
          user_ids: ['user-1'],
          trainer_observations: 'Secret',
          observation_status: ObservationStatus.WAITING_OWNER,
        },
        error: null,
      });

      const session = await service.getSession('user-1', 'user', 's-1');

      expect(session.trainerObservations).toBeUndefined();
    });

    it('shows trainer observations to an admin regardless of status', async () => {
      supabase.setResult({
        data: {
          id: 's-1',
          user_ids: ['user-1'],
          trainer_observations: 'Secret',
          observation_status: ObservationStatus.WAITING_OWNER,
        },
        error: null,
      });

      const session = await service.getSession('admin-1', 'admin', 's-1');

      expect(session.trainerObservations).toBe('Secret');
    });
  });

  describe('row mapping', () => {
    it('maps every populated column onto its model field', async () => {
      await build({
        data: [
          {
            id: 's-1',
            date: '2026-01-15T09:30:00Z',
            user_ids: ['user-1'],
            dog_ids: ['dog-1'],
            dog_names: ['Rex'],
            exercise_type: ExerciseType.EDUCATION,
            duration: 45,
            location: 'Parc',
            location_lat: 48.85,
            location_lon: 2.35,
            environment: 'OUTDOOR',
            weather: 'SUNNY',
            route: 'Boucle nord',
            previous_objectives: 'Rappel',
            next_objectives: 'Marche en laisse',
            owner_observations: 'Bonne séance',
            trainer_observations: 'À revoir',
            observation_status: ObservationStatus.COMPLETE,
          },
        ],
        error: null,
        count: 1,
      });

      const { data } = await service.getAllSessions('admin-1', 'admin');

      expect(data[0]).toMatchObject({
        id: 's-1',
        date: new Date('2026-01-15T09:30:00Z'),
        userIds: ['user-1'],
        dogIds: ['dog-1'],
        dogNames: ['Rex'],
        exerciseType: ExerciseType.EDUCATION,
        duration: 45,
        location: 'Parc',
        locationLat: 48.85,
        locationLon: 2.35,
        route: 'Boucle nord',
        previousObjectives: 'Rappel',
        nextObjectives: 'Marche en laisse',
        ownerObservations: 'Bonne séance',
        trainerObservations: 'À revoir',
        observationStatus: ObservationStatus.COMPLETE,
      });
    });

    it('turns null optional columns into undefined rather than null', async () => {
      await build({
        data: [
          {
            id: 's-1',
            date: '2026-01-15T09:30:00Z',
            user_ids: ['user-1'],
            location: null,
            location_lat: null,
            location_lon: null,
            environment: null,
            weather: null,
            route: null,
            previous_objectives: null,
            next_objectives: null,
            owner_observations: null,
            trainer_observations: null,
            observation_status: null,
          },
        ],
        error: null,
        count: 1,
      });

      const { data } = await service.getAllSessions('admin-1', 'admin');

      expect(data[0].location).toBeUndefined();
      expect(data[0].locationLat).toBeUndefined();
      expect(data[0].environment).toBeUndefined();
      expect(data[0].weather).toBeUndefined();
      expect(data[0].route).toBeUndefined();
      expect(data[0].ownerObservations).toBeUndefined();
      expect(data[0].observationStatus).toBeUndefined();
    });

    it('defaults absent array columns to empty arrays', async () => {
      await build({
        data: [{ id: 's-1', date: '2026-01-15T09:30:00Z' }],
        error: null,
        count: 1,
      });

      const { data } = await service.getAllSessions('admin-1', 'admin');

      expect(data[0].userIds).toEqual([]);
      expect(data[0].dogIds).toEqual([]);
      expect(data[0].dogNames).toEqual([]);
    });

    it('resolves participant identifiers to display names', async () => {
      await build({
        data: [{ id: 's-1', date: '2026-01-15T09:30:00Z', user_ids: ['user-1', 'user-2'] }],
        error: null,
        count: 1,
      });
      supabase.setUsers([
        { id: 'user-1', user_metadata: { first_name: 'Ada', last_name: 'Lovelace' } },
        { id: 'user-2', email: 'grace@example.com', user_metadata: {} },
      ]);

      const { data } = await service.getAllSessions('admin-1', 'admin');

      // Falls back to the email when no name is recorded.
      expect(data[0].userNames).toEqual(['Ada Lovelace', 'grace@example.com']);
    });
  });

  describe('pagination', () => {
    it('requests the first page as the range starting at zero', async () => {
      await service.getAllSessions('admin-1', 'admin', undefined, 1, 20);

      expect(supabase.wasCalledWith('range', 0, 19)).toBe(true);
    });

    it('offsets the range by the pages already passed', async () => {
      await service.getAllSessions('admin-1', 'admin', undefined, 3, 20);

      expect(supabase.wasCalledWith('range', 40, 59)).toBe(true);
    });

    it('sizes the range from the requested page size', async () => {
      await service.getAllSessions('admin-1', 'admin', undefined, 2, 5);

      expect(supabase.wasCalledWith('range', 5, 9)).toBe(true);
    });

    it('echoes the paging parameters and the total count back to the caller', async () => {
      await build({ data: [], error: null, count: 137 });

      const result = await service.getAllSessions('admin-1', 'admin', undefined, 4, 10);

      expect(result).toMatchObject({ total: 137, page: 4, perPage: 10 });
    });
  });

  describe('updateSession', () => {
    const existing = (over: Record<string, unknown> = {}) => ({
      id: 's-1',
      user_ids: ['user-1'],
      date: '2026-01-15T09:30:00Z',
      ...over,
    });

    describe('access check', () => {
      it('restricts the ownership check to a participant for a regular user', async () => {
        await build({ data: existing(), error: null });

        await service.updateSession('user-1', 'user', 's-1', { ownerObservations: 'RAS' });

        expect(supabase.wasCalledWith('contains', 'user_ids', ['user-1'])).toBe(true);
      });

      it('omits the participant restriction for an admin', async () => {
        await build({ data: existing(), error: null });

        await service.updateSession('admin-1', 'admin', 's-1', { duration: 30 });

        expect(supabase.wasCalled('contains')).toBe(false);
      });

      it('reports a session the caller cannot reach as not found', async () => {
        await build({ data: null, error: { message: 'no rows' } });

        await expect(
          service.updateSession('user-9', 'user', 's-1', { ownerObservations: 'RAS' })
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('as a regular user', () => {
      // The payload is rebuilt from scratch rather than merged, so a field the
      // owner is not allowed to touch cannot reach the update at all.
      it('writes the owner observations and nothing else', async () => {
        await build({ data: existing(), error: null });

        await service.updateSession('user-1', 'user', 's-1', {
          ownerObservations: 'Bonne séance',
          duration: 999,
          trainerObservations: 'injecté',
        } as never);

        const update = supabase.calls.find(call => call.method === 'update');
        expect(update?.args[0]).toEqual({ owner_observations: 'Bonne séance' });
      });

      it('ignores an attempt to set the exercise type or the participants', async () => {
        await build({ data: existing(), error: null });

        await service.updateSession('user-1', 'user', 's-1', {
          ownerObservations: 'RAS',
          exerciseType: ExerciseType.RECHERCHE_PERSONNE,
          userIds: ['user-1', 'intrus'],
        } as never);

        const update = supabase.calls.find(call => call.method === 'update');
        expect(update?.args[0]).not.toHaveProperty('exercise_type');
        expect(update?.args[0]).not.toHaveProperty('user_ids');
      });

      it('completes the exchange when the trainer had already written', async () => {
        await build({
          data: existing({
            trainer_observations: 'Déjà écrit',
            observation_status: ObservationStatus.WAITING_OWNER,
          }),
          error: null,
        });

        await service.updateSession('user-1', 'user', 's-1', { ownerObservations: 'Ma part' });

        const update = supabase.calls.find(call => call.method === 'update');
        expect(update?.args[0]).toMatchObject({
          observation_status: ObservationStatus.COMPLETE,
        });
      });

      it('hands the turn to the trainer when they had not written yet', async () => {
        await build({
          data: existing({
            trainer_observations: null,
            observation_status: ObservationStatus.WAITING_OWNER,
          }),
          error: null,
        });

        await service.updateSession('user-1', 'user', 's-1', { ownerObservations: 'Ma part' });

        const update = supabase.calls.find(call => call.method === 'update');
        expect(update?.args[0]).toMatchObject({
          observation_status: ObservationStatus.WAITING_TRAINER,
        });
      });

      it('leaves the status alone when the session was not awaiting the owner', async () => {
        await build({
          data: existing({ observation_status: ObservationStatus.WAITING_TRAINER }),
          error: null,
        });

        await service.updateSession('user-1', 'user', 's-1', { ownerObservations: 'Ma part' });

        const update = supabase.calls.find(call => call.method === 'update');
        expect(update?.args[0]).not.toHaveProperty('observation_status');
      });

      it('leaves the status alone when the owner clears their observations', async () => {
        await build({
          data: existing({ observation_status: ObservationStatus.WAITING_OWNER }),
          error: null,
        });

        await service.updateSession('user-1', 'user', 's-1', { ownerObservations: null } as never);

        const update = supabase.calls.find(call => call.method === 'update');
        expect(update?.args[0]).toEqual({ owner_observations: null });
      });
    });

    describe('as an admin', () => {
      it('writes only the fields actually supplied', async () => {
        await build({ data: existing(), error: null });

        await service.updateSession('admin-1', 'admin', 's-1', { duration: 45 });

        const update = supabase.calls.find(call => call.method === 'update');
        expect(update?.args[0]).toEqual({ duration: 45 });
      });

      it('never writes the owner observations, which belong to the owner', async () => {
        await build({ data: existing(), error: null });

        await service.updateSession('admin-1', 'admin', 's-1', {
          duration: 45,
          ownerObservations: 'écrit par le dresseur',
        } as never);

        const update = supabase.calls.find(call => call.method === 'update');
        expect(update?.args[0]).not.toHaveProperty('owner_observations');
      });

      it('clears a nullable field that was explicitly set to null', async () => {
        await build({ data: existing(), error: null });

        await service.updateSession('admin-1', 'admin', 's-1', { location: null } as never);

        const update = supabase.calls.find(call => call.method === 'update');
        expect(update?.args[0]).toEqual({ location: null });
      });

      it('refreshes the denormalised dog names when the dogs change', async () => {
        supabase = createMockSupabase();
        supabase.queueResults([
          { data: existing(), error: null },
          { data: [{ id: 'dog-1', name: 'Rex' }], error: null },
          { data: existing({ dog_ids: ['dog-1'], dog_names: ['Rex'] }), error: null },
        ]);
        const moduleRef = await Test.createTestingModule({
          providers: [SessionService, { provide: SupabaseService, useValue: supabase.service }],
        }).compile();
        service = moduleRef.get(SessionService);

        await service.updateSession('admin-1', 'admin', 's-1', { dogIds: ['dog-1'] });

        const update = supabase.calls.find(call => call.method === 'update');
        expect(update?.args[0]).toMatchObject({ dog_ids: ['dog-1'], dog_names: ['Rex'] });
      });

      it('empties the dog names when the dogs are all removed', async () => {
        await build({ data: existing(), error: null });

        await service.updateSession('admin-1', 'admin', 's-1', { dogIds: [] });

        const update = supabase.calls.find(call => call.method === 'update');
        expect(update?.args[0]).toMatchObject({ dog_ids: [], dog_names: [] });
      });
    });

    it('targets the session by identifier when writing', async () => {
      await build({ data: existing(), error: null });

      await service.updateSession('admin-1', 'admin', 's-1', { duration: 45 });

      expect(supabase.wasCalledWith('eq', 'id', 's-1')).toBe(true);
    });

    it('raises when the data source rejects the write', async () => {
      supabase = createMockSupabase();
      supabase.queueResults([
        { data: existing(), error: null },
        { data: null, error: { message: 'update failed' } },
      ]);
      const moduleRef = await Test.createTestingModule({
        providers: [SessionService, { provide: SupabaseService, useValue: supabase.service }],
      }).compile();
      service = moduleRef.get(SessionService);

      await expect(
        service.updateSession('admin-1', 'admin', 's-1', { duration: 45 })
      ).rejects.toThrow('update failed');
    });
  });

  describe('failures', () => {
    it('raises when the data source rejects the list query', async () => {
      await build({ data: null, error: { message: 'range out of bounds' }, count: 0 });

      await expect(service.getAllSessions('admin-1', 'admin')).rejects.toThrow(
        'range out of bounds'
      );
    });

    it('reports a missing session as not found', async () => {
      await build({ data: null, error: { message: 'no rows' }, count: 0 });

      await expect(service.getSession('user-1', 'user', 'unknown')).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
