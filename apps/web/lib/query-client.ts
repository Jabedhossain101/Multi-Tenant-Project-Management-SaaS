import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      gcTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error) => {
        // Do not retry 401, 403, 404 errors
        if (
          error &&
          typeof error === 'object' &&
          'statusCode' in error &&
          [401, 403, 404].includes((error as { statusCode: number }).statusCode)
        ) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
