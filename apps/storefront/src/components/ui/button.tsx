import { clsx } from "clsx"

type ButtonProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  variant?: "primary" | "secondary" | "danger" | "transparent";
  size?: "full" | "fit";
};

export const Button = ({
  variant = "primary",
  className,
  size = "full",
  ...props
}: ButtonProps) => {
  return (
    <button
      {...props}
      className={clsx(
        "cursor-pointer disabled:cursor-default",
        "inline-flex items-center justify-center gap-2 px-5 py-2.5",
        "rounded-full shadow-none appearance-none border",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "text-sm font-medium tracking-wide",
        "transition-all duration-200",
        size === "full" && "w-full",
        size === "fit" && "w-fit",
        {
          "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] active:bg-[var(--color-primary-dark)] border-transparent":
            variant === "primary",
          "bg-white text-[var(--color-text)] hover:bg-[var(--color-primary-50)] active:bg-[var(--color-primary-50)] border-[var(--color-border-light)]":
            variant === "secondary",
          "bg-rose-500 text-white hover:bg-rose-600 active:bg-rose-900 border-transparent":
            variant === "danger",
          "bg-transparent text-[var(--color-text)] hover:bg-transparent active:bg-transparent border-transparent":
            variant === "transparent",
        },
        className
      )}
    />
  )
}
