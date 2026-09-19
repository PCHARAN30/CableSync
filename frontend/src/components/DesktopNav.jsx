import { Link, useLocation } from "react-router-dom";
import {
  UsersRound,
  Receipt,
  Settings,
} from "lucide-react";

// Primary operator navigation for desktop.
export default function DesktopNav() {
  const location = useLocation();
  const path = location.pathname;

  const links = [
    {
      to: "/customers",
      label: "Customers",
      icon: UsersRound,
      match: (p) => p.startsWith("/customers"),
    },
    {
      to: "/collections",
      label: "Collections",
      icon: Receipt,
      match: (p) => p.startsWith("/collections") || p.startsWith("/reports/collection-history") || p.startsWith("/payments") || p.startsWith("/payment-proofs"),
    },
    {
      to: "/settings",
      label: "Settings",
      icon: Settings,
      match: (p) => p.startsWith("/settings"),
    },
  ];

  return (
    <nav className="desktop-nav items-center gap-1" aria-label="Primary navigation">
      {links.map(({ to, label, icon: Icon, match }) => (
        <Link key={to} to={to} className={`desktop-nav-item ${match(path) ? "active" : ""}`}>
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
