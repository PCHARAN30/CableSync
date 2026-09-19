import { Navigate, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import customerApi from '../services/customerApi';
import CustomerHeader from '../components/customer/CustomerHeader';
import CustomerBottomNav from '../components/customer/CustomerBottomNav';

export default function CustomerLayout() {
  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cablesync_customer_profile') || 'null');
    } catch {
      return null;
    }
  });
  const { data } = useQuery({
    queryKey: ['customer-dashboard'],
    queryFn: async () => {
      const res = await customerApi.get('/customer-api/dashboard');
      return res.data?.data;
    },
    // The customer portal is intentionally open. The API selects the active
    // customer from the optional public customer profile/header.
    retry: false,
    enabled: Boolean(profile?.id),
  });

  if (!profile?.id) return <Navigate to="/customer" replace />;

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col selection:bg-brass selection:text-white">
      <CustomerHeader customer={data?.customer} openTicketsCount={data?.openTicketsCount || 0} />

      <main className="mx-auto flex w-full max-w-xl flex-1 px-4 py-4 sm:px-6 lg:max-w-6xl lg:px-8 lg:py-8">
        <Outlet />
      </main>

      <CustomerBottomNav openTicketsCount={data?.openTicketsCount || 0} />
    </div>
  );
}
