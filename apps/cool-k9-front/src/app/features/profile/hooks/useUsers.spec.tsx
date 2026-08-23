import { renderHook, waitFor } from '@testing-library/react';
import { createQueryWrapper } from '@/testing/query-wrapper';
import { useUserSearch } from './useUsers';

vi.mock('../api/user.api', () => ({
  apiFetchUsers: vi.fn(),
}));

import { apiFetchUsers } from '../api/user.api';

describe('useUserSearch', () => {
  const page = (over: Record<string, unknown> = {}) => ({
    data: [{ id: 'u-1', email: 'ada@example.com', firstName: 'Ada', lastName: 'Lovelace' }],
    total: 1,
    page: 1,
    perPage: 20,
    ...over,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('stays idle until it is enabled', () => {
    const { result } = renderHook(() => useUserSearch('', false), {
      wrapper: createQueryWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(apiFetchUsers).not.toHaveBeenCalled();
  });

  it('exposes the first page once enabled', async () => {
    vi.mocked(apiFetchUsers).mockResolvedValue(page() as never);

    const { result } = renderHook(() => useUserSearch('', true), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages[0].data).toHaveLength(1);
  });

  // An empty search must not be sent as an empty string, which the API would
  // treat as a filter matching nothing.
  it('omits an empty search term', async () => {
    vi.mocked(apiFetchUsers).mockResolvedValue(page() as never);

    const { result } = renderHook(() => useUserSearch('', true), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiFetchUsers).toHaveBeenCalledWith({ search: undefined, page: 1, perPage: 20 });
  });

  it('forwards a search term that was supplied', async () => {
    vi.mocked(apiFetchUsers).mockResolvedValue(page() as never);

    const { result } = renderHook(() => useUserSearch('ada', true), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiFetchUsers).toHaveBeenCalledWith({ search: 'ada', page: 1, perPage: 20 });
  });

  it('offers no further page once every account has been loaded', async () => {
    vi.mocked(apiFetchUsers).mockResolvedValue(page({ total: 20, perPage: 20 }) as never);

    const { result } = renderHook(() => useUserSearch('', true), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(false);
  });

  it('offers a further page while accounts remain', async () => {
    vi.mocked(apiFetchUsers).mockResolvedValue(page({ total: 50, perPage: 20 }) as never);

    const { result } = renderHook(() => useUserSearch('', true), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);
  });

  it('asks for the following page when told to continue', async () => {
    vi.mocked(apiFetchUsers).mockResolvedValue(page({ total: 50, perPage: 20 }) as never);

    const { result } = renderHook(() => useUserSearch('', true), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    await result.current.fetchNextPage();

    await waitFor(() =>
      expect(apiFetchUsers).toHaveBeenCalledWith({ search: undefined, page: 2, perPage: 20 })
    );
  });

  it('reports the error state when the request fails', async () => {
    vi.mocked(apiFetchUsers).mockRejectedValue(new Error('Network down'));

    const { result } = renderHook(() => useUserSearch('', true), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
