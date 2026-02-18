import Image from "next/image";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useMemo, useState } from "react";
import { type InfiniteData, useQueryClient } from "@tanstack/react-query";

import { Header } from "@/shared/components/Header";
import { Footer } from "@/shared/components/Footer";
import { EmptyState } from "@/shared/components/EmptyState";
import { getNftById, type GetNftsResult } from "@/features/nfts/api/nftApi";
import { nftKeys } from "@/features/nfts/api/nftKeys";
import { NFT_QUERY_DEFAULTS } from "@/features/nfts/config/queryDefaults";
import { selectCartCount } from "@/features/cart/store/cartSelectors";
import type { Nft } from "@/features/nfts/types/nft.types";
import { useAppSelector } from "@/shared/store/hooks";

import styles from "./NftDetailPage.module.scss";

type NftDetailPageSuccessProps = {
  readonly nft: Nft;
};

type NftDetailPageErrorProps = {
  readonly nft: null;
  readonly hasError: true;
  readonly errorMessage: string;
  readonly requestedId: string;
};

type NftDetailPageProps = NftDetailPageSuccessProps | NftDetailPageErrorProps;

const OverlayCheckout = dynamic(
  () => import("@/features/cart/components/OverlayCheckout").then((mod) => mod.OverlayCheckout),
  {
    loading: () => null,
    ssr: false,
  },
);

function getReadableError(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.trim();
    // Evita exibir mensagem técnica de rede para o usuário final.
    if (/^fetch failed$/i.test(message)) {
      return "Nao foi possivel conectar com a API no momento. Tente novamente em instantes.";
    }

    if (message) return message;
  }

  return "Nao foi possivel carregar os detalhes deste NFT no momento.";
}

export default function NftDetailPage(props: NftDetailPageProps) {
  const { nft } = props;
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartCount = useAppSelector(selectCartCount);
  const queryClient = useQueryClient();

  const fallbackNft = useMemo(() => {
    if (nft || !("hasError" in props) || !props.hasError) return null;

    const targetId = props.requestedId.trim();
    if (!targetId) return null;

    const cachedList = queryClient.getQueryData<InfiniteData<GetNftsResult>>(
      nftKeys.infiniteList({
        rows: NFT_QUERY_DEFAULTS.rowsPerPage,
        sortBy: NFT_QUERY_DEFAULTS.sortBy,
        orderBy: NFT_QUERY_DEFAULTS.orderBy,
      }),
    );
    if (!cachedList) return null;

    for (const page of cachedList.pages) {
      const found = page.items.find((item) => item.id === targetId);
      if (found) return found;
    }

    return null;
  }, [nft, props, queryClient]);

  const resolvedNft = nft ?? fallbackNft;
  const detailErrorMessage =
    "hasError" in props ? props.errorMessage : "Nao foi possivel carregar os detalhes deste NFT.";

  if (!resolvedNft) {
    return (
      <>
        <Head>
          <title>Erro ao carregar NFT | Starsoft Challenge</title>
          <meta
            name="description"
            content="Nao foi possivel carregar os detalhes do NFT selecionado."
            key="description"
          />
        </Head>

        <Header cartCount={cartCount} onCartButtonClick={() => setIsCartOpen(true)} />

        <main className="container">
          <section className={styles.wrapper}>
            <Link href="/" className={styles.backLink}>
              Voltar para a listagem
            </Link>

            <EmptyState
              title="Nao foi possivel carregar este NFT"
              description={detailErrorMessage}
            />
          </section>
        </main>

        <OverlayCheckout isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

        <Footer />
      </>
    );
  }

  // Reaproveita o mesmo título para SEO e Open Graph.
  const pageTitle = `${resolvedNft.name} | Starsoft Challenge`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={resolvedNft.description} key="description" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={resolvedNft.description} />
        <meta property="og:image" content={resolvedNft.image} />
      </Head>

      <Header cartCount={cartCount} onCartButtonClick={() => setIsCartOpen(true)} />

      <main className="container">
        <section className={styles.wrapper}>
          <Link href="/" className={styles.backLink}>
            Voltar para a listagem
          </Link>

          <article className={styles.card}>
            <div className={styles.imageWrapper}>
              <Image
                src={resolvedNft.image}
                alt={resolvedNft.name}
                width={420}
                height={360}
                priority
                sizes="(max-width: 600px) calc(100vw - 48px), 420px"
              />
            </div>

            <div className={styles.content}>
              <h1 className={styles.title}>{resolvedNft.name}</h1>
              <p className={styles.description}>{resolvedNft.description}</p>

              <div className={styles.meta}>
                <span className={styles.value}>ID: {resolvedNft.id}</span>
              </div>

              <div className={styles.priceRow}>
                <Image src="/assets/icons/ethereum.svg" alt="" width={28} height={28} aria-hidden />
                <strong>{resolvedNft.price} ETH</strong>
              </div>
            </div>
          </article>
        </section>
      </main>

      <OverlayCheckout isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <Footer />
    </>
  );
}

export const getServerSideProps: GetServerSideProps<NftDetailPageProps> = async ({ params }) => {
  // Garante valor string para a busca, mesmo em rotas malformadas.
  const id = typeof params?.id === "string" ? params.id : "";

  try {
    const nft = await getNftById(id);

    if (!nft) {
      // Delega para o Next.js a resposta 404 quando o item não existe.
      return {
        notFound: true,
      };
    }

    return {
      props: {
        nft,
      },
    };
  } catch (error) {
    // Mantém a rota navegável com fallback visual mesmo em falha de rede no SSR.
    return {
      props: {
        nft: null,
        hasError: true,
        errorMessage: getReadableError(error),
        requestedId: id,
      },
    };
  }
};
