import type { MouseEventHandler, ReactNode } from "react";

type ActionButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "dark" | "light" | "outline" | "white" | "soft";
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit" | "reset";
  ariaLabel?: string;
  arrow?: "text" | "cta" | "none";
};

const actionVariants = {
  dark: "bg-[#14131a] text-white",
  light: "border-border bg-white text-ink",
  outline: "border-[#bdb8ad] bg-white/75 text-ink",
  white: "border-white bg-white text-navy",
  soft: "border-transparent bg-soft text-ink",
};

const actionBase =
  "inline-flex min-h-control items-center justify-between gap-cluster-sm rounded-pill border px-4 text-button font-strong transition-all duration-200 hover:-translate-y-0.5 hover:shadow-button focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-3";

export function ActionButton({
  children,
  href,
  variant = "dark",
  className = "",
  onClick,
  type = "button",
  ariaLabel,
  arrow = "text",
}: ActionButtonProps) {
  const classes = `${actionBase} ${actionVariants[variant]} ${className}`.trim();
  const content = (
    <>
      <span>{children}</span>
      {arrow !== "none" ? (
        <span
          className={`inline-flex size-[18px] shrink-0 items-center justify-center text-icon-action ${
            arrow === "cta" ? "size-[26px] bg-[url('/figma/cta-arrow-circle.svg')] bg-contain bg-center bg-no-repeat text-transparent" : ""
          }`.trim()}
          aria-hidden="true"
        >
          ↗
        </span>
      ) : null}
    </>
  );

  if (href) {
    return (
      <a className={classes} href={href} aria-label={ariaLabel}>
        {content}
      </a>
    );
  }

  return (
    <button className={classes} type={type} onClick={onClick} aria-label={ariaLabel}>
      {content}
    </button>
  );
}

export function TextLink({ children, href = "#contact" }: { children: ReactNode; href?: string }) {
  return (
    <a className="font-strong transition-colors hover:text-pink" href={href}>
      {children} <span className="text-pink" aria-hidden="true">↗</span>
    </a>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  id,
  className = "",
  size = "default",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  id?: string;
  className?: string;
  size?: "default" | "compact" | "large";
}) {
  const titleClass = size === "compact" ? "text-subheading" : size === "large" ? "text-section-title" : "text-heading";
  const eyebrowClass = size === "compact" ? "mb-cluster-xs text-overline" : "mb-cluster-sm text-label";
  const descriptionClass = size === "compact" ? "mt-0 text-body-xs" : "mt-cluster-sm text-body";

  return (
    <div className={`max-w-[780px] ${className}`.trim()}>
      <p className={`text-pink uppercase ${eyebrowClass}`.trim()}>{eyebrow}</p>
      <h2 className={`text-ink ${titleClass}`.trim()} id={id}>{title}</h2>
      {description ? <p className={`max-w-[700px] text-muted ${descriptionClass}`.trim()}>{description}</p> : null}
    </div>
  );
}

export function LogoLockup({ light = false, className = "", href = "#top" }: { light?: boolean; className?: string; href?: string }) {
  return (
    <a
      className={`flex w-[178px] min-w-[178px] flex-col justify-center ${className}`.trim()}
      href={href}
      aria-label="Limex home"
    >
      <span className={`font-brand text-logo font-display ${light ? "text-white" : "text-ink"}`.trim()}>LIMEX</span>
    </a>
  );
}

export function ExternalArrow() {
  return <span className="font-strong text-pink" aria-hidden="true">↗</span>;
}

export function SearchIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg className={`${className} text-muted`.trim()} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="6.4" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16 16 4.2 4.2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}
