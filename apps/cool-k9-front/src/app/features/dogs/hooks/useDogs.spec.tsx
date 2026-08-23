import { renderHook, waitFor } from '@testing-library/react';
import { createQueryWrapper } from '@/testing/query-wrapper';
import { act } from 'react';
import { DOGS_QUERY_KEY, useCreateDog, useDogs, useMultiUserDogs, useUpdateDog } from './useDogs';

vi.mock('../api/dog.api', () => ({
  apiFetchDogs: vi.fn(),
  apiCreateDog: vi.fn(),
  apiUpdateDog: vi.fn(),
}));

const mockUseAuth = vi.fn();
vi.mock('@/app/features/auth', () => ({
  useAuth: () => mockUseAuth(),
}));

import { apiCreateDog, apiFetchDogs, apiUpdateDog } from '../api/dog.api';

describe('useDogs', () => {
  const dogPayload = {
    id: 'dog-1',
    name: 'Rex',
    birthDate: '2020-05-01',
    userId: 'user-1',
    createdAt: '2025-02-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' } });
  });

  it('exposes the dogs once the request succeeds', async () => {
    vi.mocked(apiFetchDogs).mockResolvedValue([dogPayload] as never);

    const { result } = renderHook(() => useDogs(), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].name).toBe('Rex');
  });

  it('turns the transported dates into Date objects', async () => {
    vi.mocked(apiFetchDogs).mockResolvedValue([dogPayload] as never);

    const { result } = renderHook(() => useDogs(), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.[0].birthDate).toBeInstanceOf(Date);
    expect(result.current.data?.[0].createdAt).toBeInstanceOf(Date);
  });

  it('reports the error state when the request fails', async () => {
    vi.mocked(apiFetchDogs).mockRejectedValue(new Error('Network down'));

    const { result } = renderHook(() => useDogs(), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.data).toBeUndefined();
  });

  it('stays idle while no user is signed in', async () => {
    mockUseAuth.mockReturnValue({ user: null });

    const { result } = renderHook(() => useDogs(), { wrapper: createQueryWrapper() });

    expect(result.current.fetchStatus).toBe('idle');
    expect(apiFetchDogs).not.toHaveBeenCalled();
  });
});

describe('useMultiUserDogs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' } });
  });

  it('gathers the dogs of every requested account into one list', async () => {
    vi.mocked(apiFetchDogs).mockImplementation((async (userId?: string) =>
      userId === 'user-1'
        ? [{ id: 'dog-1', name: 'Rex', birthDate: '2020-05-01', userId, createdAt: '2025-01-01' }]
        : [
            { id: 'dog-2', name: 'Bella', birthDate: '2021-05-01', userId, createdAt: '2025-01-01' },
          ]) as never);

    const { result } = renderHook(() => useMultiUserDogs(['user-1', 'user-2']), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data.map(d => d.name).sort()).toEqual(['Bella', 'Rex']);
  });

  it('asks the network layer for each account separately', async () => {
    vi.mocked(apiFetchDogs).mockResolvedValue([] as never);

    const { result } = renderHook(() => useMultiUserDogs(['user-1', 'user-2']), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(apiFetchDogs).toHaveBeenCalledWith('user-1');
    expect(apiFetchDogs).toHaveBeenCalledWith('user-2');
  });

  it('yields an empty list when no account is requested', async () => {
    const { result } = renderHook(() => useMultiUserDogs([]), { wrapper: createQueryWrapper() });

    expect(result.current.data).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(apiFetchDogs).not.toHaveBeenCalled();
  });
});

describe('useCreateDog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' } });
  });

  it('sends the new dog to the network layer', async () => {
    vi.mocked(apiCreateDog).mockResolvedValue({
      id: 'dog-1',
      name: 'Rex',
      birthDate: '2020-05-01',
      userId: 'user-1',
      createdAt: '2025-01-01',
    } as never);

    const { result } = renderHook(() => useCreateDog(), { wrapper: createQueryWrapper() });

    await act(async () => {
      await result.current.mutateAsync({ name: 'Rex', birthDate: new Date('2020-05-01') });
    });

    // The service trims the date down to the day, matching the column it lands in.
    expect(apiCreateDog).toHaveBeenCalledWith('Rex', '2020-05-01');
  });

  it('maps the created dog onto the model', async () => {
    vi.mocked(apiCreateDog).mockResolvedValue({
      id: 'dog-1',
      name: 'Rex',
      birthDate: '2020-05-01',
      userId: 'user-1',
      createdAt: '2025-01-01',
    } as never);

    const { result } = renderHook(() => useCreateDog(), { wrapper: createQueryWrapper() });

    let created: { birthDate: Date } | undefined;
    await act(async () => {
      created = await result.current.mutateAsync({
        name: 'Rex',
        birthDate: new Date('2020-05-01'),
      });
    });

    expect(created?.birthDate).toBeInstanceOf(Date);
  });

  // Without the invalidation the list keeps showing stale data after a creation.
  it('invalidates the dog list of the signed-in user', async () => {
    vi.mocked(apiCreateDog).mockResolvedValue({
      id: 'dog-1',
      name: 'Rex',
      birthDate: '2020-05-01',
      userId: 'user-1',
      createdAt: '2025-01-01',
    } as never);

    const wrapper = createQueryWrapper();
    const invalidate = vi.spyOn(wrapper.queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateDog(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ name: 'Rex', birthDate: new Date('2020-05-01') });
    });

    expect(invalidate).toHaveBeenCalledWith({ queryKey: DOGS_QUERY_KEY('user-1') });
  });

  it('reports the error state when the creation fails', async () => {
    vi.mocked(apiCreateDog).mockRejectedValue(new Error('Refused'));

    const { result } = renderHook(() => useCreateDog(), { wrapper: createQueryWrapper() });

    await act(async () => {
      await result.current
        .mutateAsync({ name: 'Rex', birthDate: new Date('2020-05-01') })
        .catch(() => undefined);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useUpdateDog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' } });
  });

  it('sends the change to the network layer', async () => {
    vi.mocked(apiUpdateDog).mockResolvedValue({
      id: 'dog-1',
      name: 'Rexy',
      birthDate: '2020-05-01',
      userId: 'user-1',
      createdAt: '2025-01-01',
    } as never);

    const { result } = renderHook(() => useUpdateDog(), { wrapper: createQueryWrapper() });

    await act(async () => {
      await result.current.mutateAsync({
        id: 'dog-1',
        name: 'Rexy',
        birthDate: new Date('2020-05-01'),
      });
    });

    expect(apiUpdateDog).toHaveBeenCalledWith('dog-1', 'Rexy', '2020-05-01');
  });

  it('invalidates the dog list of the signed-in user', async () => {
    vi.mocked(apiUpdateDog).mockResolvedValue({
      id: 'dog-1',
      name: 'Rexy',
      birthDate: '2020-05-01',
      userId: 'user-1',
      createdAt: '2025-01-01',
    } as never);

    const wrapper = createQueryWrapper();
    const invalidate = vi.spyOn(wrapper.queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateDog(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        id: 'dog-1',
        name: 'Rexy',
        birthDate: new Date('2020-05-01'),
      });
    });

    expect(invalidate).toHaveBeenCalledWith({ queryKey: DOGS_QUERY_KEY('user-1') });
  });
});
