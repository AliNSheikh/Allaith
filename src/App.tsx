import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { HeroSlider } from './components/HeroSlider';
import { PromotionalOffers } from './components/PromotionalOffers';
import { FeaturedCollections } from './components/FeaturedCollections';
import { PhysicalStoreSection } from './components/PhysicalStoreSection';
import { CatalogPage } from './components/CatalogPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { AdminPanel } from './components/AdminPanel';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { MaintenanceModal } from './components/MaintenanceModal';
import { RequestPhoneModal } from './components/RequestPhoneModal';
import { SiteDetailsModal } from './components/SiteDetailsModal';
import { ExchangeRateModal } from './components/ExchangeRateModal';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { CheckCircle } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentView, toastMessage, isSiteDetailsOpen, setIsSiteDetailsOpen } = useStore();

  // If viewing the private admin control panel, isolate it completely from the public storefront
  if (currentView === 'admin') {
    return (
      <div className="min-h-screen bg-stone-100 text-stone-900 selection:bg-stone-900 selection:text-white font-sans antialiased">
        <AdminPanel />
        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-stone-900/95 text-white text-xs font-semibold shadow-2xl backdrop-blur-xs border border-stone-700">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col selection:bg-stone-900 selection:text-white font-sans antialiased">
      {/* Sticky Header with Search, Currency Switcher & Cart */}
      <Header />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <>
            <HeroSlider />
            <PromotionalOffers />
            <FeaturedCollections />
            <PhysicalStoreSection />
          </>
        )}

        {currentView === 'catalog' && <CatalogPage />}
        {currentView === 'pdp' && <ProductDetailPage />}
        {currentView === 'offers' && (
          <div className="py-6">
            <PromotionalOffers />
          </div>
        )}
      </main>

      {/* Storefront Footer */}
      <Footer />

      {/* Slide-over Cart Drawer with 1:1 Images and Dual Currency */}
      <CartDrawer />

      {/* WhatsApp Checkout Modal with Syrian Governorates & Phone Validation */}
      <CheckoutModal />

      {/* Maintenance Request Modal & Floating Action Button */}
      <MaintenanceModal />

      {/* Custom Phone / Device Sourcing Request Modal */}
      <RequestPhoneModal />

      {/* Site Details Modal with Map, Phone Numbers, and Physical Address Text */}
      <SiteDetailsModal isOpen={isSiteDetailsOpen} onClose={() => setIsSiteDetailsOpen(false)} />

      {/* Real-Time Dollar Exchange Rate Modal & Calculator (sp-today.com) */}
      <ExchangeRateModal />

      {/* Bottom Navigation for Mobile Devices */}
      <MobileBottomNav />

      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-stone-900/95 text-white text-xs font-semibold shadow-2xl backdrop-blur-xs border border-stone-700">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainLayout />
    </StoreProvider>
  );
}
