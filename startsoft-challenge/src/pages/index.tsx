import { useState } from "react";
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
import { useHomeNftsPage } from "@/features/nfts/hooks/useHomeNftsPage";

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

export default function Home({ initialNfts }: HomeProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartCount = useAppSelector(selectCartCount);
  const {
    visibleItems,
    isInitialLoading,
    isError,
    errorMessage,
    isEmptySuccess,
    loadMoreLabel,
    progress,
    handleLoadMore,
    isLoadingMore,
  } = useHomeNftsPage(initialNfts);

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
