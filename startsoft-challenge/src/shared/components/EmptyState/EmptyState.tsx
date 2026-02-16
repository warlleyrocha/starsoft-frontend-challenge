import styles from "./EmptyState.module.scss";

type Props = {
  readonly title: string;
  readonly description?: string;
};

export function EmptyState({ title, description }: Props) {
  return (
    <section className={styles.wrapper} role="status" aria-live="polite">
      <h2 className={styles.title}>{title}</h2>
      {description && <p className={styles.description}>{description}</p>}
    </section>
  );
}
