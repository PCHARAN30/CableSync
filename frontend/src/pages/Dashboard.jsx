import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  IndianRupee,
  Users,
  AlertTriangle,
  ArrowRight,
  Plus,
  Receipt,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import api from "../services/api";
import TopBar from "../components/TopBar";
import StatCard from "../components/StatCard";
import RecentPayments from "../components/RecentPayments";
import DashboardSkeleton from "../components/DashboardSkeleton";
import { formatCurrency } from "../utils/format";

export default function Dashboard() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboardSummary"],
    queryFn: async () => {
      const response = await api.get("/dashboard/summary");
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center p-4">
        <AlertTriangle className="mb-3 h-12 w-12 text-due" />
        <h2 className="mb-1 text-xl font-bold text-ink">Could Not Load Dashboard</h2>
        <p className="max-w-md text-xs text-ink-soft">{error.message}</p>
      </div>
    );
  }

  const {
    totalCustomers = 0,
    paidCount = 0,
    partialCount = 0,
    dueCount = 0,
    todaysCollection = 0,
    todaysDueCount,
    recentPayments = [],
  } = data;

  return (
    <div className="min-h-screen pb-20 md:pb-12 bg-paper text-ink">
      <TopBar title="Dashboard" />

      <main className="mx-auto max-w-6xl space-y-3.5 px-3 py-4 sm:px-6 sm:space-y-4">
        {/* Page Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">
              Dashboard
            </h1>
            <p className="text-xs text-ink-soft">
              Real-time billing, collections & subscriber metrics
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/customers/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brass px-3 py-1.5 text-xs font-semibold text-white dark:text-slate-950 hover:bg-brass-dark transition-colors shadow-2xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Customer</span>
            </Link>
          </div>
        </div>

        {/* Today's Collection Card (Compact ERP Highlight) */}
        <div className="rounded-xl border border-hairline bg-card p-4 sm:p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">
                Today's Collection
              </span>
              <div className="mt-0.5 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold font-sans text-ink">
                  {formatCurrency(todaysCollection)}
                </span>
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md dark:bg-emerald-950/40 dark:text-emerald-400">
                  Live Today
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-0">
              <Link
                to="/customers?filter=DUE"
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60 transition-colors"
              >
                <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                <span>Collect Due ({dueCount})</span>
              </Link>
              <Link
                to="/collections"
                className="inline-flex items-center gap-1.5 rounded-lg bg-paper border border-hairline px-3 py-1.5 text-xs font-semibold text-ink hover:bg-card transition-colors"
              >
                <Receipt className="h-3.5 w-3.5 text-brass-dark" />
                <span>Collection Ledger</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Metric KPI Cards */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
          <StatCard
            title="Total Customers"
            value={totalCustomers}
            icon={Users}
            color="text-ink"
            linkTo="/customers"
          />
          <StatCard
            title="Due Attention"
            value={dueCount}
            subtitle={todaysDueCount ? `${todaysDueCount} today` : "Pending"}
            icon={AlertTriangle}
            color="text-rose-600"
            linkTo="/customers?filter=DUE"
          />
          <StatCard
            title="Partial Paid"
            value={partialCount}
            icon={Clock}
            color="text-amber-600"
            linkTo="/customers?filter=PARTIAL"
          />
          <StatCard
            title="Fully Paid"
            value={paidCount}
            icon={CheckCircle2}
            color="text-emerald-600"
            linkTo="/customers?filter=paid"
          />
        </div>

        {/* Main Content Grid: Recent Collections + Attention Desk */}
        <div className="grid gap-3.5 lg:grid-cols-[1.6fr_1fr]">
          <RecentPayments payments={recentPayments} />

          {/* Quick Operations & Attention Focus */}
          <div className="rounded-xl border border-hairline bg-card p-3 sm:p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-ink">Action Required</h2>
                <p className="text-[11px] text-ink-soft">Subscribers requiring follow-up</p>
              </div>
              <span className="grid h-7 w-7 place-items-center rounded-md bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/40">
                <AlertCircle className="h-4 w-4" />
              </span>
            </div>

            <div className="rounded-lg bg-paper p-3 border border-hairline/60">
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-soft">Pending Collections</span>
                <span className="text-xs font-bold text-rose-600">{dueCount} accounts</span>
              </div>
              <p className="mt-1 text-xs text-ink-soft">
                Send payment reminders or dispatch route collectors for pending cycles.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <Link
                to="/customers?filter=DUE"
                className="flex items-center justify-between rounded-lg border border-hairline bg-paper px-3 py-2 text-xs font-semibold text-ink hover:bg-card transition-colors"
              >
                <span>Filter Due Customers</span>
                <ArrowRight className="h-3.5 w-3.5 text-ink-soft" />
              </Link>
              <Link
                to="/collections/pending-dues"
                className="flex items-center justify-between rounded-lg border border-hairline bg-paper px-3 py-2 text-xs font-semibold text-ink hover:bg-card transition-colors"
              >
                <span>Pending Dues Aging Report</span>
                <ArrowRight className="h-3.5 w-3.5 text-ink-soft" />
              </Link>
              <Link
                to="/tickets"
                className="flex items-center justify-between rounded-lg border border-hairline bg-paper px-3 py-2 text-xs font-semibold text-ink hover:bg-card transition-colors"
              >
                <span>Support Complaints Desk</span>
                <ArrowRight className="h-3.5 w-3.5 text-ink-soft" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
