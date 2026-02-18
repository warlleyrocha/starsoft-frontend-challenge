import { useMemo } from "react";
import type { GetNftsResult } from "../api/nftApi";
import { NFT_QUERY_DEFAULTS } from "../config/queryDefaults";
import { useNftsInfiniteQuery } from "./useNftsInfiniteQuery";
import type { Nft } from "../types/nft.types";

function mergeById(previous: Nft[], next: Nft[]): Nft[] {
  // Algumas páginas podem repetir itens; garante lista incremental sem duplicar IDs.
  const seen = new Set(previous.map((item) => item.id));
  const uniqueNext = next.filter((item) => !seen.has(item.id));
  return [...previous, ...uniqueNext];
}

export function useHomeNftsPage(initialNfts: GetNftsResult | null) {
  const { data, isLoading, isFetchingNextPage, isError, error, hasNextPage, fetchNextPage } =
    useNftsInfiniteQuery(
      {
        rows: NFT_QUERY_DEFAULTS.rowsPerPage,
        sortBy: NFT_QUERY_DEFAULTS.sortBy,
        orderBy: NFT_QUERY_DEFAULTS.orderBy,
      },
      {
        initialData: initialNfts ?? undefined,
      },
    );

  const visibleItems = useMemo<Nft[]>(() => {
    if (!data) return [];

    return data.pages.reduce<Nft[]>((items, pageData) => mergeById(items, pageData.items), []);
  }, [data]);

  const totalCount = data?.pages[0]?.count ?? initialNfts?.count ?? 0;
  const hasViewedAll =
    (totalCount > 0 && visibleItems.length >= totalCount) || hasNextPage === false;
  const isInitialLoading = isLoading && visibleItems.length === 0;
  const isLoadingMore = isFetchingNextPage;
  const isEmptySuccess = !isInitialLoading && !isError && visibleItems.length === 0;
  const progress = totalCount > 0 ? Math.round((visibleItems.length / totalCount) * 100) : 0;
  const errorMessage = error instanceof Error ? error.message : "Erro ao carregar NFTs.";
  const loadMoreLabel = hasViewedAll ? "Você já visualizou tudo" : "Carregar mais";

  const handleLoadMore = () => {
    // Evita avançar paginação quando já exibiu tudo ou quando uma página já está em carregamento.
    if (hasViewedAll || isLoadingMore) return;
    void fetchNextPage();
  };

  return {
    errorMessage,
    handleLoadMore,
    isEmptySuccess,
    isError,
    isInitialLoading,
    isLoadingMore,
    loadMoreLabel,
    progress,
    visibleItems,
  };
}
