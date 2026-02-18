import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          // O apiClient padroniza erros como "HTTP <status>: <mensagem>", então 4xx é tratado sem retry.
          const message = error instanceof Error ? error.message : "";
          const isClientError = message.startsWith("HTTP 4");

          if (isClientError) return false;
          // Permite até 2 tentativas de retry para falhas transitórias (rede/5xx).
          return failureCount < 2;
        },
        // Evita refetch agressivo ao trocar de aba e mantém atualização ao reconectar.
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
