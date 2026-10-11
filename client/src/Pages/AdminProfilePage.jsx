import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaPlus, FaEnvelope } from 'react-icons/fa';

import AdminSidebar from '../Components/Admin/AdminSidebar';
import AdminDashboard from '../Components/Admin/AdminDashboard';
import AdminProducts from '../Components/Admin/AdminProducts';
import AdminStocks from '../Components/Admin/AdminStocks';
import AdminOrders from '../Components/Admin/AdminOrders';
import AdminUsers from '../Components/Admin/AdminUsers';
import AdminTickets from '../Components/Admin/AdminTickets';
import AdminReports from '../Components/Admin/AdminReports';
import AdminSettings from '../Components/Admin/AdminSettings';

function AdminProfilePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'dashboard';
  const orderSubTab = searchParams.get('subtab') || 'all';

  const setActiveTab = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  const setOrderSubTab = (subTabName) => {
    setSearchParams({ tab: 'orders', subtab: subTabName });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (activeTab === 'settings') {
    return <AdminSettings onBack={() => setActiveTab('dashboard')} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <AdminDashboard />;
      case 'products': return <AdminProducts />;
      case 'stocks': return <AdminStocks />;
      case 'orders': return <AdminOrders subTab={orderSubTab} />;
      case 'abandoned': return <AdminOrders subTab="abandoned" />; // Sidebar'dan doğrudan gelirse
      case 'users': return <AdminUsers />;
      case 'tickets': return <AdminTickets />;
      case 'reports': return <AdminReports />;
      default: return <AdminDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-[#f1f3f5] font-sans overflow-hidden">
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        orderSubTab={orderSubTab} 
        setOrderSubTab={setOrderSubTab} 
        handleLogout={handleLogout} 
      />
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-8 scroll-smooth custom-scrollbar">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default AdminProfilePage;