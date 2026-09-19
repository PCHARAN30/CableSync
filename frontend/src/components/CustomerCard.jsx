import { Link } from "react-router-dom";
import { Phone, ChevronRight, MessageSquare, Plus, Clock, AlertCircle } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { formatCurrency, formatDate } from "../utils/format";

const Highlight = ({ text, highlight }) => {
  if (!highlight || !text) return text || "";
  const parts = String(text).split(new RegExp(`(${highlight})`, "gi"));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <strong key={i} className="font-bold text-brass-dark">
            {part}
          </strong>
        ) : (
          part
        ),
      )}
    </span>
  );
};

export default function CustomerCard({ customer, highlight }) {
  const arrears = customer.arrears || customer.billingSnapshot?.arrears || 0;
  const isDue = customer.status === "DUE";
  const isPartial = customer.status === "PARTIAL";
  const daysOverdue = customer.daysOverdue ?? customer.billingSnapshot?.daysOverdue ?? 0;
  const daysRemaining = customer.daysRemaining ?? customer.billingSnapshot?.daysRemaining ?? 0;

  // Clean initials
  const initials = customer.name
    ? customer.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "CU";

  return (
    <article className="group rounded-xl border border-hairline bg-card p-2.5 shadow-2xs transition-colors hover:border-brass/50 sm:p-3">
      {/* Top row: Initial avatar + Customer name + CAF / Phone + Status Badge */}
      <div className="flex items-start justify-between gap-2.5">
        <Link
          to={`/customers/${customer._id}`}
          className="flex min-w-0 flex-1 items-center gap-2.5"
        >
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-hairline bg-paper font-sans text-[11px] font-bold text-ink-soft sm:h-10 sm:w-10">
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono font-semibold text-brass-dark shrink-0">
                #{customer.serialNumber}
              </span>
              <h3 className="truncate text-sm font-semibold text-ink transition-colors group-hover:text-brass-dark sm:text-base">
                <Highlight text={customer.name} highlight={highlight} />
              </h3>
            </div>

            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ink-soft">
              {customer.cafNumber && (
                <span className="font-mono text-ink-soft/90">
                  CAF: <Highlight text={customer.cafNumber} highlight={highlight} />
                </span>
              )}
              {customer.cafNumber && <span>•</span>}
              <span>
                <Highlight text={customer.phone} highlight={highlight} />
              </span>
              {customer.area && (
                <>
                  <span>•</span>
                  <span className="truncate">{customer.area}</span>
                </>
              )}
            </div>
          </div>
        </Link>

        {/* Status Badge & Arrow */}
        <div className="flex shrink-0 items-center gap-1.5">
          <StatusBadge status={customer.status} size="sm" />
          <Link
            to={`/customers/${customer._id}`}
            aria-label={`View ${customer.name}`}
          className="grid h-8 w-8 place-items-center rounded-md text-ink-soft/70 transition-colors hover:bg-paper hover:text-ink"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Subtle dashed divider */}
      <div className="my-2 border-t border-dashed border-hairline/70" />

      {/* Bottom row: Fee / Balance + Action links */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          {arrears > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-md border border-rose-200/90 bg-rose-50 px-2 py-0.5 font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
              Due: <span>{formatCurrency(arrears)}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md border border-hairline/80 bg-paper/60 px-2 py-0.5 font-medium text-ink-soft">
              Plan: <strong className="font-semibold text-ink">{formatCurrency(customer.monthlyFee)}</strong>/mo
            </span>
          )}

          {isDue && daysOverdue > 0 && (
            <span className="hidden sm:inline-flex items-center gap-0.5 text-[11px] text-rose-600 dark:text-rose-400 font-medium">
              <AlertCircle className="h-3 w-3" />
              {daysOverdue}d overdue
            </span>
          )}
          {customer.status === "PAID" && daysRemaining > 0 && (
            <span className="hidden sm:inline-flex items-center gap-0.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <Clock className="h-3 w-3" />
              {daysRemaining}d left
            </span>
          )}
        </div>

        {/* Action icons / Quick Payment */}
        <div className="flex items-center gap-1.5">
          <Link
            to={`/customers/${customer._id}?action=pay`}
            className="inline-flex h-8 items-center gap-1 rounded-md border border-hairline bg-paper px-2.5 text-xs font-semibold text-ink shadow-2xs transition-colors hover:border-brass/60 hover:bg-card"
          >
            <Plus className="h-3.5 w-3.5 text-brass" />
            <span>Pay</span>
          </Link>

          {customer.phone && (
            <>
              <a
                href={`tel:${customer.phone}`}
                aria-label={`Call ${customer.name}`}
                className="grid h-8 w-8 place-items-center rounded-md border border-hairline bg-paper text-ink-soft transition-colors hover:border-brass/40 hover:bg-card hover:text-ink"
                title="Call Subscriber"
              >
                <Phone className="h-3.5 w-3.5" />
              </a>
              <a
                href={`https://wa.me/91${customer.phone.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(customer.name)}%2C%20your%20CableSync%20subscription%20update.`}
                target="_blank"
                rel="noreferrer"
                aria-label={`WhatsApp ${customer.name}`}
                className="grid h-8 w-8 place-items-center rounded-md border border-emerald-200/80 bg-emerald-50 text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-400"
                title="WhatsApp Subscriber"
              >
                <MessageSquare className="h-3.5 w-3.5" />
              </a>
            </>
          )}
        </div>
      </div>
    </article>
      
  );
}
