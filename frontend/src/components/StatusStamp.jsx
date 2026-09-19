import React from "react";

const VARIANTS = {
  PAID: {
    label: "PAID",
    className: "paid",
    lightSrc: "/badges/badge-paid.svg",
    darkSrc: "/badges/badge-paid-dark.svg",
    alt: "PAID - Subscription settled",
  },
  PARTIAL: {
    label: "PARTIAL",
    className: "partial",
    lightSrc: "/badges/badge-partial.svg",
    darkSrc: "/badges/badge-partial-dark.svg",
    alt: "PARTIAL - Partial payment recorded",
  },
  DUE: {
    label: "DUE",
    className: "due",
    lightSrc: "/badges/badge-due.svg",
    darkSrc: "/badges/badge-due-dark.svg",
    alt: "DUE - Outstanding balance due",
  },
  INACTIVE: {
    label: "INACTIVE",
    className: "inactive",
    lightSrc: "/badges/badge-inactive.svg",
    darkSrc: "/badges/badge-inactive-dark.svg",
    alt: "INACTIVE - Account deactivated",
  },
};

export default function StatusStamp({ status, size = "md", className = "" }) {
  const normalizedStatus = String(status || "DUE").toUpperCase();
  const variant = VARIANTS[normalizedStatus] || VARIANTS.DUE;

  const sizeClass =
    {
      xs: "h-5 sm:h-6 w-auto max-h-6",
      sm: "h-7 sm:h-8 w-auto max-h-8",
      md: "h-8 sm:h-9 w-auto max-h-9",
      lg: "h-11 sm:h-12 w-auto max-h-12",
    }[size] || "h-8 sm:h-9 w-auto max-h-9";

  return (
    <span
      role="status"
      aria-label={variant.alt}
      title={variant.alt}
      className={`inline-flex shrink-0 select-none items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 ${className}`}
    >
      <img
        src={variant.lightSrc}
        alt={variant.alt}
        referrerPolicy="no-referrer"
        loading="eager"
        decoding="async"
        className={`badge-img-light ${sizeClass} object-contain`}
      />
      <img
        src={variant.darkSrc}
        alt={variant.alt}
        referrerPolicy="no-referrer"
        loading="eager"
        decoding="async"
        className={`badge-img-dark ${sizeClass} object-contain`}
      />
    </span>
  );
}


