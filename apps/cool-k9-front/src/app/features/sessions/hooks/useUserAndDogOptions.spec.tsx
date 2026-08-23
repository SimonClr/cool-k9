import { renderHook, waitFor } from '@testing-library/react';
import { ExerciseType, Session } from '@models';
import { useUserAndDogOptions } from './useUserAndDogOptions';

const mockUseUserSearch = vi.fn();
vi.mock('@/app/features/profile', () => ({
  useUserSearch: (...args: unknown[]) => mockUseUserSearch(...args),
}));

const mockUseMultiUserDogs = vi.fn();
vi.mock('@/app/features/dogs', () => ({
  useMultiUserDogs: (...args: unknown[]) => mockUseMultiUserDogs(...args),
}));

const dog = (id: string, userId: string, name = id) => ({
  id,
  name,
  userId,
  birthDate: new Date('2020-05-01'),
  createdAt: new Date('2025-01-01'),
});

describe('useUserAndDogOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUserSearch.mockReturnValue({
      data: { pages: [] },
      isLoading: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
    });
    mockUseMultiUserDogs.mockReturnValue({ data: [], isLoading: false });
  });

  describe('user options', () => {
    it('turns the search results into selectable options', () => {
      mockUseUserSearch.mockReturnValue({
        data: {
          pages: [
            {
              data: [
                { id: 'u-1', firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' },
              ],
            },
          ],
        },
        isLoading: false,
        hasNextPage: false,
        fetchNextPage: vi.fn(),
      });

      const { result } = renderHook(() => useUserAndDogOptions([], false));

      expect(result.current.userOptions).toEqual([
        { value: 'u-1', label: 'Ada Lovelace', sublabel: 'ada@example.com' },
      ]);
    });

    it('falls back to the email when the account has no name', () => {
      mockUseUserSearch.mockReturnValue({
        data: {
          pages: [[{ id: 'u-2', firstName: '', lastName: '', email: 'grace@example.com' }]].map(
            data => ({ data })
          ),
        },
        isLoading: false,
        hasNextPage: false,
        fetchNextPage: vi.fn(),
      });

      const { result } = renderHook(() => useUserAndDogOptions([], false));

      expect(result.current.userOptions[0].label).toBe('grace@example.com');
    });

    // In edit mode the participants already on the session must stay selectable
    // even before any search has run, otherwise they vanish from the field.
    it('keeps the participants of the edited session', () => {
      const session = {
        userIds: ['u-1'],
        userNames: ['Ada Lovelace'],
        exerciseType: ExerciseType.EDUCATION,
      } as unknown as Session;

      const { result } = renderHook(() => useUserAndDogOptions(['u-1'], true, session));

      expect(result.current.userOptions).toEqual([{ value: 'u-1', label: 'Ada Lovelace' }]);
    });

    it('falls back to the identifier when the session carries no name', () => {
      const session = { userIds: ['u-1'], exerciseType: ExerciseType.EDUCATION } as unknown as Session;

      const { result } = renderHook(() => useUserAndDogOptions(['u-1'], true, session));

      expect(result.current.userOptions[0].label).toBe('u-1');
    });

    it('does not list a participant twice when the search returns them too', () => {
      mockUseUserSearch.mockReturnValue({
        data: {
          pages: [
            {
              data: [
                { id: 'u-1', firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' },
              ],
            },
          ],
        },
        isLoading: false,
        hasNextPage: false,
        fetchNextPage: vi.fn(),
      });
      const session = {
        userIds: ['u-1'],
        userNames: ['Ada Lovelace'],
        exerciseType: ExerciseType.EDUCATION,
      } as unknown as Session;

      const { result } = renderHook(() => useUserAndDogOptions(['u-1'], true, session));

      expect(result.current.userOptions).toHaveLength(1);
    });

    it('reports whether a further page is available', () => {
      mockUseUserSearch.mockReturnValue({
        data: { pages: [] },
        isLoading: false,
        hasNextPage: true,
        fetchNextPage: vi.fn(),
      });

      const { result } = renderHook(() => useUserAndDogOptions([], false));

      expect(result.current.hasNextPage).toBe(true);
    });

    it('asks for the following page when told to continue', () => {
      const fetchNextPage = vi.fn();
      mockUseUserSearch.mockReturnValue({
        data: { pages: [] },
        isLoading: false,
        hasNextPage: true,
        fetchNextPage,
      });

      const { result } = renderHook(() => useUserAndDogOptions([], false));
      result.current.onFetchNextPage();

      expect(fetchNextPage).toHaveBeenCalled();
    });
  });

  describe('search activation', () => {
    // The account list is only fetched once the field is opened, so merely
    // displaying the form does not query it.
    it('leaves the account search disabled until the field is opened', () => {
      renderHook(() => useUserAndDogOptions([], false));

      expect(mockUseUserSearch).toHaveBeenCalledWith('', false);
    });

    it('enables the account search once the field is opened', async () => {
      const { result } = renderHook(() => useUserAndDogOptions([], false));

      result.current.onUsersOpenChange(true);

      await waitFor(() => expect(mockUseUserSearch).toHaveBeenLastCalledWith('', true));
    });
  });

  describe('dog options', () => {
    it('asks for the dogs of the selected accounts', () => {
      renderHook(() => useUserAndDogOptions(['u-1', 'u-2'], false));

      expect(mockUseMultiUserDogs).toHaveBeenCalledWith(['u-1', 'u-2']);
    });

    it('turns the dogs into selectable options carrying their age', () => {
      mockUseMultiUserDogs.mockReturnValue({ data: [dog('d-1', 'u-1', 'Rex')], isLoading: false });

      const { result } = renderHook(() => useUserAndDogOptions(['u-1'], false));

      expect(result.current.dogOptions[0]).toMatchObject({ value: 'd-1', label: 'Rex' });
      expect(result.current.dogOptions[0].sublabel).toMatch(/ans?$/);
    });
  });

  describe('automatic dog selection', () => {
    // Picking the dog for an owner who has only one saves the obvious click.
    it('selects the only dog of an owner', () => {
      mockUseMultiUserDogs.mockReturnValue({ data: [dog('d-1', 'u-1')], isLoading: false });

      const { result } = renderHook(() => useUserAndDogOptions(['u-1'], false));

      expect(result.current.autoSelectedDogIds).toEqual(['d-1']);
    });

    it('leaves the choice open when an owner has several dogs', () => {
      mockUseMultiUserDogs.mockReturnValue({
        data: [dog('d-1', 'u-1'), dog('d-2', 'u-1')],
        isLoading: false,
      });

      const { result } = renderHook(() => useUserAndDogOptions(['u-1'], false));

      expect(result.current.autoSelectedDogIds).toEqual([]);
    });

    it('selects one dog per owner that has exactly one', () => {
      mockUseMultiUserDogs.mockReturnValue({
        data: [dog('d-1', 'u-1'), dog('d-2', 'u-2'), dog('d-3', 'u-2')],
        isLoading: false,
      });

      const { result } = renderHook(() => useUserAndDogOptions(['u-1', 'u-2'], false));

      expect(result.current.autoSelectedDogIds).toEqual(['d-1']);
    });

    // Editing must not silently add a dog the session never had.
    it('never selects automatically while editing', () => {
      mockUseMultiUserDogs.mockReturnValue({ data: [dog('d-1', 'u-1')], isLoading: false });
      const session = { userIds: ['u-1'], exerciseType: ExerciseType.EDUCATION } as unknown as Session;

      const { result } = renderHook(() => useUserAndDogOptions(['u-1'], true, session));

      expect(result.current.autoSelectedDogIds).toEqual([]);
    });

    it('waits for the dogs to be loaded before deciding', () => {
      mockUseMultiUserDogs.mockReturnValue({ data: [dog('d-1', 'u-1')], isLoading: true });

      const { result } = renderHook(() => useUserAndDogOptions(['u-1'], false));

      expect(result.current.autoSelectedDogIds).toEqual([]);
    });

    it('selects nothing when no dog is available', () => {
      const { result } = renderHook(() => useUserAndDogOptions(['u-1'], false));

      expect(result.current.autoSelectedDogIds).toEqual([]);
    });
  });
});
