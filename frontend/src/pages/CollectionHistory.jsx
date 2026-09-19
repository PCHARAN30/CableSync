import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import Modal from "../components/Modal";
import api from "../services/api";
import { formatCurrency, formatDate, formatDateTime } from "../utils/format";
import { buildWhatsAppLink, buildReceiptMessage } from "../utils/whatsapp";
import {
  Receipt,
  Search,
  Calendar,
  Filter,
  Download,
  ArrowUpDown,
  Phone,
  MessageCircle,
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Printer,
  Share2,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Clock,
  FileSpreadsheet,
  AlertCircle,
} from "lucide-react";

const PRESETS = [
  { id: "all", label: "All Time" },
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "thisWeek", label: "This Week" },
  { id: "thisMonth", label: "This Month" },
  { id: "lastMonth", label: "Last Month" },
  { id: "custom", label: "Custom Range" },
];

const MODES = [
  { id: "all", label: "All Modes" },
  { id: "Cash", label: "Cash", icon: Banknote },
  { id: "UPI", label: "UPI", icon: Smartphone },
  { id: "Bank Transfer", label: "Bank Transfer", icon: Building2 },
  { id: "Card", label: "Card", icon: CreditCard },
];

export default function CollectionHistory() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [preset, setPreset] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mode, setMode] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'cards'
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Fetch collections query
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (search.trim()) params.set("search", search.trim());
    if (mode !== "all") params.set("mode", mode);
    if (preset !== "custom" && preset !== "all") {
      params.set("preset", preset);
    } else if (preset === "custom") {
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
    }
    return params.toString();
  }, [page, limit, search, mode, preset, startDate, endDate]);

  const { data, isLoading, isFetching, refetch, isError, error } = useQuery({
    queryKey: ["collectionHistory", queryParams],
    queryFn: () => api.get(`/payments?${queryParams}`).then((res) => res.data?.data || res.data),
    keepPreviousData: true,
  });

  const payments = data?.payments || [];
  const pagination = data?.pagination || { currentPage: 1, totalPages: 1, totalPayments: 0 };
  const summary = data?.summary || {
    totalAmount: 0,
    cashTotal: 0,
    upiTotal: 0,
    otherTotal: 0,
    filteredCount: 0,
    todayTotal: 0,
    todayCount: 0,
  };

  // Export CSV of current filtered dataset
  function handleExportCsv() {
    if (!payments.length) return;
    const headers = [
      "Receipt Number",
      "Date",
      "Customer Serial",
      "Customer Name",
      "Phone",
      "CAF Number",
      "Area",
      "Amount",
      "Payment Mode",
      "Allocated Arrears",
      "Allocated Advance",
      "Notes",
    ];

    const rows = payments.map((p) => {
      const c = p.customerId || {};
      return [
        p.receiptNumber || "",
        formatDateTime(p.paymentDate),
        c.serialNumber || "",
        `"${(c.name || "").replace(/"/g, '""')}"`,
        c.phone || "",
        c.cafNumber || "",
        `"${(c.area || "").replace(/"/g, '""')}"`,
        p.amount || 0,
        p.paymentMode || "",
        p.allocatedToArrears || 0,
        p.allocatedToAdvance || 0,
        `"${(p.notes || "").replace(/"/g, '""')}"`,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `collection_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function getModeIcon(paymentMode) {
    switch (paymentMode) {
      case "UPI":
        return <Smartphone className="h-3.5 w-3.5 text-indigo-400" />;
      case "Cash":
        return <Banknote className="h-3.5 w-3.5 text-emerald-400" />;
      case "Bank Transfer":
        return <Building2 className="h-3.5 w-3.5 text-blue-400" />;
      case "Card":
        return <CreditCard className="h-3.5 w-3.5 text-amber-400" />;
      default:
        return <Receipt className="h-3.5 w-3.5 text-brass" />;
    }
  }

  return (
    <div className="app-page min-h-screen bg-paper pb-20 md:pb-12 text-ink">
      <TopBar title="Collection History" />

      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-6 lg:py-6 space-y-5">
        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline/80 pb-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <Link
              to="/collections"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brass px-3 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-sm"
            >
              <Receipt className="h-4 w-4" />
              <span>Collection Ledger</span>
            </Link>
            <Link
              to="/collections/pending-dues"
              className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-card px-3 py-1.5 text-xs sm:text-sm font-medium text-ink-soft hover:bg-paper hover:text-ink transition-colors"
            >
              <AlertCircle className="h-4 w-4 text-rose-500" />
              <span>Pending Dues</span>
            </Link>
            <Link
              to="/payment-proofs"
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300/60 bg-amber-500/10 px-3 py-1.5 text-xs sm:text-sm font-semibold text-amber-800 hover:bg-amber-500/20 transition-colors"
            >
              <Clock className="h-4 w-4" />
              <span>Payment Proofs</span>
            </Link>
            <Link
              to="/collections/monthly"
              className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-card px-3 py-1.5 text-xs sm:text-sm font-medium text-ink-soft hover:bg-paper hover:text-ink transition-colors"
            >
              <Calendar className="h-4 w-4 text-brass" />
              <span>Monthly Overview</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              title="Refresh collections"
              className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-card px-2.5 py-1.5 text-xs font-semibold text-ink-soft hover:text-ink hover:bg-paper transition-all"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-brass" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleExportCsv}
              disabled={!payments.length}
              className="inline-flex items-center gap-1.5 rounded-lg border border-brass/40 bg-brass/10 px-3 py-1.5 text-xs font-semibold text-brass-dark hover:bg-brass/20 transition-all disabled:opacity-40"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Page Title & Breadcrumb header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brass-dark">
              <span>Financial Audit Trail</span>
              <span>•</span>
              <span className="text-ink-soft">Real-time Ledger</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink mt-0.5">
              Collection History
            </h1>
            <p className="text-xs sm:text-sm text-ink-soft mt-0.5">
              Comprehensive log of subscriber payments, mode breakdowns, and receipt tracking.
            </p>
          </div>
        </div>

        {/* Executive Summary Metric Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* Total Filtered Collection */}
          <div className="rounded-2xl border border-hairline bg-card p-4 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-ink-soft">Filtered Total</span>
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brass/10 text-brass">
                <Receipt className="h-4 w-4" />
              </span>
            </div>
            <p className="font-mono text-xl sm:text-2xl font-bold text-ink mt-2">
              {formatCurrency(summary.totalAmount)}
            </p>
            <p className="text-[11px] text-ink-soft mt-1">
              <span className="font-mono font-semibold text-ink">{summary.filteredCount || 0}</span> receipts recorded
            </p>
          </div>

          {/* Today's Live Collection */}
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                Live Today
              </span>
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <Clock className="h-4 w-4" />
              </span>
            </div>
            <p className="font-mono text-xl sm:text-2xl font-bold text-emerald-400 mt-2">
              {formatCurrency(summary.todayTotal)}
            </p>
            <p className="text-[11px] text-ink-soft mt-1">
              <span className="font-mono font-semibold text-ink">{summary.todayCount || 0}</span> collections today
            </p>
          </div>

          {/* Cash Collections */}
          <div className="rounded-2xl border border-hairline bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-ink-soft">Cash Share</span>
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <Banknote className="h-4 w-4" />
              </span>
            </div>
            <p className="font-mono text-xl sm:text-2xl font-bold text-ink mt-2">
              {formatCurrency(summary.cashTotal)}
            </p>
            <p className="text-[11px] text-ink-soft mt-1">
              {summary.totalAmount > 0
                ? `${Math.round((summary.cashTotal / summary.totalAmount) * 100)}% of filtered sum`
                : "0%"}
            </p>
          </div>

          {/* UPI & Digital Collections */}
          <div className="rounded-2xl border border-hairline bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-ink-soft">UPI / Online</span>
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-500/10 text-indigo-400">
                <Smartphone className="h-4 w-4" />
              </span>
            </div>
            <p className="font-mono text-xl sm:text-2xl font-bold text-ink mt-2">
              {formatCurrency(summary.upiTotal + summary.otherTotal)}
            </p>
            <p className="text-[11px] text-ink-soft mt-1">
              {summary.totalAmount > 0
                ? `${Math.round(((summary.upiTotal + summary.otherTotal) / summary.totalAmount) * 100)}% digital share`
                : "0%"}
            </p>
          </div>
        </div>

        {/* Filter & Control Toolbar */}
        <div className="rounded-2xl border border-hairline bg-card p-4 shadow-sm space-y-3.5">
          {/* Top Row: Search & Period presets */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-soft" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by customer name, phone, CAF #, receipt #, notes..."
                className="w-full rounded-xl border border-hairline bg-paper py-2 pl-9 pr-8 text-sm text-ink placeholder:text-ink-soft/70 focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass/30 transition-all"
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* View Mode Toggle (Mobile / Desktop Switch) */}
            <div className="flex items-center gap-2 self-end lg:self-auto">
              <div className="flex items-center rounded-lg border border-hairline bg-paper p-0.5 text-xs font-semibold">
                <button
                  onClick={() => setViewMode("table")}
                  className={`rounded-md px-2.5 py-1 transition-all ${
                    viewMode === "table" ? "bg-card text-ink shadow-xs" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  Table View
                </button>
                <button
                  onClick={() => setViewMode("cards")}
                  className={`rounded-md px-2.5 py-1 transition-all ${
                    viewMode === "cards" ? "bg-card text-ink shadow-xs" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  Card View
                </button>
              </div>
            </div>
          </div>

          {/* Preset Buttons & Mode Dropdown */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-hairline/60">
            {/* Timeframe Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-ink-soft mr-1">Period:</span>
              {PRESETS.map((p) => {
                const isActive = preset === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setPreset(p.id);
                      setPage(1);
                    }}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                      isActive
                        ? "bg-brass text-white shadow-xs font-semibold"
                        : "bg-paper text-ink-soft hover:text-ink border border-hairline/70"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* Payment Mode Selector */}
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-semibold text-ink-soft">Mode:</label>
              <select
                value={mode}
                onChange={(e) => {
                  setMode(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-hairline bg-paper px-2.5 py-1 text-xs font-medium text-ink focus:border-brass focus:outline-none"
              >
                {MODES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Date Range Row (Shown only when preset === 'custom') */}
          {preset === "custom" && (
            <div className="flex flex-wrap items-center gap-3 rounded-xl bg-paper p-3 border border-hairline animate-in fade-in duration-200">
              <span className="text-xs font-semibold text-ink-soft flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-brass" />
                Custom Range:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-lg border border-hairline bg-card px-2.5 py-1 text-xs text-ink focus:border-brass focus:outline-none"
                />
                <span className="text-xs text-ink-soft">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-lg border border-hairline bg-card px-2.5 py-1 text-xs text-ink focus:border-brass focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Content Section: Table or Cards */}
        {isLoading ? (
          <div className="rounded-2xl border border-hairline bg-card p-12 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-brass mb-3" />
            <p className="font-semibold text-ink">Loading collection records...</p>
            <p className="text-xs text-ink-soft mt-1">Retrieving ledger details from database.</p>
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-8 text-center">
            <AlertCircle className="h-8 w-8 mx-auto text-rose-500 mb-2" />
            <p className="font-semibold text-ink">Error loading collections</p>
            <p className="text-xs text-ink-soft mt-1">{error?.message || "Please check connection"}</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="rounded-2xl border border-hairline bg-card p-12 text-center">
            <Receipt className="h-10 w-10 mx-auto text-ink-soft/40 mb-3" />
            <h3 className="font-display text-lg font-semibold text-ink">No collections found</h3>
            <p className="text-sm text-ink-soft mt-1 max-w-md mx-auto">
              No payment transactions match the active filters or search query.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setPreset("all");
                setMode("all");
                setStartDate("");
                setEndDate("");
              }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brass px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brass-dark transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === "table" ? (
          /* Desktop / Dense Table View */
          <div className="overflow-hidden rounded-2xl border border-hairline bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-ink">
                <thead className="border-b border-hairline bg-paper text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
                  <tr>
                    <th className="px-4 py-3">Receipt #</th>
                    <th className="px-4 py-3">Date & Time</th>
                    <th className="px-4 py-3">Customer & Area</th>
                    <th className="px-4 py-3">CAF & Phone</th>
                    <th className="px-4 py-3">Mode</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {payments.map((p) => {
                    const cust = p.customerId || {};
                    return (
                      <tr
                        key={p._id}
                        className="group hover:bg-paper/80 transition-colors"
                      >
                        {/* Receipt # */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="font-mono font-bold text-brass bg-brass/10 px-2 py-0.5 rounded-md text-[11px]">
                            #{p.receiptNumber}
                          </span>
                        </td>

                        {/* Date & Time */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <p className="font-medium text-ink">{formatDate(p.paymentDate)}</p>
                          <p className="text-[11px] text-ink-soft">
                            {new Date(p.paymentDate).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </td>

                        {/* Customer & Area */}
                        <td className="px-4 py-3.5">
                          {cust._id ? (
                            <Link
                              to={`/customers/${cust._id}`}
                              className="font-semibold text-ink hover:text-brass transition-colors inline-block"
                            >
                              {cust.name}
                            </Link>
                          ) : (
                            <span className="font-semibold text-ink">{cust.name || "Unknown Customer"}</span>
                          )}
                          <p className="text-[11px] text-ink-soft truncate max-w-[180px]">
                            {cust.area || "Area not specified"}
                          </p>
                        </td>

                        {/* CAF & Phone */}
                        <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[11px]">
                          <p className="text-ink-soft">{cust.cafNumber || "—"}</p>
                          <p className="text-ink">{cust.phone || "—"}</p>
                        </td>

                        {/* Payment Mode */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 rounded-md border border-hairline bg-paper px-2 py-0.5 text-[11px] font-semibold text-ink">
                            {getModeIcon(p.paymentMode)}
                            {p.paymentMode || "Cash"}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-right font-mono font-bold text-sm text-emerald-400">
                          {formatCurrency(p.amount)}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setSelectedPayment(p)}
                              title="View and print official receipt"
                              className="inline-flex items-center gap-1 rounded-md border border-hairline bg-paper px-2 py-1 text-[11px] font-semibold text-ink-soft hover:text-ink hover:border-brass/50 transition-all"
                            >
                              <Receipt className="h-3 w-3 text-brass" />
                              <span>Receipt</span>
                            </button>
                            {cust.phone && (
                              <a
                                href={buildWhatsAppLink(
                                  cust.phone,
                                  buildReceiptMessage({
                                    customer: cust,
                                    payment: p,
                                    paidThroughDate: p.resultingPaidThrough || p.paymentDate,
                                  })
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Share receipt on WhatsApp"
                                className="grid h-7 w-7 place-items-center rounded-md text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Mobile / Card Grid View */
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {payments.map((p) => {
              const cust = p.customerId || {};
              const initials = (cust.name || "C")
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

              return (
                <div
                  key={p._id}
                  className="rounded-2xl border border-hairline bg-card p-4 shadow-sm hover:border-brass/30 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Receipt # & Amount */}
                    <div className="flex items-center justify-between gap-2 border-b border-hairline/60 pb-2.5">
                      <span className="font-mono font-bold text-brass bg-brass/10 px-2 py-0.5 rounded-md text-xs">
                        #{p.receiptNumber}
                      </span>
                      <span className="font-mono text-lg font-bold text-emerald-400">
                        {formatCurrency(p.amount)}
                      </span>
                    </div>

                    {/* Customer Info */}
                    <div className="flex items-start gap-3 mt-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-paper font-mono text-xs font-bold text-ink border border-hairline">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          to={cust._id ? `/customers/${cust._id}` : "#"}
                          className="font-semibold text-ink hover:text-brass transition-colors truncate block text-sm"
                        >
                          {cust.name || "Unknown Customer"}
                        </Link>
                        <p className="text-xs text-ink-soft">
                          {cust.area ? `${cust.area} • ` : ""}
                          <span className="font-mono">{cust.cafNumber || "No CAF"}</span>
                        </p>
                      </div>
                    </div>

                    {/* Metadata pill row */}
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs bg-paper rounded-xl p-2.5 border border-hairline/60">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-ink-soft block">Mode</span>
                        <span className="inline-flex items-center gap-1 font-medium text-ink mt-0.5">
                          {getModeIcon(p.paymentMode)}
                          {p.paymentMode || "Cash"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-ink-soft block">Date</span>
                        <span className="font-medium text-ink mt-0.5 block truncate">
                          {formatDate(p.paymentDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-hairline/60 pt-3">
                    <button
                      onClick={() => setSelectedPayment(p)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-paper px-3 py-1.5 text-xs font-semibold text-ink hover:border-brass transition-all"
                    >
                      <Receipt className="h-3.5 w-3.5 text-brass" />
                      <span>View Receipt</span>
                    </button>

                    {cust.phone && (
                      <a
                        href={buildWhatsAppLink(
                          cust.phone,
                          buildReceiptMessage({
                            customer: cust,
                            payment: p,
                            paidThroughDate: p.resultingPaidThrough || p.paymentDate,
                          })
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-hairline pt-4">
            <p className="text-xs text-ink-soft">
              Showing page <span className="font-semibold text-ink">{pagination.currentPage}</span> of{" "}
              <span className="font-semibold text-ink">{pagination.totalPages}</span> ({pagination.totalPayments} total)
            </p>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-hairline bg-card px-3 py-1.5 text-xs font-semibold text-ink hover:bg-paper disabled:opacity-40 transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Prev</span>
              </button>
              <span className="px-2 font-mono text-xs font-semibold text-ink">
                {page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-hairline bg-card px-3 py-1.5 text-xs font-semibold text-ink hover:bg-paper disabled:opacity-40 transition-all"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Printable Receipt Modal */}
      {selectedPayment && (
        <ReceiptModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </div>
  );
}

function ReceiptModal({ payment, onClose }) {
  const cust = payment.customerId || {};

  function handlePrint() {
    window.print();
  }

  const receiptMsg = buildReceiptMessage({
    customer: cust,
    payment,
    paidThroughDate: payment.resultingPaidThrough || payment.paymentDate,
  });

  return (
    <Modal title="Payment Receipt" onClose={onClose}>
      <div className="space-y-4 text-ink">
        {/* Printable Receipt Paper Card */}
        <div id="printable-receipt" className="rounded-2xl border border-hairline bg-paper p-5 space-y-4 shadow-sm">
          {/* Receipt Header */}
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <div>
              <div className="flex items-center gap-1.5 font-bold tracking-tight text-ink text-base">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-brass text-xs text-white">C</span>
                <span>CableSync</span>
              </div>
              <p className="text-[11px] text-ink-soft">Official Collection Receipt</p>
            </div>
            <div className="text-right">
              <span className="font-mono text-xs font-bold text-brass bg-brass/10 px-2 py-0.5 rounded">
                #{payment.receiptNumber}
              </span>
              <p className="text-[11px] text-ink-soft mt-0.5">{formatDate(payment.paymentDate)}</p>
            </div>
          </div>

          {/* Customer info */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] uppercase font-semibold text-ink-soft block">Subscriber</span>
              <p className="font-bold text-ink text-sm">{cust.name || "Customer"}</p>
              <p className="text-ink-soft">{cust.phone || "—"}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-semibold text-ink-soft block">CAF / Area</span>
              <p className="font-mono font-semibold text-ink">{cust.cafNumber || "—"}</p>
              <p className="text-ink-soft">{cust.area || "—"}</p>
            </div>
          </div>

          {/* Amount Box */}
          <div className="rounded-xl border border-hairline bg-card p-3.5 flex items-center justify-between">
            <div>
              <span className="text-xs text-ink-soft uppercase tracking-wider block">Amount Paid</span>
              <span className="font-mono text-2xl font-bold text-emerald-400">
                {formatCurrency(payment.amount)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-semibold text-ink-soft block">Payment Mode</span>
              <span className="font-semibold text-ink">{payment.paymentMode || "Cash"}</span>
            </div>
          </div>

          {/* Ledger summary breakdown */}
          <div className="space-y-1.5 text-xs border-t border-hairline pt-3">
            {payment.previousDue > 0 && (
              <div className="flex justify-between text-ink-soft">
                <span>Previous Due:</span>
                <span className="font-mono">{formatCurrency(payment.previousDue)}</span>
              </div>
            )}
            <div className="flex justify-between text-ink-soft">
              <span>Allocated to Arrears:</span>
              <span className="font-mono">{formatCurrency(payment.allocatedToArrears || 0)}</span>
            </div>
            {payment.allocatedToAdvance > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Advance Credit:</span>
                <span className="font-mono">+{formatCurrency(payment.allocatedToAdvance)}</span>
              </div>
            )}
            {payment.resultingPaidThrough && (
              <div className="flex justify-between font-semibold text-ink border-t border-hairline/60 pt-1.5">
                <span>Paid Coverage Till:</span>
                <span>{formatDate(payment.resultingPaidThrough)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between gap-2 pt-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl border border-hairline bg-paper px-4 py-2 text-xs font-semibold text-ink hover:bg-card transition-all"
          >
            <Printer className="h-4 w-4" />
            <span>Print Receipt</span>
          </button>

          {cust.phone && (
            <a
              href={buildWhatsAppLink(cust.phone, receiptMsg)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-all"
            >
              <Share2 className="h-4 w-4" />
              <span>Send WhatsApp</span>
            </a>
          )}
        </div>
      </div>
    </Modal>
  );
}
