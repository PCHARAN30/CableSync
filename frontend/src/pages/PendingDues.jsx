import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowUpRight, ReceiptText, Users, MessageCircle } from "lucide-react";
import TopBar from "../components/TopBar";
import StatusBadge from "../components/StatusBadge";
import api from "../services/api";
import { formatCurrency } from "../utils/format";
import { buildReminderMessage, buildWhatsAppLink } from "../utils/whatsapp";

const RANGES = [
  { value: "any", label: "Any days overdue" },
  { value: "1-7", label: "1 – 7 days" },
  { value: "8-30", label: "8 – 30 days" },
  { value: "31-60", label: "31 – 60 days" },
  { value: "61+", label: "61+ days" },
];

function matchesRange(days, range) {
  if (range === "any") return true;
  if (range === "61+") return days >= 61;
  const [min, max] = range.split("-").map(Number);
  return days >= min && days <= max;
}

export default function PendingDues() {
  const [range, setRange] = useState("any");
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["pendingDues"],
    queryFn: () => api.get("/reports/pending-dues").then((res) => res.data),
  });

  const filteredCustomers = useMemo(() => {
    if (!data?.customers) return [];
    return data.customers.filter((c) => matchesRange(c.daysOverdue ?? 0, range));
  }, [data, range]);

  const filteredTotal = useMemo(
    () => filteredCustomers.reduce((sum, c) => sum + c.arrears, 0),
    [filteredCustomers],
  );

  return (
    <div className="min-h-screen pb-20 md:pb-12 bg-paper text-ink">
      <TopBar title="Pending dues" backTo="/collections" />
      <main className="mx-auto max-w-5xl px-3 py-4 sm:px-6 lg:py-6">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">Outstanding Balances</h1>
            <p className="text-xs text-ink-soft">Subscribers prioritized by pending collection amount</p>
          </div>
          <button
            onClick={() => refetch()}
            className="self-start rounded-lg border border-hairline bg-paper px-3 py-1.5 text-xs font-semibold text-ink hover:bg-card transition-colors shadow-2xs sm:self-auto"
            disabled={isFetching}
          >
            {isFetching ? "Refreshing…" : "Refresh Report"}
          </button>
        </div>

        {isLoading && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="h-24 animate-pulse rounded-xl bg-card" />
            <div className="h-24 animate-pulse rounded-xl bg-card" />
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-due/20 bg-due-soft p-6 text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-due" />
            <h2 className="mt-2 text-sm font-semibold text-ink">Couldn’t load pending dues</h2>
            <p className="mt-1 text-xs text-ink-soft">{error.message}</p>
            <button onClick={() => refetch()} className="btn-prism mt-3 px-3 py-1.5 text-xs">
              Try again
            </button>
          </div>
        )}

        {data && (
          <>
            <section className="mb-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-hairline bg-card p-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink-soft">
                    Total Outstanding{range !== "any" ? " (filtered)" : ""}
                  </span>
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40">
                    <ReceiptText className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-2 text-2xl font-bold font-sans text-rose-600">
                  {formatCurrency(range === "any" ? data.totalPendingAmount : filteredTotal)}
                </p>
                <p className="text-[11px] text-ink-soft">Across active subscriptions</p>
              </div>

              <div className="rounded-xl border border-hairline bg-card p-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink-soft">Subscribers to Follow Up</span>
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-paper border border-hairline text-brass-dark">
                    <Users className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-2 text-2xl font-bold font-sans text-ink">{filteredCustomers.length}</p>
                <p className="text-[11px] text-ink-soft">Sorted by highest overdue balance</p>
              </div>
            </section>

            <div className="mb-3.5 flex flex-wrap gap-1.5">
              {RANGES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRange(r.value)}
                  className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors ${
                    range === r.value
                      ? "border-brass bg-brass/15 text-brass-dark"
                      : "border-hairline bg-card text-ink-soft hover:bg-paper hover:text-ink"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {filteredCustomers.length === 0 ? (
              <div className="rounded-xl border border-hairline bg-card px-6 py-12 text-center shadow-2xs">
                <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-paid-soft text-paid font-bold text-sm">
                  ✓
                </div>
                <h2 className="mt-3 text-base font-bold text-ink">All caught up</h2>
                <p className="mt-1 text-xs text-ink-soft">
                  {range === "any"
                    ? "There are no active customers with an outstanding balance."
                    : "No customers fall in this overdue range."}
                </p>
              </div>
            ) : (
              <section className="overflow-hidden rounded-xl border border-hairline bg-card shadow-2xs">
                <div className="hidden grid-cols-[1.5fr_1fr_auto_auto_auto] gap-4 border-b border-hairline bg-paper px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-ink-soft md:grid">
                  <span>Customer</span>
                  <span>Area</span>
                  <span>Overdue</span>
                  <span>Balance</span>
                  <span />
                </div>
                <div className="divide-y divide-hairline/60">
                  {filteredCustomers.map((customer) => (
                    <div
                      key={customer._id}
                      className="group grid gap-2 p-3 sm:px-4 transition-colors hover:bg-paper/80 md:grid-cols-[1.5fr_1fr_auto_auto_auto] md:items-center md:gap-4"
                    >
                      <Link to={`/customers/${customer._id}`} state={{ openPayment: true }}>
                        <p className="text-xs sm:text-sm font-semibold text-ink group-hover:text-brass-dark">
                          {customer.name}
                        </p>
                        <p className="text-[11px] text-ink-soft">{customer.phone}</p>
                      </Link>
                      <p className="text-xs text-ink-soft">{customer.area || "—"}</p>
                      <span className="text-xs font-medium text-ink-soft">
                        {customer.daysOverdue > 0 ? `${customer.daysOverdue}d overdue` : "—"}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-sans text-xs sm:text-sm font-bold text-rose-600">
                          {formatCurrency(customer.arrears)}
                        </span>
                        <StatusBadge status={customer.status} size="xs" />
                      </div>
                      <div className="ml-auto flex items-center gap-2">
                        {customer.phone && (
                          <a
                            href={buildWhatsAppLink(customer.phone, buildReminderMessage(customer, customer))}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            aria-label="Send WhatsApp reminder"
                            className="grid h-7 w-7 place-items-center rounded-md text-emerald-600 hover:bg-paper"
                            title="WhatsApp reminder"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </a>
                        )}
                        <Link
                          to={`/customers/${customer._id}`}
                          state={{ openPayment: true }}
                          className="inline-flex items-center gap-1 rounded-md bg-brass/10 px-2 py-1 text-xs font-semibold text-brass-dark hover:bg-brass/20"
                        >
                          Collect <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
