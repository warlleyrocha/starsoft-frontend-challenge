import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Nft } from "../../types/nft.types";
import styles from "./Card.module.scss";
import { Button } from "@/shared/components/Button";
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";
import { addItem } from "@/features/cart/store/cartSlice";
import { selectCartItemById } from "@/features/cart/store/cartSelectors";

type Props = {
  readonly nft: Nft;
};

export function Card({ nft }: Props) {
  const dispatch = useAppDispatch();
  const cartItem = useAppSelector(selectCartItemById(nft.id));

  const handleAddToCart = () => {
    dispatch(
      addItem({
        id: nft.id,
        name: nft.name,
        description: nft.description,
        price: nft.price,
        image: nft.image,
      }),
    );
  };

  return (
    <article className={styles.card}>
      <div className={styles.imageWrapper}>
        <Image src={nft.image} alt={nft.name} width={216} height={195} />
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{nft.name}</h3>
        <p className={styles.description}>{nft.description}</p>

        <div className={styles.actions}>
          <div className={styles.footer}>
            <div className={styles.price}>
              <Image src="/assets/icons/ethereum.svg" alt="" width={29} height={29} aria-hidden />
              <span>{nft.price} ETH</span>
            </div>
          </div>

          <Link href={`/nfts/${nft.id}`} className={styles.detailsLink}>
            <motion.span
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
            >
              Ver detalhes
            </motion.span>
          </Link>

          <Button size="md" className={styles.buyButton} onClick={handleAddToCart}>
            {cartItem ? "Adicionado ao carrinho" : "Comprar"}
          </Button>
        </div>
      </div>
    </article>
  );
}
