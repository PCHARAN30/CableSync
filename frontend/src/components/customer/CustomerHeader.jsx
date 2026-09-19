import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Tv, LogOut, Headphones, Home, ReceiptText, User } from 'lucide-react';
import { showToast } from '../../pages/Toast';
import { useState } from 'react';

export default function CustomerHeader({ customer, openTicketsCount = 0, onSignOut }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navItems = [
    { to: '/customer/home', label: 'Home', icon: Home, exact: true },
    { to: '/customer/home/payments', label: 'Payments', icon: ReceiptText },
    { to: '/customer/home/support', label: 'Support', icon: Headphones },
    { to: '/customer/home/profile', label: 'Profile', icon: User },
  ];

  const isActive = (item) =>
    item.exact
      ? location.pathname === item.to || location.pathname === `${item.to}/`
      : location.pathname.startsWith(item.to);

  const handleSignOut = () => {
    localStorage.removeItem('cablesync_customer_profile');
    showToast('Customer selection cleared', 'info');
    onSignOut?.();
    navigate('/customer');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-hairline bg-card/95 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand & Portal Type */}
        <Link to="/customer/home" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-brass flex items-center justify-center text-white shadow-sm">
            <Tv className="h-4 w-4" />
          </div>
          <div>
            <span className="font-display text-base font-bold text-ink block leading-none">CableSync</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-brass-dark">Subscriber App</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Subscriber navigation">
          {navItems.map(({ to, label, icon: Icon, exact }) => (
            <Link
              key={to}
              to={to}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                isActive({ to, exact })
                  ? 'bg-brass/10 text-brass-dark'
                  : 'text-ink-soft hover:bg-paper hover:text-ink'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Right actions: support and customer selection */}
        <div className="flex shrink-0 items-center gap-1.5">
          <Link
            to="/customer/home/support"
            className="relative hidden rounded-lg px-3 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-paper hover:text-ink sm:inline-flex sm:items-center sm:gap-2 lg:hidden"
            title="Customer Support"
          >
            <Headphones className="h-4 w-4" />
            <span>Support</span>
            {openTicketsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </Link>

          <div className="relative">
            <button type="button" onClick={() => setUserMenuOpen((open) => !open)} className="inline-flex max-w-[11rem] items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-paper hover:text-ink lg:px-3" aria-haspopup="menu" aria-expanded={userMenuOpen}>
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brass/10 text-xs font-bold text-brass-dark">{customer?.name?.charAt(0)?.toUpperCase() || 'C'}</span>
              <span className="hidden truncate lg:inline">{customer?.name || 'Subscriber'}</span>
              <span className="text-xs" aria-hidden="true">⌄</span>
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-hairline bg-card p-2 shadow-ledger" role="menu">
                <div className="border-b border-hairline px-3 pb-2 pt-1">
                  <p className="truncate text-sm font-bold text-ink">{customer?.name || 'Subscriber'}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-ink-soft">{customer?.cafNumber || 'Subscriber account'}</p>
                </div>
                <Link to="/customer/home/profile" onClick={() => setUserMenuOpen(false)} className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-paper" role="menuitem"><User className="h-4 w-4 text-ink-soft" /> My Profile</Link>
                <button type="button" onClick={handleSignOut} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-500/10" role="menuitem"><LogOut className="h-4 w-4" /> Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
