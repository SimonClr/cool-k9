import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactElement, ReactNode } from 'react';

type QueryWrapper = ((props: { children: ReactNode }) => ReactElement) & {
  /** The client behind the wrapper, so a test can spy on its cache operations. */
  queryClient: QueryClient;
};

/**
 * Wraps hooks under test in a React Query provider.
 *
 * Retries are disabled: with the default policy a rejected query is retried with
 * a growing delay, so a test asserting the error state would wait for the whole
 * schedule before seeing it — or time out first.
 */
export function createQueryWrapper(): QueryWrapper {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  wrapper.queryClient = queryClient;

  return wrapper;
}
