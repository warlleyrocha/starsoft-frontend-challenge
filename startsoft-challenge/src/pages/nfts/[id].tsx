import Image from "next/image";
import Link from "next/link";
import type { GetServerSideProps } from "next";

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

  return (
    <>
      <Header cartCount={cartCount} />

      <main className="container">
        <section className={styles.wrapper}>
          <Link href="/" className={styles.backLink}>
            Voltar para a listagem
          </Link>

          <article className={styles.card}>
            <div className={styles.imageWrapper}>
              <Image src={nft.image} alt={nft.name} width={420} height={360} />
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
