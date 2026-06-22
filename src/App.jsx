import { Toaster } from "@/components/ui/toaster"
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from "@/pages/Dashboard";
import ScrollToTop from './components/ScrollToTop';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import CreateBox from '@/pages/CreateBox';
import Layouts from '@/pages/Layouts';
import CRMCalendar from '@/pages/CRMCalendar';
import CorporatePortal from '@/pages/CorporatePortal';
import ReturnsPortal from '@/pages/ReturnsPortal';
import OrderTracking from '@/pages/OrderTracking';
import AIAssistant from '@/pages/AIAssistant';
import Auth from '@/pages/Auth';
import InventoryDashboard from '@/pages/InventoryDashboard';
import DesignApprovals from '@/pages/DesignApprovals';
import ProductionOperations from '@/pages/ProductionOperations';
import CRMDetail from '@/pages/CRMDetail';
import NotificationsDashboard from '@/pages/NotificationsDashboard';
import PackagingManagement from '@/pages/PackagingManagement';
import ReportsExports from '@/pages/ReportsExports';
import Contact from '@/pages/Contact';
import Privacy from '@/pages/Privacy';
import { AuthModalProvider } from '@/components/AuthModalContext';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthModalProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateBox />} />
            <Route path="/layouts" element={<Layouts />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/crm" element={<CRMCalendar />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/corporate" element={<CorporatePortal />} />
            <Route path="/returns" element={<ReturnsPortal />} />
            <Route path="/orders" element={<OrderTracking />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/inventory" element={<InventoryDashboard />} />
            <Route path="/design-approvals" element={<DesignApprovals />} />
            <Route path="/production" element={<ProductionOperations />} />
            <Route path="/crm/customer/:id" element={<CRMDetail />} />
            <Route path="/notifications" element={<NotificationsDashboard />} />
            <Route path="/packaging" element={<PackagingManagement />} />
            <Route path="/reports" element={<ReportsExports />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthModalProvider>
      <Toaster />
    </Router>
  );
}

export default App;