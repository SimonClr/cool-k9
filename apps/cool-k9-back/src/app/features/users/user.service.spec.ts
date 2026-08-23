import { Test } from '@nestjs/testing';
import { SupabaseService } from '../../supabase/supabase.service';
import { createMockSupabase, MockSupabase } from '../../../testing/supabase-service.mock';
import { UserService } from './user.service';

describe('UserService', () => {
  let supabase: MockSupabase;
  let service: UserService;

  const user = (id: string, email: string, first = '', last = '') => ({
    id,
    email,
    user_metadata: { first_name: first, last_name: last },
  });

  beforeEach(async () => {
    supabase = createMockSupabase({ data: [], error: null });
    const moduleRef = await Test.createTestingModule({
      providers: [UserService, { provide: SupabaseService, useValue: supabase.service }],
    }).compile();
    service = moduleRef.get(UserService);
  });

  describe('without a search term', () => {
    it('delegates paging to the data source rather than filtering in memory', async () => {
      supabase.setUsers([user('u-1', 'ada@example.com', 'Ada', 'Lovelace')]);

      await service.getUsers({ page: 3, perPage: 10 });

      // The requested page is forwarded as-is: no over-fetching, no local slicing.
      expect(supabase.wasCalledWith('listUsers', { page: 3, perPage: 10 })).toBe(true);
    });

    it('maps each account onto the model', async () => {
      supabase.setUsers([user('u-1', 'ada@example.com', 'Ada', 'Lovelace')]);

      const { data } = await service.getUsers();

      expect(data).toEqual([
        { id: 'u-1', email: 'ada@example.com', firstName: 'Ada', lastName: 'Lovelace' },
      ]);
    });

    it('falls back to empty strings for a missing email or name', async () => {
      supabase.setUsers([{ id: 'u-2', user_metadata: {} }]);

      const { data } = await service.getUsers();

      expect(data[0]).toEqual({ id: 'u-2', email: '', firstName: '', lastName: '' });
    });

    it('echoes the paging parameters back to the caller', async () => {
      supabase.setUsers([]);

      const result = await service.getUsers({ page: 2, perPage: 5 });

      expect(result).toMatchObject({ page: 2, perPage: 5 });
    });
  });

  describe('with a search term', () => {
    beforeEach(() => {
      supabase.setUsers([
        user('u-1', 'ada@example.com', 'Ada', 'Lovelace'),
        user('u-2', 'grace@example.com', 'Grace', 'Hopper'),
        user('u-3', 'alan@example.com', 'Alan', 'Turing'),
      ]);
    });

    it('fetches a large batch instead of the requested page', async () => {
      // The admin API cannot search, so the whole batch is pulled and filtered here.
      await service.getUsers({ search: 'ada', page: 2, perPage: 1 });

      expect(supabase.wasCalledWith('listUsers', { page: 1, perPage: 500 })).toBe(true);
    });

    it('matches on the email', async () => {
      const { data } = await service.getUsers({ search: 'grace@example' });

      expect(data.map(u => u.id)).toEqual(['u-2']);
    });

    it('matches on the first name', async () => {
      const { data } = await service.getUsers({ search: 'alan' });

      expect(data.map(u => u.id)).toEqual(['u-3']);
    });

    it('matches on the last name', async () => {
      const { data } = await service.getUsers({ search: 'hopper' });

      expect(data.map(u => u.id)).toEqual(['u-2']);
    });

    it('ignores case when matching', async () => {
      const { data } = await service.getUsers({ search: 'LOVELACE' });

      expect(data.map(u => u.id)).toEqual(['u-1']);
    });

    it('reports the number of matches, not the size of the batch', async () => {
      const result = await service.getUsers({ search: 'example.com' });

      expect(result.total).toBe(3);
    });

    it('pages through the matches in memory', async () => {
      const result = await service.getUsers({ search: 'example.com', page: 2, perPage: 2 });

      expect(result.data.map(u => u.id)).toEqual(['u-3']);
      expect(result.total).toBe(3);
    });

    it('returns nothing when no account matches', async () => {
      const result = await service.getUsers({ search: 'nobody' });

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('exportUserData', () => {
    const account = {
      id: 'u-1',
      email: 'ada@example.com',
      created_at: '2025-01-01T00:00:00Z',
      last_sign_in_at: '2026-08-01T10:00:00Z',
      user_metadata: {
        first_name: 'Ada',
        last_name: 'Lovelace',
        terms_accepted_at: '2025-01-01T00:00:05Z',
        terms_version: '1.0',
        theme: 'dark',
      },
    };

    const sessionRow = (over: Record<string, unknown> = {}) => ({
      date: '2026-02-01T09:00:00Z',
      exercise_type: 'EDUCATION',
      duration: 60,
      dog_names: ['Rex'],
      user_ids: ['u-1'],
      ...over,
    });

    beforeEach(() => {
      supabase.setUserById({ data: { user: account }, error: null });
      supabase.queueResultsFor('dogs', [{ data: [], error: null }]);
      supabase.queueResultsFor('sessions', [{ data: [], error: null }]);
    });

    it('reports the account it was asked for as not found when it does not exist', async () => {
      supabase.setUserById({ data: null, error: { message: 'user not found' } });

      await expect(service.exportUserData('ghost')).rejects.toThrow('User not found');
    });

    it('carries the account details into the document', async () => {
      const doc = await service.exportUserData('u-1');

      expect(doc.account).toEqual({
        email: 'ada@example.com',
        firstName: 'Ada',
        lastName: 'Lovelace',
        createdAt: '2025-01-01T00:00:00Z',
        lastSignInAt: '2026-08-01T10:00:00Z',
      });
    });

    it('records the consent and the preferences the privacy policy announces', async () => {
      const doc = await service.exportUserData('u-1');

      expect(doc.consent).toEqual({
        acceptedAt: '2025-01-01T00:00:05Z',
        documentsVersion: '1.0',
      });
      expect(doc.preferences).toEqual({ theme: 'dark' });
    });

    it('stamps the document with a format version', async () => {
      const doc = await service.exportUserData('u-1');

      expect(doc.formatVersion).toBe('1.0');
      expect(doc.exportedAt).toEqual(expect.any(String));
    });

    it('reads only the dogs belonging to the requester', async () => {
      await service.exportUserData('u-1');

      expect(supabase.wasCalledWith('eq', 'user_id', 'u-1')).toBe(true);
    });

    it('reads only the sessions the requester took part in', async () => {
      await service.exportUserData('u-1');

      expect(supabase.wasCalledWith('contains', 'user_ids', ['u-1'])).toBe(true);
    });

    it('includes the dogs of the account', async () => {
      supabase.queueResultsFor('dogs', [
        {
          data: [{ name: 'Rex', birth_date: '2020-05-01', created_at: '2025-02-01T00:00:00Z' }],
          error: null,
        },
      ]);

      const doc = await service.exportUserData('u-1');

      expect(doc.dogs).toEqual([
        { name: 'Rex', birthDate: '2020-05-01', createdAt: '2025-02-01T00:00:00Z' },
      ]);
    });

    // The other participants' activity is theirs; the export says how many took
    // part, never who they were.
    it('strips the other participants from the exported sessions', async () => {
      supabase.queueResultsFor('sessions', [
        { data: [sessionRow({ user_ids: ['u-1', 'u-2', 'u-3'] })], error: null },
      ]);

      const doc = await service.exportUserData('u-1');

      expect(doc.sessions[0].otherParticipantCount).toBe(2);
      expect(JSON.stringify(doc.sessions[0])).not.toContain('u-2');
    });

    it('counts no other participant on a solo session', async () => {
      supabase.queueResultsFor('sessions', [{ data: [sessionRow()], error: null }]);

      const doc = await service.exportUserData('u-1');

      expect(doc.sessions[0].otherParticipantCount).toBe(0);
    });

    it('normalises absent optional columns to null', async () => {
      supabase.queueResultsFor('sessions', [{ data: [sessionRow()], error: null }]);

      const doc = await service.exportUserData('u-1');

      expect(doc.sessions[0].location).toBeNull();
      expect(doc.sessions[0].weather).toBeNull();
      expect(doc.sessions[0].ownerObservations).toBeNull();
    });

    // An export has to be exhaustive: stopping at the first page would silently
    // truncate the document.
    it('walks every page of sessions until a short one ends the run', async () => {
      const fullPage = Array.from({ length: 500 }, () => sessionRow());
      supabase.queueResultsFor('sessions', [
        { data: fullPage, error: null },
        { data: [sessionRow()], error: null },
      ]);

      const doc = await service.exportUserData('u-1');

      expect(doc.sessions).toHaveLength(501);
      expect(supabase.wasCalledWith('range', 0, 499)).toBe(true);
      expect(supabase.wasCalledWith('range', 500, 999)).toBe(true);
    });

    it('raises when the dogs cannot be read', async () => {
      supabase.queueResultsFor('dogs', [{ data: null, error: { message: 'dogs unavailable' } }]);

      await expect(service.exportUserData('u-1')).rejects.toThrow('dogs unavailable');
    });

    it('raises when the sessions cannot be read', async () => {
      supabase.queueResultsFor('sessions', [
        { data: null, error: { message: 'sessions unavailable' } },
      ]);

      await expect(service.exportUserData('u-1')).rejects.toThrow('sessions unavailable');
    });
  });

  describe('deleteUserAccount', () => {
    it('deletes a session the departing account was the last participant of', async () => {
      supabase.queueResultsFor('sessions', [
        { data: [{ id: 's-1', user_ids: ['u-1'], dog_ids: [], dog_names: [] }], error: null },
        { data: null, error: null },
      ]);

      await service.deleteUserAccount('u-1');

      expect(supabase.wasCalled('delete')).toBe(true);
      expect(supabase.wasCalledWith('eq', 'id', 's-1')).toBe(true);
    });

    // The session documents the others' activity too, so it survives without
    // the departing identifier.
    it('keeps a shared session and drops only the departing identifier', async () => {
      supabase.queueResultsFor('sessions', [
        { data: [{ id: 's-1', user_ids: ['u-1', 'u-2'], dog_ids: [], dog_names: [] }], error: null },
        { data: null, error: null },
      ]);
      supabase.queueResultsFor('dogs', [{ data: [], error: null }]);

      await service.deleteUserAccount('u-1');

      expect(supabase.wasCalled('delete')).toBe(false);
      const update = supabase.calls.find(call => call.method === 'update');
      expect(update?.args[0]).toMatchObject({ user_ids: ['u-2'] });
    });

    it('drops the departing owner dogs from a surviving session, names included', async () => {
      supabase.queueResultsFor('sessions', [
        {
          data: [
            {
              id: 's-1',
              user_ids: ['u-1', 'u-2'],
              dog_ids: ['dog-1', 'dog-2'],
              dog_names: ['Rex', 'Bella'],
            },
          ],
          error: null,
        },
        { data: null, error: null },
      ]);
      // dog-1 belongs to the departing account; dog-2 does not.
      supabase.queueResultsFor('dogs', [{ data: [{ id: 'dog-1' }], error: null }]);

      await service.deleteUserAccount('u-1');

      const update = supabase.calls.find(call => call.method === 'update');
      expect(update?.args[0]).toMatchObject({
        dog_ids: ['dog-2'],
        dog_names: ['Bella'],
      });
    });

    it('erases the account once the sessions are settled', async () => {
      supabase.queueResultsFor('sessions', [{ data: [], error: null }]);

      await service.deleteUserAccount('u-1');

      expect(supabase.wasCalledWith('deleteUser', 'u-1')).toBe(true);
    });

    // Sessions are settled while the identifier still resolves; erasing the
    // account first would leave them untreatable.
    it('settles the sessions before erasing the account', async () => {
      supabase.queueResultsFor('sessions', [
        { data: [{ id: 's-1', user_ids: ['u-1'], dog_ids: [], dog_names: [] }], error: null },
        { data: null, error: null },
      ]);

      await service.deleteUserAccount('u-1');

      const deleteSession = supabase.calls.findIndex(call => call.method === 'delete');
      const deleteAccount = supabase.calls.findIndex(call => call.method === 'deleteUser');
      expect(deleteSession).toBeGreaterThanOrEqual(0);
      expect(deleteSession).toBeLessThan(deleteAccount);
    });

    it('raises when the sessions cannot be read, leaving the account in place', async () => {
      supabase.queueResultsFor('sessions', [
        { data: null, error: { message: 'sessions unavailable' } },
      ]);

      await expect(service.deleteUserAccount('u-1')).rejects.toThrow('sessions unavailable');
      expect(supabase.wasCalled('deleteUser')).toBe(false);
    });

    it('raises when the account itself cannot be erased', async () => {
      supabase.queueResultsFor('sessions', [{ data: [], error: null }]);
      supabase.setResult({ data: null, error: { message: 'deletion refused' } });

      await expect(service.deleteUserAccount('u-1')).rejects.toThrow('deletion refused');
    });
  });

  describe('failures', () => {
    it('raises when the data source rejects the paged listing', async () => {
      supabase.setListUsersError({ message: 'admin API unavailable' });

      await expect(service.getUsers()).rejects.toThrow('admin API unavailable');
    });

    it('raises when the data source rejects the search listing', async () => {
      supabase.setListUsersError({ message: 'admin API unavailable' });

      await expect(service.getUsers({ search: 'ada' })).rejects.toThrow('admin API unavailable');
    });
  });
});
