import Image from "next/image";
import Link from "next/link";
import styles from "./Header.module.scss";

type Props = {
  readonly cartCount?: number;
  readonly onCartButtonClick?: () => void;
};

export function Header({ cartCount = 0, onCartButtonClick }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="Ir para a home">
          <Image src="/assets/logo.svg" alt="Starsoft" width={101} height={38} priority />
        </Link>

        <button
          type="button"
          className={styles.cartButton}
          aria-label="Abrir carrinho"
          onClick={onCartButtonClick}
        >
          <Image
            src="/assets/icons/bag.svg"
            alt="Carrinho de compras"
            width={34}
            height={34}
            aria-hidden="true"
          />

          <span className={styles.cartCount} aria-label={`${cartCount} itens no carrinho`}>
            {cartCount}
          </span>
        </button>
      </div>
    </header>
  );
}
