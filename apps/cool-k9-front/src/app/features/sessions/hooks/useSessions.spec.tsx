import { renderHook, waitFor } from '@testing-library/react';
import { ExerciseType } from '@models';
import { createQueryWrapper } from '@/testing/query-wrapper';
import { act } from 'react';
import {
  SESSION_QUERY_KEY,
  useCreateSession,
  useSession,
  useSessions,
  useUpdateSession,
} from './useSessions';

// The network layer is replaced, so the service mapping above it stays under test.
vi.mock('../api/session.api', () => ({
  apiFetchSessions: vi.fn(),
  apiFetchSession: vi.fn(),
  apiCreateSession: vi.fn(),
  apiUpdateSession: vi.fn(),
}));

const mockUseAuth = vi.fn();
vi.mock('@/app/features/auth', () => ({
  useAuth: () => mockUseAuth(),
}));

import {
  apiCreateSession,
  apiFetchSession,
  apiFetchSessions,
  apiUpdateSession,
} from '../api/session.api';

describe('useSessions', () => {
  const sessionPayload = {
    id: 's-1',
    date: '2026-02-01T09:00:00Z',
    userIds: ['user-1'],
    dogIds: [],
    dogNames: [],
    exerciseType: ExerciseType.EDUCATION,
    duration: 60,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' } });
  });

  it('exposes the sessions once the request succeeds', async () => {
    vi.mocked(apiFetchSessions).mockResolvedValue({
      data: [sessionPayload],
      total: 1,
      page: 1,
      perPage: 20,
    } as never);

    const { result } = renderHook(() => useSessions(), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toHaveLength(1);
  });

  it('turns the transported date into a Date object', async () => {
    vi.mocked(apiFetchSessions).mockResolvedValue({
      data: [sessionPayload],
      total: 1,
      page: 1,
      perPage: 20,
    } as never);

    const { result } = renderHook(() => useSessions(), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data[0].date).toBeInstanceOf(Date);
  });

  it('forwards the filters and the page to the network layer', async () => {
    vi.mocked(apiFetchSessions).mockResolvedValue({
      data: [],
      total: 0,
      page: 2,
      perPage: 20,
    } as never);

    const { result } = renderHook(
      () => useSessions([ExerciseType.INITIATION], 2, ['user-9'], ['dog-3']),
      { wrapper: createQueryWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiFetchSessions).toHaveBeenCalledWith({
      exerciseTypes: [ExerciseType.INITIATION],
      page: 2,
      perPage: 20,
      userIds: ['user-9'],
      dogIds: ['dog-3'],
    });
  });

  it('reports the error state when the request fails', async () => {
    vi.mocked(apiFetchSessions).mockRejectedValue(new Error('Network down'));

    const { result } = renderHook(() => useSessions(), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.data).toBeUndefined();
  });

  // Without a signed-in user there is nothing to fetch, and firing the request
  // anyway would call the API without a token.
  it('stays idle while no user is signed in', async () => {
    mockUseAuth.mockReturnValue({ user: null });

    const { result } = renderHook(() => useSessions(), { wrapper: createQueryWrapper() });

    expect(result.current.fetchStatus).toBe('idle');
    expect(apiFetchSessions).not.toHaveBeenCalled();
  });
});

describe('useSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' } });
  });

  it('exposes the session once the request succeeds', async () => {
    vi.mocked(apiFetchSession).mockResolvedValue({
      id: 's-1',
      date: '2026-02-01T09:00:00Z',
    } as never);

    const { result } = renderHook(() => useSession('s-1'), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe('s-1');
    expect(result.current.data?.date).toBeInstanceOf(Date);
  });

  it('reports the error state when the request fails', async () => {
    vi.mocked(apiFetchSession).mockRejectedValue(new Error('Not found'));

    const { result } = renderHook(() => useSession('s-1'), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});

describe('useCreateSession', () => {
  const created = { id: 's-1', date: '2026-02-01T09:00:00Z' };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' } });
  });

  it('sends the new session to the network layer', async () => {
    vi.mocked(apiCreateSession).mockResolvedValue(created as never);

    const { result } = renderHook(() => useCreateSession(), { wrapper: createQueryWrapper() });

    await act(async () => {
      await result.current.mutateAsync({ duration: 60 } as never);
    });

    expect(apiCreateSession).toHaveBeenCalledWith({ duration: 60 });
  });

  it('turns the returned date into a Date object', async () => {
    vi.mocked(apiCreateSession).mockResolvedValue(created as never);

    const { result } = renderHook(() => useCreateSession(), { wrapper: createQueryWrapper() });

    let session: { date: Date } | undefined;
    await act(async () => {
      session = await result.current.mutateAsync({ duration: 60 } as never);
    });

    expect(session?.date).toBeInstanceOf(Date);
  });

  it('invalidates the session list so it is refetched', async () => {
    vi.mocked(apiCreateSession).mockResolvedValue(created as never);

    const wrapper = createQueryWrapper();
    const invalidate = vi.spyOn(wrapper.queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateSession(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ duration: 60 } as never);
    });

    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['sessions', 'user-1'] });
  });

  it('reports the error state when the creation fails', async () => {
    vi.mocked(apiCreateSession).mockRejectedValue(new Error('Refused'));

    const { result } = renderHook(() => useCreateSession(), { wrapper: createQueryWrapper() });

    await act(async () => {
      await result.current.mutateAsync({ duration: 60 } as never).catch(() => undefined);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useUpdateSession', () => {
  const updated = { id: 's-1', date: '2026-02-01T09:00:00Z' };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' } });
  });

  it('sends the change for the session it was created for', async () => {
    vi.mocked(apiUpdateSession).mockResolvedValue(updated as never);

    const { result } = renderHook(() => useUpdateSession('s-1'), {
      wrapper: createQueryWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({ ownerObservations: 'RAS' } as never);
    });

    expect(apiUpdateSession).toHaveBeenCalledWith('s-1', { ownerObservations: 'RAS' });
  });

  // Both the single session and the list hold a copy, so both go stale on a write.
  it('invalidates the session itself and the list', async () => {
    vi.mocked(apiUpdateSession).mockResolvedValue(updated as never);

    const wrapper = createQueryWrapper();
    const invalidate = vi.spyOn(wrapper.queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateSession('s-1'), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ ownerObservations: 'RAS' } as never);
    });

    expect(invalidate).toHaveBeenCalledWith({ queryKey: SESSION_QUERY_KEY('user-1', 's-1') });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['sessions', 'user-1'] });
  });

  it('reports the error state when the update fails', async () => {
    vi.mocked(apiUpdateSession).mockRejectedValue(new Error('Refused'));

    const { result } = renderHook(() => useUpdateSession('s-1'), {
      wrapper: createQueryWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({ ownerObservations: 'RAS' } as never).catch(() => undefined);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
