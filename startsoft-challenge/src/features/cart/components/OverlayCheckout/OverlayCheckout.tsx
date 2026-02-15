import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import styles from "./OverlayCheckout.module.scss";
import { Button } from "@/shared/components/Button";

type Props = {
  readonly isOpen: boolean;
  readonly onClose: () => void;
};

export function OverlayCheckout({ isOpen, onClose }: Props) {
  // fecha com ESC
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    globalThis.addEventListener("keydown", onKeyDown);
    return () => globalThis.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  // trava scroll quando aberto
  useEffect(() => {
    if (!isOpen) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
          aria-hidden="true"
        >
          <motion.aside
            className={styles.drawer}
            role="dialog"
            aria-modal="true"
            aria-label="Mochila de Compras"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <header className={styles.header}>
              <button
                type="button"
                className={styles.backButton}
                onClick={onClose}
                aria-label="Fechar carrinho"
              >
                <Image
                  src="/assets/icons/arrow-left.svg"
                  alt="Seta para esquerda"
                  width={33}
                  height={33}
                  aria-hidden="true"
                />
              </button>

              <h2 className={styles.title}>Mochila de Compras</h2>

              <div className={styles.headerSpacer} />
            </header>

            <div className={styles.content}>
              {/* Por enquanto, mock. Depois renderiza itens do Redux */}
              <div className={styles.itemCard}>
                <div className={styles.thumb}>
                  <Image
                    src="/assets/images/spirit-lantern.svg"
                    alt="NFT"
                    width={161}
                    height={161}
                  />
                </div>

                <div className={styles.itemInfo}>
                  <strong className={styles.itemName}>ITEM 2</strong>
                  <p className={styles.itemDesc}>Redesigned from scratch and completely revised.</p>

                  <div className={styles.priceRow}>
                    <Image
                      src="/assets/icons/ethereum.svg"
                      alt=""
                      width={29}
                      height={29}
                      aria-hidden="true"
                    />
                    <span>12 ETH</span>
                  </div>

                  <div className={styles.qty}>
                    <button type="button">
                      <Image
                        src="/assets/icons/minus.svg"
                        alt="Diminuir quantidade"
                        width={16}
                        height={16}
                        aria-hidden="true"
                      />
                    </button>

                    <span>1</span>

                    <button type="button">
                      <Image
                        src="/assets/icons/add.svg"
                        alt="Aumentar quantidade"
                        width={16}
                        height={16}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>

                <button type="button" className={styles.trash} aria-label="Remover item">
                  <Image
                    src="/assets/icons/trash.svg"
                    alt="Lixeira"
                    width={25}
                    height={25}
                    aria-hidden="true"
                  />
                </button>
              </div>

              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>TOTAL</span>

                <span className={styles.totalValue}>
                  <Image
                    src="/assets/icons/ethereum.svg"
                    alt=""
                    width={34}
                    height={34}
                    aria-hidden="true"
                  />
                  44 ETH
                </span>
              </div>

              <Button size="lg" variant="primary" type="button">
                Finalizar Compra
              </Button>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
