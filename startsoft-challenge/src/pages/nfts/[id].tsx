import Image from "next/image";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useState } from "react";

import { Header } from "@/shared/components/Header";
import { Footer } from "@/shared/components/Footer";
import { EmptyState } from "@/shared/components/EmptyState";
import { getNftById } from "@/features/nfts/api/nftApi";
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
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Nao foi possivel carregar os detalhes deste NFT no momento.";
}

export default function NftDetailPage(props: NftDetailPageProps) {
  const { nft } = props;
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartCount = useAppSelector(selectCartCount);

  if (!nft) {
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
              description={props.errorMessage}
            />
          </section>
        </main>

        <OverlayCheckout isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

        <Footer />
      </>
    );
  }

  // Reaproveita o mesmo título para SEO e Open Graph.
  const pageTitle = `${nft.name} | Starsoft Challenge`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={nft.description} key="description" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={nft.description} />
        <meta property="og:image" content={nft.image} />
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
                src={nft.image}
                alt={nft.name}
                width={420}
                height={360}
                priority
                sizes="(max-width: 600px) calc(100vw - 48px), 420px"
              />
            </div>

            <div className={styles.content}>
              <h1 className={styles.title}>{nft.name}</h1>
              <p className={styles.description}>{nft.description}</p>

              <div className={styles.meta}>
                <span className={styles.value}>ID: {nft.id}</span>
              </div>

              <div className={styles.priceRow}>
                <Image src="/assets/icons/ethereum.svg" alt="" width={28} height={28} aria-hidden />
                <strong>{nft.price} ETH</strong>
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

export const getServerSideProps: GetServerSideProps<NftDetailPageProps> = async ({ params, res }) => {
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
    // Sinaliza indisponibilidade temporaria da API no retorno SSR.
    res.statusCode = 503;

    return {
      props: {
        nft: null,
        hasError: true,
        errorMessage: getReadableError(error),
      },
    };
  }
};
