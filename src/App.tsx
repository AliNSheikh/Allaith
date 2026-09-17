import React, { useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { HeroSlider } from './components/HeroSlider';
import { PromotionalOffers } from './components/PromotionalOffers';
import { FeaturedCollections } from './components/FeaturedCollections';
import { PhysicalStoreSection } from './components/PhysicalStoreSection';
import { CatalogPage } from './components/CatalogPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { AdminPanel } from './components/AdminPanel';
import { ShopifyDashboard } from './components/dashboard/ShopifyDashboard';
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
  const {
    currentView,
    toastMessage,
    isSiteDetailsOpen,
    setIsSiteDetailsOpen,
    selectedProduct,
    storeSettings,
    locale,
    trackVisit
  } = useStore();

  const isAr = locale === 'ar';

  // Live visitor tracking: track all customer store visits and page views moving forward
  useEffect(() => {
    if (currentView === 'admin') return;

    let path = '/';
    let title = isAr ? storeSettings.site_name_ar : storeSettings.site_name_en;

    if (currentView === 'pdp' && selectedProduct) {
      path = `/product/${selectedProduct.slug || selectedProduct.id}`;
      title = isAr ? selectedProduct.name_ar : selectedProduct.name_en;
    } else if (currentView === 'catalog') {
      path = '/catalog';
      title = isAr ? 'دليل الأجهزة والمنتجات | متجر الليث' : 'Products Catalog | Al-Laith';
    } else if (currentView === 'offers') {
      path = '/offers';
      title = isAr ? 'العروض والتخفيضات | متجر الليث' : 'Special Offers | Al-Laith';
    } else if (currentView === 'home') {
      path = '/';
      title = isAr ? storeSettings.site_name_ar : storeSettings.site_name_en;
    }

    trackVisit(path, title);
  }, [currentView, selectedProduct?.id, trackVisit, isAr, storeSettings.site_name_ar, storeSettings.site_name_en]);

  // Dynamic SEO meta tags and browser title
  useEffect(() => {
    let title = isAr ? storeSettings.site_name_ar : storeSettings.site_name_en;
    let desc = isAr
      ? 'متجر ومخبر الليث للاتصالات في سوريا: أحدث الهواتف الذكية مع كفالة رسمية، صيانة إلكترونية متطورة، وتوصيل لكافة المحافظات.'
      : 'Al-Laith Telecommunications in Syria: Smartphones, original accessories, certified repair lab, and delivery across Syria.';
    let img = storeSettings.custom_logo_url || storeSettings.logo_url || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&q=80&w=1200';

    if (currentView === 'pdp' && selectedProduct) {
      title = `${isAr ? selectedProduct.name_ar : selectedProduct.name_en} | ${isAr ? storeSettings.site_name_ar : storeSettings.site_name_en}`;
      desc = isAr ? selectedProduct.description_ar : selectedProduct.description_en;
      img = selectedProduct.image_url || img;
    } else if (currentView === 'catalog') {
      title = isAr ? `دليل المنتجات والأجهزة الذكية | ${storeSettings.site_name_ar}` : `Catalog & Smartphones | ${storeSettings.site_name_en}`;
    } else if (currentView === 'offers') {
      title = isAr ? `العروض والخصومات الخاصة | ${storeSettings.site_name_ar}` : `Special Offers & Discounts | ${storeSettings.site_name_en}`;
    } else if (currentView === 'admin') {
      title = isAr ? `لوحة التحكم الإدارية | ${storeSettings.site_name_ar}` : `Admin Control Panel | ${storeSettings.site_name_en}`;
    }

    document.title = title;

    const setMeta = (name: string, content: string, isProp = false) => {
      let meta = document.querySelector(isProp ? `meta[property="${name}"]` : `meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        if (isProp) meta.setAttribute('property', name);
        else meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    setMeta('description', desc);
    setMeta('og:title', title, true);
    setMeta('og:description', desc, true);
    setMeta('og:image', img, true);
    setMeta('twitter:title', title);
    setMeta('twitter:description', desc);
    setMeta('twitter:image', img);
  }, [currentView, selectedProduct, storeSettings, isAr]);

  // If viewing the private admin control panel, isolate it completely from the public storefront
  if (currentView === 'admin') {
    return (
      <div className="min-h-screen bg-stone-100 text-stone-900 selection:bg-stone-900 selection:text-white font-sans antialiased">
        <ShopifyDashboard />
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
