import { useMemo, useState } from "react";
import type { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";

import { Header } from "@/shared/components/Header";
import { Footer } from "@/shared/components/Footer";
import { EmptyState } from "@/shared/components/EmptyState";
import { useAppSelector } from "@/shared/store/hooks";

import { selectCartCount } from "@/features/cart/store/cartSelectors";
import { LoadMore } from "@/features/nfts/components/LoadMore";
import { List } from "@/features/nfts/components/List";
import { NFT_QUERY_DEFAULTS } from "@/features/nfts/config/queryDefaults";
import { getNfts, type GetNftsResult } from "@/features/nfts/api/nftApi";
import { useNftsInfiniteQuery } from "@/features/nfts/hooks/useNftsInfiniteQuery";
import type { Nft } from "@/features/nfts/types/nft.types";

const OverlayCheckout = dynamic(
  () => import("@/features/cart/components/OverlayCheckout").then((mod) => mod.OverlayCheckout),
  {
    loading: () => null,
    // Renderiza o overlay apenas no cliente para evitar acoplamento com SSR.
    ssr: false,
  },
);

type HomeProps = {
  readonly initialNfts: GetNftsResult | null;
};

function mergeById(previous: Nft[], next: Nft[]): Nft[] {
  // Algumas páginas podem repetir itens; garante lista incremental sem duplicar IDs.
  const seen = new Set(previous.map((item) => item.id));
  const uniqueNext = next.filter((item) => !seen.has(item.id));
  return [...previous, ...uniqueNext];
}

export default function Home({ initialNfts }: HomeProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartCount = useAppSelector(selectCartCount);

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

  return (
    <>
      <Head>
        <title>Marketplace de NFTs | Starsoft Challenge</title>
        <meta
          name="description"
          content="Explore a listagem de NFTs, veja os detalhes de cada item e gerencie seu carrinho."
          key="description"
        />
        <meta property="og:title" content="Lista de NFTs | Starsoft Challenge" />
        <meta
          property="og:description"
          content="Explore a listagem de NFTs, veja os detalhes de cada item e gerencie seu carrinho."
        />
      </Head>

      <Header cartCount={cartCount} onCartButtonClick={() => setIsCartOpen(true)} />

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
      rows: NFT_QUERY_DEFAULTS.rowsPerPage,
      sortBy: NFT_QUERY_DEFAULTS.sortBy,
      orderBy: NFT_QUERY_DEFAULTS.orderBy,
    });

    return {
      props: {
        initialNfts,
      },
    };
  } catch {
    // Mantém a página renderizável mesmo se a API falhar no SSR.
    return {
      props: {
        initialNfts: null,
      },
    };
  }
};
