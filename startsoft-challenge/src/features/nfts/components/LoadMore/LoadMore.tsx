import { Button } from "@/shared/components/Button";
import styles from "./LoadMore.module.scss";

type Props = {
  readonly label: string;
  readonly progress: number;
  readonly onClick: () => void;
  readonly isLoading?: boolean;
};

export function LoadMore({ label, progress, onClick, isLoading = false }: Props) {
  const safeProgress = Math.min(100, Math.max(0, progress));

  return (
    <section className={styles.wrapper}>
      <div className={styles.bar} aria-hidden="true">
        <div className={styles.fill} style={{ width: `${safeProgress}%` }} />
      </div>

      <Button variant="ghost" size="lg" onClick={onClick} isLoading={isLoading} className={styles.button}>
        {label}
      </Button>
    </section>
  );
}
