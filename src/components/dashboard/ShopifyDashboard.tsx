import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { DashboardSidebar, DashboardTab } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { AnalyticsView } from './AnalyticsView';
import { ProductsView } from './ProductsView';
import { OrdersView } from './OrdersView';
import { CategoriesBrandsView } from './CategoriesBrandsView';
import { HomepageContentView } from './HomepageContentView';
import { ReportsView } from './ReportsView';
import { GoogleSeoView } from './GoogleSeoView';
import { IntegrationsView } from './IntegrationsView';
import { MaintenanceRequestsView } from './MaintenanceRequestsView';
import { DashboardLogin } from './DashboardLogin';
import { ShieldAlert } from 'lucide-react';

export const ShopifyDashboard: React.FC = () => {
  const { locale, isAdminAuthenticated } = useStore();
  const isAr = locale === 'ar';

  const [activeTab, setActiveTab] = useState<DashboardTab>('analytics');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // If not authenticated, require password login
  if (!isAdminAuthenticated) {
    return <DashboardLogin />;
  }

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex font-sans antialiased overflow-hidden" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Al-Laith Admin Navigation Sidebar */}
      <DashboardSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpenMobile={isMobileSidebarOpen}
        setIsOpenMobile={setIsMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Sticky Header with Live Dollar Exchange Rate & Save Status */}
        <DashboardHeader
          activeTab={activeTab}
          setIsOpenMobile={setIsMobileSidebarOpen}
        />

        {/* Dynamic Tab Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'orders' && <OrdersView />}
          {activeTab === 'products' && <ProductsView />}
          {activeTab === 'categories' && <CategoriesBrandsView />}
          {activeTab === 'content' && <HomepageContentView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'google_seo' && <GoogleSeoView />}
          {activeTab === 'supabase' && <IntegrationsView />}
          {activeTab === 'settings' && <HomepageContentView />}
        </main>
      </div>
    </div>
  );
};
