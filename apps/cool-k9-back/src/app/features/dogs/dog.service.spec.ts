import { Test } from '@nestjs/testing';
import { SupabaseService } from '../../supabase/supabase.service';
import {
  createMockSupabase,
  MockSupabase,
  SupabaseResult,
} from '../../../testing/supabase-service.mock';
import { DogService } from './dog.service';

describe('DogService', () => {
  let supabase: MockSupabase;
  let service: DogService;

  const dogRow = {
    id: 'dog-1',
    name: 'Rex',
    birth_date: '2020-05-01',
    user_id: 'user-1',
    created_at: '2026-01-01T08:00:00Z',
  };

  const build = async (initial: SupabaseResult = { data: [], error: null }) => {
    supabase = createMockSupabase(initial);
    const moduleRef = await Test.createTestingModule({
      providers: [DogService, { provide: SupabaseService, useValue: supabase.service }],
    }).compile();
    service = moduleRef.get(DogService);
  };

  beforeEach(() => build());

  describe('getDogs', () => {
    it('restricts the read to the dogs of the calling owner', async () => {
      await service.getDogs('user-1');

      expect(supabase.tables).toEqual(['dogs']);
      expect(supabase.wasCalledWith('eq', 'user_id', 'user-1')).toBe(true);
    });

    it('maps each row onto the model, converting date columns', async () => {
      await build({ data: [dogRow], error: null });

      const dogs = await service.getDogs('user-1');

      expect(dogs).toEqual([
        {
          id: 'dog-1',
          name: 'Rex',
          birthDate: new Date('2020-05-01'),
          userId: 'user-1',
          createdAt: new Date('2026-01-01T08:00:00Z'),
        },
      ]);
    });

    it('returns an empty list when the owner has no dog', async () => {
      await build({ data: null, error: null });

      await expect(service.getDogs('user-1')).resolves.toEqual([]);
    });
  });

  describe('createDog', () => {
    it('attaches the new dog to the caller rather than to any supplied owner', async () => {
      await build({ data: dogRow, error: null });

      await service.createDog('user-1', { name: 'Rex', birthDate: '2020-05-01' });

      expect(
        supabase.wasCalledWith('insert', {
          name: 'Rex',
          birth_date: '2020-05-01',
          user_id: 'user-1',
        })
      ).toBe(true);
    });

    it('returns the created dog mapped onto the model', async () => {
      await build({ data: dogRow, error: null });

      const dog = await service.createDog('user-1', { name: 'Rex', birthDate: '2020-05-01' });

      expect(dog).toMatchObject({ id: 'dog-1', name: 'Rex', userId: 'user-1' });
      expect(dog.birthDate).toEqual(new Date('2020-05-01'));
    });
  });

  describe('updateDog', () => {
    // Matching on the identifier alone would let anyone edit any dog; the owner
    // clause is what makes the update safe, so both are asserted.
    it('matches on the identifier and the owner together', async () => {
      await build({ data: dogRow, error: null });

      await service.updateDog('user-1', 'dog-1', { name: 'Rexy' });

      expect(supabase.wasCalledWith('eq', 'id', 'dog-1')).toBe(true);
      expect(supabase.wasCalledWith('eq', 'user_id', 'user-1')).toBe(true);
    });

    it('sends only the fields actually supplied', async () => {
      await build({ data: dogRow, error: null });

      await service.updateDog('user-1', 'dog-1', { name: 'Rexy' });

      expect(supabase.wasCalledWith('update', { name: 'Rexy' })).toBe(true);
    });

    it('sends an empty patch when nothing was supplied', async () => {
      await build({ data: dogRow, error: null });

      await service.updateDog('user-1', 'dog-1', {});

      expect(supabase.wasCalledWith('update', {})).toBe(true);
    });
  });

  describe('failures', () => {
    it('raises when the data source rejects the read', async () => {
      await build({ data: null, error: { message: 'connection reset' } });

      await expect(service.getDogs('user-1')).rejects.toThrow('connection reset');
    });

    it('raises when the data source rejects the creation', async () => {
      await build({ data: null, error: { message: 'insert violates constraint' } });

      await expect(
        service.createDog('user-1', { name: 'Rex', birthDate: '2020-05-01' })
      ).rejects.toThrow('insert violates constraint');
    });

    it('raises when the data source rejects the update', async () => {
      await build({ data: null, error: { message: 'no rows updated' } });

      await expect(service.updateDog('user-1', 'dog-1', { name: 'Rexy' })).rejects.toThrow(
        'no rows updated'
      );
    });
  });
});
