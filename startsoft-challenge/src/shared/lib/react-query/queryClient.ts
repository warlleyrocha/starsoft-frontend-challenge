import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          const message = error instanceof Error ? error.message : "";
          const isClientError = message.startsWith("HTTP 4");

          if (isClientError) return false;
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        staleTime: 1000 * 30, // 30s
        gcTime: 1000 * 60 * 5, // 5min (v5 usa gcTime)
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
