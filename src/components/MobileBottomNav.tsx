import React from 'react';
import { useStore } from '../context/StoreContext';
import { Home, Grid, Tag, ShoppingBag, DollarSign } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const {
    locale,
    t,
    currentView,
    setCurrentView,
    cartCount,
    setIsCartOpen,
    setIsExchangeModalOpen,
    exchangeRateData
  } = useStore();

  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-2 py-1.5 shadow-lg">
      <div className="grid grid-cols-5 gap-0.5">
        {/* Home */}
        <button
          id="mobile-bottom-home"
          type="button"
          onClick={() => setCurrentView('home')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors cursor-pointer ${
            currentView === 'home' ? 'text-stone-900 font-bold' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{t('home')}</span>
        </button>

        {/* Catalog */}
        <button
          id="mobile-bottom-catalog"
          type="button"
          onClick={() => setCurrentView('catalog')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors cursor-pointer ${
            currentView === 'catalog' ? 'text-stone-900 font-bold' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Grid className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{t('catalog')}</span>
        </button>

        {/* Offers / Promotions */}
        <button
          id="mobile-bottom-offers"
          type="button"
          onClick={() => setCurrentView('offers')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors cursor-pointer ${
            currentView === 'offers' ? 'text-rose-600 font-bold' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Tag className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{t('promotions')}</span>
        </button>

        {/* Live Dollar Rate */}
        <button
          id="mobile-bottom-exchange-rate"
          type="button"
          onClick={() => setIsExchangeModalOpen(true)}
          className="relative flex flex-col items-center justify-center py-1 rounded-xl text-emerald-700 hover:text-emerald-900 transition-colors cursor-pointer"
          title={locale === 'ar' ? 'سعر صرف الدولار لحظياً' : 'Live USD Rate'}
        >
          <div className="relative">
            <DollarSign className="w-5 h-5 mb-0.5" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <span className="text-[10px] font-bold">
            {exchangeRateData ? `${exchangeRateData.new_lira.sell}` : (locale === 'ar' ? 'الدولار' : 'USD')}
          </span>
        </button>

        {/* Cart Trigger */}
        <button
          id="mobile-bottom-cart"
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center justify-center py-1 rounded-xl text-stone-700 transition-colors cursor-pointer"
        >
          <ShoppingBag className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{t('cart')}</span>
          {cartCount > 0 && (
            <span className="absolute top-0.5 right-3 rtl:right-auto rtl:left-3 w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-black flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
};
