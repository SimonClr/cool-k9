import { act, renderHook } from '@testing-library/react';
import { useLocationSearch } from './useLocationSearch';

vi.mock('../api/location.api', () => ({
  apiFetchLocationSuggestions: vi.fn(),
}));

import { apiFetchLocationSuggestions } from '../api/location.api';

describe('useLocationSearch', () => {
  const suggestion = { display_name: 'Paris', lat: '48.85', lon: '2.35' };

  /**
   * Fires the debounce and then lets the awaited request settle.
   *
   * The timer callback is itself async, so advancing the clock only starts it:
   * the state update lands a microtask later, which the awaited resolution drains.
   */
  const flushDebounce = async () => {
    await act(async () => {
      vi.advanceTimersByTime(400);
      await Promise.resolve();
      await Promise.resolve();
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with no suggestion', () => {
    const { result } = renderHook(() => useLocationSearch());

    expect(result.current.suggestions).toEqual([]);
  });

  // Querying on every keystroke would hammer the geocoding service, so the search
  // only fires once typing has paused.
  it('waits for the typing to pause before querying', () => {
    vi.mocked(apiFetchLocationSuggestions).mockResolvedValue([suggestion] as never);
    const { result } = renderHook(() => useLocationSearch());

    act(() => result.current.search('Paris'));

    expect(apiFetchLocationSuggestions).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(apiFetchLocationSuggestions).toHaveBeenCalledWith('Paris');
  });

  it('only issues the last query when the term keeps changing', () => {
    vi.mocked(apiFetchLocationSuggestions).mockResolvedValue([] as never);
    const { result } = renderHook(() => useLocationSearch());

    act(() => result.current.search('Par'));
    act(() => {
      vi.advanceTimersByTime(200);
    });
    act(() => result.current.search('Paris'));
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(apiFetchLocationSuggestions).toHaveBeenCalledTimes(1);
    expect(apiFetchLocationSuggestions).toHaveBeenCalledWith('Paris');
  });

  it('exposes the suggestions the service returns', async () => {
    vi.mocked(apiFetchLocationSuggestions).mockResolvedValue([suggestion] as never);
    const { result } = renderHook(() => useLocationSearch());

    act(() => result.current.search('Paris'));
    await flushDebounce();

    expect(result.current.suggestions).toEqual([suggestion]);
  });

  describe('too short a term', () => {
    it('does not query below three characters', () => {
      const { result } = renderHook(() => useLocationSearch());

      act(() => result.current.search('Pa'));
      act(() => {
        vi.advanceTimersByTime(400);
      });

      expect(apiFetchLocationSuggestions).not.toHaveBeenCalled();
    });

    it('ignores surrounding whitespace when measuring the term', () => {
      const { result } = renderHook(() => useLocationSearch());

      act(() => result.current.search('  Pa  '));
      act(() => {
        vi.advanceTimersByTime(400);
      });

      expect(apiFetchLocationSuggestions).not.toHaveBeenCalled();
    });

    it('clears the suggestions already on screen', async () => {
      vi.mocked(apiFetchLocationSuggestions).mockResolvedValue([suggestion] as never);
      const { result } = renderHook(() => useLocationSearch());

      act(() => result.current.search('Paris'));
      await flushDebounce();
      expect(result.current.suggestions).toHaveLength(1);

      act(() => result.current.search('Pa'));

      expect(result.current.suggestions).toEqual([]);
    });
  });

  // A geocoding outage must not surface as an unhandled rejection in the form.
  it('falls back to no suggestion when the service fails', async () => {
    vi.mocked(apiFetchLocationSuggestions).mockRejectedValue(new Error('Service down'));
    const { result } = renderHook(() => useLocationSearch());

    act(() => result.current.search('Paris'));
    await flushDebounce();

    expect(result.current.suggestions).toEqual([]);
  });

  it('clears the suggestions on demand', async () => {
    vi.mocked(apiFetchLocationSuggestions).mockResolvedValue([suggestion] as never);
    const { result } = renderHook(() => useLocationSearch());

    act(() => result.current.search('Paris'));
    await flushDebounce();
    expect(result.current.suggestions).toHaveLength(1);

    act(() => result.current.clear());

    expect(result.current.suggestions).toEqual([]);
  });
});
