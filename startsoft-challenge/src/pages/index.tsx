import { useEffect, useState } from "react";
import type { GetServerSideProps } from "next";

import { Header } from "@/shared/components/Header";
import { Footer } from "@/shared/components/Footer";
import { EmptyState } from "@/shared/components/EmptyState";

import { OverlayCheckout } from "@/features/cart/components/OverlayCheckout";
import { LoadMore } from "@/features/nfts/components/LoadMore";
import { List } from "@/features/nfts/components/List";
import { getNfts, type GetNftsResult } from "@/features/nfts/api/nftApi";
import { useNftsQuery } from "@/features/nfts/hooks/useNftsQuery";
import type { Nft } from "@/features/nfts/types/nft.types";

const ROWS_PER_PAGE = 8;
const SORT_BY = "name";
const ORDER_BY = "ASC" as const;

type HomeProps = {
  readonly initialNfts: GetNftsResult | null;
};

function mergeById(previous: Nft[], next: Nft[]): Nft[] {
  const seen = new Set(previous.map((item) => item.id));
  const uniqueNext = next.filter((item) => !seen.has(item.id));
  return [...previous, ...uniqueNext];
}

export default function Home({ initialNfts }: HomeProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [visibleItems, setVisibleItems] = useState<Nft[]>(() => initialNfts?.items ?? []);
  const [totalCount, setTotalCount] = useState(() => initialNfts?.count ?? 0);

  const { data, isLoading, isFetching, isError, error } = useNftsQuery(
    {
      page,
      rows: ROWS_PER_PAGE,
      sortBy: SORT_BY,
      orderBy: ORDER_BY,
    },
    {
      initialData: page === 1 ? initialNfts ?? undefined : undefined,
    }
  );

  useEffect(() => {
    if (!data) return;

    setTotalCount(data.count);
    setVisibleItems((prev) => (page === 1 ? data.items : mergeById(prev, data.items)));
  }, [data, page]);

  const hasViewedAll = totalCount > 0 && visibleItems.length >= totalCount;
  const isInitialLoading = isLoading && visibleItems.length === 0;
  const isLoadingMore = isFetching && !isInitialLoading;
  const isEmptySuccess = !isInitialLoading && !isError && visibleItems.length === 0;
  const progress = totalCount > 0 ? Math.round((visibleItems.length / totalCount) * 100) : 0;

  const errorMessage = error instanceof Error ? error.message : "Erro ao carregar NFTs.";
  const loadMoreLabel = hasViewedAll ? "Você já visualizou tudo" : "Carregar mais";

  const handleLoadMore = () => {
    if (hasViewedAll || isLoadingMore) return;
    setPage((prev) => prev + 1);
  };

  return (
    <>
      <Header cartCount={2} onCartButtonClick={() => setIsCartOpen(true)} />

      <main className="container">
        {isInitialLoading && <p>Carregando NFTs...</p>}
        {isError && visibleItems.length === 0 && <p>{errorMessage}</p>}
        {isEmptySuccess && (
          <EmptyState
            title="Nenhum NFT encontrado"
            description="Ainda não existem itens para exibir nesta listagem."
          />
        )}

        {visibleItems.length > 0 && (
          <>
            <List items={visibleItems} />
            <LoadMore
              label={loadMoreLabel}
              progress={progress}
              onClick={handleLoadMore}
              isLoading={isLoadingMore}
            />
          </>
        )}

        {isError && visibleItems.length > 0 && <p>{errorMessage}</p>}
      </main>

      <OverlayCheckout isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <Footer />
    </>
  );
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  try {
    const initialNfts = await getNfts({
      page: 1,
      rows: ROWS_PER_PAGE,
      sortBy: SORT_BY,
      orderBy: ORDER_BY,
    });

    return {
      props: {
        initialNfts,
      },
    };
  } catch {
    return {
      props: {
        initialNfts: null,
      },
    };
  }
};
