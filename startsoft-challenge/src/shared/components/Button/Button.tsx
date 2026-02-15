import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.scss";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  children,
  className,
  ...rest
}: Props) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type="button"
      className={[
        styles.button,
        styles[variant],
        styles[size],
        isLoading ? styles.loading : "",
        isDisabled ? styles.disabled : "",
        className ?? "",
      ].join(" ")}
      disabled={isDisabled}
      aria-busy={isLoading}
      {...rest}
    >
      {leftIcon && <span className={styles.icon}>{leftIcon}</span>}

      <span className={styles.label}>{children}</span>

      {isLoading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : (
        rightIcon && <span className={styles.icon}>{rightIcon}</span>
      )}
    </button>
  );
}
