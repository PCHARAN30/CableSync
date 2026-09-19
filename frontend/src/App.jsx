import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CustomerList from './pages/CustomerList';
import CustomerDetails from './pages/CustomerDetails';
import TodaysCollection from './pages/TodaysCollection';
import AddCustomer from './pages/AddCustomer';
import EditCustomer from './pages/EditCustomer';
import ImportCustomers from "./pages/ImportCustomers";
import Export from "./pages/Export";
import PendingDues from "./pages/PendingDues";
import NotFound from "./pages/NotFound";
import CollectionReport from "./pages/CollectionReport";
import CollectionHistory from "./pages/CollectionHistory";
import ToastContainer from './components/ToastContainer';
import Settings from './pages/Settings';
import OperatorTickets from './pages/OperatorTickets';
import PaymentProofs from './pages/PaymentProofs';

// Customer Portal components & pages
import CustomerLayout from './layouts/CustomerLayout';
import CustomerHome from './pages/customer/CustomerHome';
import CustomerPlan from './pages/customer/CustomerPlan';
import CustomerPayments from './pages/customer/CustomerPayments';
import CustomerSupport from './pages/customer/CustomerSupport';
import CustomerProfile from './pages/customer/CustomerProfile';
import SubscriberEntry from './pages/customer/SubscriberEntry';

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Operator Portal Routes */}
          <Route path="/" element={<Navigate to="/customers" replace />} />
          <Route path="/dashboard" element={<Navigate to="/customers" replace />} />
          <Route path="/reports" element={<Navigate to="/customers" replace />} />
          <Route
            path="/customers"
            element={
              <CustomerList />
            }
          />
          <Route
            path="/customers/new"
            element={
              <AddCustomer />
            }
          />
          <Route
            path="/customers/:id"
            element={
              <CustomerDetails />
            }
          />
          <Route
            path="/customers/:id/edit"
            element={
              <EditCustomer />
            }
          />
          <Route
            path="/import"
            element={
              <ImportCustomers />
            }
          />
          <Route path="/collections" element={<CollectionHistory />} />
          <Route path="/collections/pending-dues" element={<PendingDues />} />
          <Route path="/collections/daily" element={<TodaysCollection />} />
          <Route path="/collections/monthly" element={<CollectionReport />} />
          <Route path="/collections/area" element={<CollectionReport />} />
          <Route path="/collections/defaulters" element={<CollectionReport />} />
          <Route path="/collections/trend" element={<CollectionReport />} />
          <Route path="/payments" element={<CollectionHistory />} />
          <Route
            path="/export"
            element={
              <Export />
            }
          />
          <Route
            path="/tickets"
            element={
              <OperatorTickets />
            }
          />
          <Route path="/payment-proofs" element={<PaymentProofs />} />
          <Route
            path="/settings"
            element={
              <Settings />
            }
          />

          {/* Customer Portal Routes */}
          <Route path="/customer" element={<SubscriberEntry />} />
          <Route path="/customer/home" element={<CustomerLayout />}>
            <Route index element={<CustomerHome />} />
            <Route path="plan" element={<CustomerPlan />} />
            <Route path="payments" element={<CustomerPayments />} />
            <Route path="support" element={<CustomerSupport />} />
            <Route path="profile" element={<CustomerProfile />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>

      </BrowserRouter>
      <ToastContainer />
    </>
  );
}
