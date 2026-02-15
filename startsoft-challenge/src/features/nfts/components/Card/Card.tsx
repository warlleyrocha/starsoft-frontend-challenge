import Image from "next/image";
import { Nft } from "../../types/nft.types";
import styles from "./Card.module.scss";
import { Button } from "@/shared/components/Button";

type Props = {
  readonly nft: Nft;
};

export function Card({ nft }: Props) {
  return (
    <article className={styles.card}>
      <div className={styles.imageWrapper}>
        <Image src={nft.image} alt={nft.name} width={216} height={195} />
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{nft.name}</h3>
        <p className={styles.description}>{nft.description}</p>

        <div className={styles.footer}>
          <div className={styles.price}>
            <Image src="/assets/icons/ethereum.svg" alt="" width={29} height={29} aria-hidden />
            <span>{nft.price} ETH</span>
          </div>
        </div>
        <Button size="md" className={styles.buyButton}>
          Comprar
        </Button>
      </div>
    </article>
  );
}
