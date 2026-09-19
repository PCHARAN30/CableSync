import { Link, useLocation } from 'react-router-dom';
import { MoreHorizontal, Receipt, UsersRound } from 'lucide-react';

export default function MobileNav({ onMore }) {
  const { pathname } = useLocation();

  const items = [
    {
      to: '/customers',
      label: 'Customers',
      icon: UsersRound,
      active: pathname.startsWith('/customers'),
    },
    {
      to: '/collections',
      label: 'Collections',
      icon: Receipt,
      active: pathname.startsWith('/collections') || pathname.startsWith('/reports/collection-history') || pathname.startsWith('/payments') || pathname.startsWith('/payment-proofs'),
    },
  ];

  return (
    <nav
      className="operator-mobile-nav fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-card/95 shadow-lg backdrop-blur-xl md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Operator navigation"
    >
      <div className="mx-auto flex h-14 max-w-md items-stretch">
        {items.map(({ to, label, icon: Icon, active }) => (
          <Link
            key={to}
            to={to}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors ${
              active ? 'text-brass-dark' : 'text-ink-soft hover:text-ink'
            }`}
          >
            <span className={`grid h-7 w-11 place-items-center rounded-full ${active ? 'bg-brass/15' : ''}`}>
              <Icon className="h-4 w-4" />
            </span>
            {label}
          </Link>
        ))}
        <button
          type="button"
          onClick={onMore}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-ink-soft transition-colors hover:text-ink"
          aria-label="Open more operator options"
        >
          <span className="grid h-7 w-11 place-items-center rounded-full">
            <MoreHorizontal className="h-4 w-4" />
          </span>
          More
        </button>
      </div>
    </nav>
  );
}
