import { useState } from "react";
import { Button } from "@/shared/components/Button";
import styles from "./LoadMore.module.scss";

export function LoadMore() {
  const [progress, setProgress] = useState<50 | 100>(50);

  const isComplete = progress === 100;

  const handleClick = () => {
    setProgress((prev) => (prev === 50 ? 100 : 50));
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.bar} aria-hidden="true">
        <div className={styles.fill} style={{ width: `${progress}%` }} />
      </div>

      <Button variant="ghost" size="lg" onClick={handleClick} className={styles.button}>
        {isComplete ? "Você já viu tudo" : "Carregar mais"}
      </Button>
    </section>
  );
}
