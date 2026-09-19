import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { debounce } from "lodash";
import api from "../services/api";
import TopBar from "../components/TopBar";
import CustomerCard from "../components/CustomerCard";
import { Search, Upload, UserPlus, UsersRound } from "lucide-react";

const getAreas = (customers) => {
  const areas = new Set(customers.map((c) => c.area).filter(Boolean));
  return ["All Areas", ...Array.from(areas).sort()];
};

export default function CustomerList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [status, setStatus] = useState(searchParams.get("filter") || "all");
  const [area, setArea] = useState(searchParams.get("area") || "All Areas");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  const debouncedSetQuery = useMemo(() => debounce(setQuery, 300), []);

  const {
    data,
    isLoading,
    isError,
    error,
    isPlaceholderData,
  } = useQuery({
    queryKey: ["customers", query, status, area, page],
    queryFn: async () => {
      const params = {};
      if (query) params.q = query;
      if (status && status !== "all") params.status = status;
      if (area && area !== "All Areas") params.area = area;
      params.page = page;

      const response = await api.get("/customers", { params });
      return response.data;
    },
    placeholderData: keepPreviousData,
  });

  const responseData = data?.data || {};
  const customers = responseData.customers || [];
  const availableAreas = useMemo(() => getAreas(customers), [customers]);

  useEffect(() => {
    const newParams = {};
    if (query) newParams.q = query;
    if (status && status !== "all") newParams.filter = status;
    if (area && area !== "All Areas") newParams.area = area;
    if (page > 1) newParams.page = page;
    setSearchParams(newParams, { replace: true });
  }, [query, status, area, page, setSearchParams]);

  const handleClearFilters = () => {
    setQuery("");
    setStatus("all");
    setArea("All Areas");
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-paper pb-6 text-ink md:pb-10">
      <TopBar title="Customers" />
      <main className="mx-auto w-full max-w-7xl px-3 py-3 sm:px-5 lg:px-6 lg:py-4">
        {/* Compact ERP Header */}
        <div className="mb-3">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-ink sm:text-2xl">Customers</h1>
                <span className="tabular inline-flex items-center justify-center rounded-full bg-brass/15 px-2 py-0.5 text-[11px] font-bold text-brass sm:px-2.5 sm:text-xs">
                  {responseData.total || customers.length}
                </span>
              </div>
              <p className="mt-0.5 hidden text-xs text-ink-soft sm:block sm:text-sm">
                Manage customer subscriptions & collections
              </p>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                to="/import"
                aria-label="Import customers"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-hairline bg-paper px-2.5 text-xs font-semibold text-ink shadow-2xs transition-colors hover:bg-card sm:px-3 sm:text-sm"
              >
                <Upload className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Import</span>
              </Link>
              <Link
                to="/customers/new"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brass px-2.5 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-brass-dark dark:text-slate-950 sm:px-3 sm:text-sm"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Add Customer</span>
                <span className="sm:hidden">Add</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Compact Search & Filter Controls */}
        <div className="mb-3 rounded-xl border border-hairline bg-card p-2.5 shadow-2xs sm:p-3">
          <div className="relative mb-2.5 lg:mb-0 lg:flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
            <input
              type="text"
              aria-label="Search customers"
              defaultValue={query}
              onChange={(e) => debouncedSetQuery(e.target.value)}
              placeholder="Search name, phone, CAF, or area…"
              className="h-10 w-full rounded-lg border border-hairline bg-paper pl-9 pr-3 text-sm text-ink placeholder:text-ink-soft/70 focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 lg:flex lg:items-end lg:gap-2.5">
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-ink-soft">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-9 w-full rounded-md border border-hairline bg-paper px-2.5 text-xs font-medium text-ink focus:border-brass focus:outline-none lg:w-44"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="PARTIAL">Partial</option>
                <option value="DUE">Due</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold text-ink-soft">Area</label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="h-9 w-full rounded-md border border-hairline bg-paper px-2.5 text-xs font-medium text-ink focus:border-brass focus:outline-none lg:w-52"
              >
                {availableAreas.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="py-8 text-center text-sm text-ink-soft">
            <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-brass border-t-transparent" />
            Loading subscribers…
          </div>
        )}
        {isError && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            {error.message}
          </div>
        )}
        {!isLoading && !isError && customers.length === 0 && (
          <div className="rounded-xl border border-hairline bg-card p-6 text-center text-sm text-ink-soft">
            No customers match the current filter or search criteria.
          </div>
        )}

        <div className="grid gap-2 sm:grid-cols-2 sm:gap-2.5">
          {customers.map((c) => (
            <CustomerCard key={c._id} customer={c} highlight={query} />
          ))}
        </div>

        {responseData.totalPages > 1 && (
          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => setPage((old) => Math.max(old - 1, 1))}
              disabled={page === 1}
              className="rounded-lg border border-hairline bg-paper px-3 py-1.5 text-xs font-semibold text-ink shadow-2xs disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-xs text-ink-soft">Page {responseData.currentPage} of {responseData.totalPages}</span>
            <button
              onClick={() => setPage((old) => (responseData && !isPlaceholderData && responseData.totalPages > old ? old + 1 : old))}
              disabled={isPlaceholderData || page === responseData.totalPages}
              className="rounded-lg border border-hairline bg-paper px-3 py-1.5 text-xs font-semibold text-ink shadow-2xs disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
