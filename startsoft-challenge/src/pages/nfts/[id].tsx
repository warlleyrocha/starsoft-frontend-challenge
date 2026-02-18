import Image from "next/image";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import Head from "next/head";

import { Header } from "@/shared/components/Header";
import { Footer } from "@/shared/components/Footer";
import { getNftById } from "@/features/nfts/api/nftApi";
import { selectCartCount } from "@/features/cart/store/cartSelectors";
import type { Nft } from "@/features/nfts/types/nft.types";
import { useAppSelector } from "@/shared/store/hooks";

import styles from "./NftDetailPage.module.scss";

type NftDetailPageProps = {
  readonly nft: Nft;
};

export default function NftDetailPage({ nft }: NftDetailPageProps) {
  const cartCount = useAppSelector(selectCartCount);
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

      <Header cartCount={cartCount} />

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

      <Footer />
    </>
  );
}

export const getServerSideProps: GetServerSideProps<NftDetailPageProps> = async ({ params }) => {
  const id = typeof params?.id === "string" ? params.id : "";
  const nft = await getNftById(id);

  if (!nft) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      nft,
    },
  };
};
