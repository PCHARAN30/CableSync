import { Link } from "react-router-dom";
import { Receipt, ArrowRight } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { formatCurrency, formatDate } from "../utils/format";

function RecentPayments({ payments }) {
  return (
    <div className="rounded-xl border border-hairline bg-card p-3 sm:p-4 shadow-2xs">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-paper border border-hairline text-ink-soft">
            <Receipt className="h-4 w-4" />
          </span>
          <h2 className="text-sm sm:text-base font-bold text-ink">Recent Collections</h2>
        </div>
        <Link
          to="/collections"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brass-dark hover:underline"
        >
          <span>All Ledgers</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {payments && payments.length > 0 ? (
        <div className="divide-y divide-hairline/60">
          {payments.map((p) => {
            const customerId = p.customerId?._id || p.customerId;
            const customerName = p.customerId?.name || "Subscriber";
            const caf = p.customerId?.cafNumber;

            return (
              <Link
                key={p._id}
                to={`/customers/${customerId}`}
                className="group flex items-center justify-between py-2.5 px-1 hover:bg-paper/70 rounded-md transition-colors"
              >
                <div className="min-w-0 flex-1 pr-3">
                  <p className="truncate text-xs sm:text-sm font-semibold text-ink group-hover:text-brass-dark">
                    {customerName}
                  </p>
                  <p className="text-[11px] text-ink-soft">
                    {caf ? `CAF: ${caf} • ` : ""}
                    {formatDate(p.paymentDate, "dd MMM, hh:mm a")} • {p.paymentMode}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <p className="font-sans text-xs sm:text-sm font-bold text-ink">
                      {formatCurrency(p.amount)}
                    </p>
                  </div>
                  <StatusBadge status="PAID" size="xs" />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="py-6 text-center text-xs text-ink-soft">
          No payments recorded yet for this billing cycle.
        </div>
      )}
    </div>
  );
}

export default RecentPayments;
