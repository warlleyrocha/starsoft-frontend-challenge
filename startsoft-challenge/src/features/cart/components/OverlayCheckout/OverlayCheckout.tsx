import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import styles from "./OverlayCheckout.module.scss";
import { Button } from "@/shared/components/Button";
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";
import { selectCartItems, selectCartTotalEth } from "../../store/cartSelectors";
import { decreaseQuantity, increaseQuantity, removeItem } from "../../store/cartSlice";

type Props = {
  readonly isOpen: boolean;
  readonly onClose: () => void;
};

export function OverlayCheckout({ isOpen, onClose }: Props) {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const totalEth = useAppSelector(selectCartTotalEth);
  const hasItems = cartItems.length > 0;

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
              {!hasItems && <p className={styles.emptyState}>Seu carrinho est&aacute; vazio.</p>}

              {cartItems.map((item) => (
                <div key={item.id} className={styles.itemCard}>
                  <div className={styles.thumb}>
                    <Image src={item.image} alt={item.name} width={161} height={161} />
                  </div>

                  <div className={styles.itemInfo}>
                    <strong className={styles.itemName}>{item.name}</strong>
                    {item.description && <p className={styles.itemDesc}>{item.description}</p>}

                    <div className={styles.priceRow}>
                      <Image
                        src="/assets/icons/ethereum.svg"
                        alt=""
                        width={29}
                        height={29}
                        aria-hidden="true"
                      />
                      <span>{item.price} ETH</span>
                    </div>

                    <div className={styles.actionsRow}>
                      <div className={styles.qty}>
                        <button
                          type="button"
                          onClick={() => dispatch(decreaseQuantity({ id: item.id }))}
                          aria-label={`Diminuir quantidade de ${item.name}`}
                        >
                          <Image
                            src="/assets/icons/minus.svg"
                            alt="Diminuir quantidade"
                            width={16}
                            height={16}
                            aria-hidden="true"
                          />
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          type="button"
                          onClick={() => dispatch(increaseQuantity({ id: item.id }))}
                          aria-label={`Aumentar quantidade de ${item.name}`}
                        >
                          <Image
                            src="/assets/icons/add.svg"
                            alt="Aumentar quantidade"
                            width={16}
                            height={16}
                            aria-hidden="true"
                          />
                        </button>
                      </div>

                      <button
                        type="button"
                        className={styles.trash}
                        aria-label={`Remover ${item.name} do carrinho`}
                        onClick={() => dispatch(removeItem({ id: item.id }))}
                      >
                        <Image
                          src="/assets/icons/trash.svg"
                          alt="Lixeira"
                          width={25}
                          height={25}
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

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
                  {totalEth} ETH
                </span>
              </div>

              <Button size="lg" variant="primary" type="button" disabled={!hasItems}>
                Finalizar Compra
              </Button>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
