import { Link, useLocation } from 'react-router-dom';
import { Home, ReceiptText, Headphones, User } from 'lucide-react';

export default function CustomerBottomNav({ openTicketsCount = 0 }) {
  const location = useLocation();
  const path = location.pathname;

  const isHome = path === '/customer/home' || path === '/customer/home/';
  const isPayments = path.startsWith('/customer/home/payments');
  const isSupport = path.startsWith('/customer/home/support');
  const isProfile = path.startsWith('/customer/home/profile');

  const navItemClass = (active) =>
    `flex flex-1 flex-col items-center justify-center py-1 px-1 text-[11px] font-medium transition-all ${
      active
        ? 'text-brass font-bold'
        : 'text-ink-soft hover:text-ink'
    }`;

  return (
    <nav
      id="customer-bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-hairline bg-card/95 backdrop-blur-xl shadow-lg select-none lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Customer Navigation"
    >
      <div className="mx-auto flex max-w-md items-center justify-around h-14">
        <Link to="/customer/home" className={navItemClass(isHome)}>
          <div className={`flex items-center justify-center h-6 w-10 rounded-full transition-colors ${isHome ? 'bg-brass/15 text-brass' : ''}`}>
            <Home className={`h-4.5 w-4.5 ${isHome ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />
          </div>
          <span className="mt-0.5 tracking-tight truncate">Home</span>
        </Link>

        <Link to="/customer/home/payments" className={navItemClass(isPayments)}>
          <div className={`flex items-center justify-center h-6 w-10 rounded-full transition-colors ${isPayments ? 'bg-brass/15 text-brass' : ''}`}>
            <ReceiptText className={`h-4.5 w-4.5 ${isPayments ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />
          </div>
          <span className="mt-0.5 tracking-tight truncate">Payments</span>
        </Link>

        <Link to="/customer/home/support" className={`relative ${navItemClass(isSupport)}`}>
          <div className={`flex items-center justify-center h-6 w-10 rounded-full transition-colors ${isSupport ? 'bg-brass/15 text-brass' : ''}`}>
            <Headphones className={`h-4.5 w-4.5 ${isSupport ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />
          </div>
          <span className="mt-0.5 tracking-tight truncate">Support</span>
          {openTicketsCount > 0 && (
            <span className="absolute top-1.5 right-4 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-card" />
          )}
        </Link>

        <Link to="/customer/home/profile" className={navItemClass(isProfile)}>
          <div className={`flex items-center justify-center h-6 w-10 rounded-full transition-colors ${isProfile ? 'bg-brass/15 text-brass' : ''}`}>
            <User className={`h-4.5 w-4.5 ${isProfile ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />
          </div>
          <span className="mt-0.5 tracking-tight truncate">Profile</span>
        </Link>
      </div>
    </nav>
  );
}
