import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Smartphone,
  Bell,
  Menu,
  ArrowUpRight,
  Upload,
  Download,
  Settings,
  Ticket,
} from 'lucide-react';
import { useState } from 'react';
import DesktopNav from './DesktopNav';
import SyncStatusBanner from './SyncStatusBanner';
import MobileNav from './MobileNav';

export default function TopBar({ title, subtitle, backTo, rightAction, hideBrand = false }) {
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-card/95 backdrop-blur-md">
      <SyncStatusBanner />
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:gap-3 sm:px-5 lg:px-6">
        {/* Left Side: Back action or Brand Header */}
        <div className="flex min-w-0 items-center gap-3">
          {backTo ? (
            <button
              onClick={() => navigate(backTo)}
              aria-label="Go back"
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-ink transition-colors hover:bg-paper"
            >
              <ArrowLeft className="h-4 w-4 stroke-[2.25px]" />
              <span className="truncate">{title || 'Back'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setMoreOpen((open) => !open)}
                className="grid h-9 w-9 place-items-center rounded-lg text-ink-soft transition-colors hover:bg-paper hover:text-ink md:hidden"
                aria-label="Open more options"
              >
                <Menu className="h-4.5 w-4.5" />
              </button>

              {!hideBrand && (
                <Link
                  to="/"
                  className="flex shrink-0 items-center gap-2 font-sans text-base font-bold tracking-tight text-ink sm:text-lg"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-md bg-brass text-xs font-bold text-white shadow-2xs">
                    C
                  </span>
                  <span>CableSync</span>
                </Link>
              )}

              {title && !backTo && (
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-ink-soft/40">/</span>
                  <span className="text-sm font-semibold text-ink-soft">{title}</span>
                </div>
              )}
            </div>
          )}

          {/* Desktop Navigation Row */}
          <div className="ml-4 hidden md:block">
            <DesktopNav />
          </div>
        </div>

        {/* Right Side: Quick Portal Switcher & Notification Bell */}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {/* Customer Portal Switcher */}
          <a
            href="/customer"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-brass/30 bg-brass/10 px-2.5 text-xs font-semibold text-brass-dark transition-colors hover:bg-brass/20"
            title="Open Subscriber Self-Service Portal"
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Subscriber Portal</span>
            <span className="sm:hidden">Subscriber</span>
            <ArrowUpRight className="h-3 w-3 opacity-60" />
          </a>

          {/* Quick Notification Bell */}
          <Link
            to="/tickets"
            aria-label="Notifications and support tickets"
            className="relative grid h-9 w-9 place-items-center rounded-lg text-ink-soft transition-colors hover:bg-paper hover:text-ink"
            title="Support Tickets & Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-card" />
          </Link>

          {rightAction ? <div>{rightAction}</div> : null}
        </div>
      </div>
      {moreOpen && (
        <div className="absolute left-3 top-14 z-50 max-h-[calc(100dvh-5rem)] w-[min(20rem,calc(100vw-1.5rem))] overflow-y-auto overscroll-contain rounded-2xl border border-hairline bg-card p-2 shadow-ledger md:left-auto md:right-4">
          <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-ink-soft">More</p>
          <div className="grid gap-1">
            <Link to="/tickets" onClick={() => setMoreOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-paper"><Ticket className="h-4 w-4 text-ink-soft" /> Tickets</Link>
            <Link to="/import" onClick={() => setMoreOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink hover:bg-paper"><Upload className="h-4 w-4" /> Import Customers</Link>
            <Link to="/export" onClick={() => setMoreOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink hover:bg-paper"><Download className="h-4 w-4" /> Export Data</Link>
            <Link to="/payment-proofs" onClick={() => setMoreOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink hover:bg-paper">Payment Proofs</Link>
            <Link to="/settings" onClick={() => setMoreOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink hover:bg-paper"><Settings className="h-4 w-4" /> Settings</Link>
            <a href="/customer" target="_blank" rel="noopener noreferrer" onClick={() => setMoreOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink hover:bg-paper"><Smartphone className="h-4 w-4" /> Subscriber Portal <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-ink-soft" /></a>
          </div>
        </div>
      )}
      <MobileNav onMore={() => setMoreOpen(true)} />
    </header>
  );
}
