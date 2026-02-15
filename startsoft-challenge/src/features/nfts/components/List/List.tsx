import { Nft } from "../../types/nft.types";
import { Card } from "../Card/Card";
import styles from "./List.module.scss";

type Props = {
  readonly items: Nft[];
};

export function List({ items }: Props) {
  return (
    <section className={styles.grid}>
      {items.map((nft) => (
        <Card key={nft.id} nft={nft} />
      ))}
    </section>
  );
}
