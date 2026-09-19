import { Link } from "react-router-dom";
import TopBar from "../components/TopBar";
import {
  ChevronRight,
  FileText,
  Calendar,
  Map,
  Users,
  TrendingUp,
  UserX,
  Receipt,
  Download,
} from "lucide-react";

const availableReports = [
  {
    name: "Collection History",
    description: "Complete searchable payment ledger, receipts & filter by date/mode.",
    path: "/reports/collection-history",
    icon: Receipt,
    badge: "Live Ledger",
    highlight: true,
  },
  {
    name: "Pending Dues",
    description: "List of all customers with outstanding balances and follow-up tools.",
    path: "/reports/pending-dues",
    icon: FileText,
  },
  {
    name: "Today's Collection",
    description: "Live collections and receipts for today.",
    path: "/reports/daily",
    icon: Calendar,
  },
  {
    name: "Export Data",
    description: "Download customer and billing data in CSV format.",
    path: "/export",
    icon: Download,
  },
];
const advancedReports = [
  { name: "Monthly Collection", description: "Billing, collection rate and outstanding balance.", path: "/reports/monthly", icon: Calendar },
  { name: "Area Collection", description: "Compare billing and collections by service area.", path: "/reports/area", icon: Map },
  { name: "Top Defaulters", description: "Prioritize customers with the largest pending balances.", path: "/reports/defaulters", icon: UserX },
  { name: "Collection Trend", description: "See payment activity over the last six months.", path: "/reports/trend", icon: TrendingUp },
];

export default function Reports() {
  return (
    <div className="app-page">
      <TopBar title="Reports" />
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brass-dark">Reporting Workspace</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink mt-0.5">Financial & Collections Reports</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Audit logs, live collection ledgers, pending dues, and analytical subscriber reports.
          </p>
        </div>

        <div>
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-ink-soft">Core Collection Tools</p>
          <div className="space-y-2.5">
            {availableReports.map((report) => (
              <Link
                key={report.name}
                to={report.path}
                className={`block rounded-2xl border p-4.5 sm:p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brass/50 hover:shadow-md ${
                  report.highlight
                    ? "border-brass/40 bg-card hover:bg-card"
                    : "border-hairline bg-card hover:bg-card"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className={`grid h-10 w-10 place-items-center rounded-xl ${
                      report.highlight ? "bg-brass/15 text-brass" : "bg-paper text-brass border border-hairline"
                    }`}>
                      <report.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-ink text-sm sm:text-base">{report.name}</h3>
                        {report.badge && (
                          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                            {report.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-ink-soft mt-0.5">{report.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-ink-soft shrink-0 ml-2" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-ink-soft">Advanced Analytics</p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {advancedReports.map((report) => (
              <Link
                key={report.name}
                to={report.path}
                className="group flex items-center gap-3.5 rounded-xl border border-hairline bg-card p-4 text-ink-soft shadow-sm transition hover:-translate-y-0.5 hover:border-brass/40 hover:text-ink"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-paper text-brass border border-hairline">
                  <report.icon className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{report.name}</p>
                  <p className="mt-0.5 text-xs text-ink-soft truncate">{report.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 group-hover:text-brass-dark shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
