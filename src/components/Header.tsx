import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Search,
  ShoppingBag,
  Heart,
  Menu,
  X,
  Globe,
  Wrench,
  ShieldCheck,
  Coins,
  Smartphone,
  MapPin,
  ChevronDown
} from 'lucide-react';
import { defaultStoreLogoSvg } from '../data/logoPresets';
import { LaithLogo } from './LaithLogo';
import { ExchangeRateBar } from './ExchangeRateBar';

export const Header: React.FC = () => {
  const {
    locale,
    setLocale,
    t,
    activeCurrency,
    setActiveCurrency,
    currentView,
    setCurrentView,
    cartCount,
    setIsCartOpen,
    setIsMaintenanceOpen,
    setIsPhoneRequestOpen,
    setIsSiteDetailsOpen,
    wishlist,
    products,
    categories,
    storeSettings,
    setSelectedProductId,
    activeCategoryFilter,
    setActiveCategoryFilter,
    formatPrice,
    exchangeRateData,
    setIsExchangeModalOpen
  } = useStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesMenuOpen, setIsCategoriesMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const categoriesDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoriesDropdownRef.current &&
        !categoriesDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoriesMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const searchResults = searchInput.trim()
    ? products.filter((p) => {
        const query = searchInput.toLowerCase();
        return (
          p.title_ar.toLowerCase().includes(query) ||
          p.title_en.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query)
        );
      })
    : [];

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentView('pdp');
    setIsSearchOpen(false);
    setSearchInput('');
    setIsMobileMenuOpen(false);
  };

  const handleSelectCategory = (categoryId: string) => {
    setActiveCategoryFilter(categoryId);
    setCurrentView('catalog');
    setIsMobileMenuOpen(false);
  };

  const siteName = locale === 'ar' ? storeSettings.site_name_ar : storeSettings.site_name_en;
  const announcement = locale === 'ar' ? storeSettings.announcement_ar : storeSettings.announcement_en;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-stone-200/80 transition-all">
      {/* Real-Time Dollar Exchange Rate Bar (sp-today.com) */}
      <ExchangeRateBar />

      {/* Top Announcement Bar */}
      {storeSettings.announcement_enabled && announcement && (
        <div className="bg-[#1c1917] text-[#f5f5f4] text-xs sm:text-sm py-2 px-4 transition-colors">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <p className="font-medium truncate">{announcement}</p>
            </div>
            <div className="hidden md:flex items-center gap-4 text-stone-400 text-xs flex-shrink-0">
              <span className="flex items-center gap-1 text-stone-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {t('satisfaction_guarantee')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-6">
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              id="mobile-menu-toggle-btn"
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -m-2 text-stone-700 hover:text-stone-900 rounded-md focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              id="header-brand-logo-btn"
              type="button"
              onClick={() => {
                setCurrentView('home');
                setSelectedProductId(null);
              }}
              className="flex items-center group focus:outline-none"
              title={t('home')}
            >
              {storeSettings.logo_url && !storeSettings.logo_url.includes('TELECOM') ? (
                <img
                  src={storeSettings.logo_url}
                  alt="Al-Laith Telecom"
                  className="h-9 sm:h-11 w-auto max-w-[170px] sm:max-w-[210px] object-contain transition-transform group-hover:scale-[1.02]"
                />
              ) : (
                <LaithLogo variant="horizontal" size="md" />
              )}
            </button>
          </div>

          {/* Desktop Navigation Links: Home, Catalog, Categories, Request New Device, and Site Details */}
          <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2">
            <button
              id="nav-link-home"
              type="button"
              onClick={() => {
                setCurrentView('home');
                setSelectedProductId(null);
              }}
              className={`px-3.5 py-2 rounded-full text-sm font-bold transition-all ${
                currentView === 'home'
                  ? 'bg-[#181e23] text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100'
              }`}
            >
              {t('home')}
            </button>

            <button
              id="nav-link-catalog"
              type="button"
              onClick={() => {
                setActiveCategoryFilter(null);
                setCurrentView('catalog');
              }}
              className={`px-3.5 py-2 rounded-full text-sm font-bold transition-all ${
                currentView === 'catalog' && activeCategoryFilter === null
                  ? 'bg-[#181e23] text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100'
              }`}
            >
              {t('catalog')}
            </button>

            {/* Categories Dropdown */}
            <div className="relative" ref={categoriesDropdownRef}>
              <button
                id="nav-link-categories"
                type="button"
                onClick={() => setIsCategoriesMenuOpen(!isCategoriesMenuOpen)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-bold transition-all ${
                  isCategoriesMenuOpen || (currentView === 'catalog' && activeCategoryFilter !== null)
                    ? 'bg-stone-200/80 text-stone-900'
                    : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100'
                }`}
              >
                <span>{t('categories')}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isCategoriesMenuOpen ? 'rotate-180 text-stone-900' : 'text-stone-500'
                  }`}
                />
              </button>

              {isCategoriesMenuOpen && (
                <div className="absolute top-full mt-2 rtl:right-0 ltr:left-0 w-60 bg-white rounded-2xl shadow-xl border border-stone-200/90 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategoryFilter(null);
                      setCurrentView('catalog');
                      setIsCategoriesMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                      activeCategoryFilter === null
                        ? 'bg-[#181e23] text-white'
                        : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span>{t('all')}</span>
                    <span className="text-[10px] opacity-70 font-mono">({products.length})</span>
                  </button>
                  {categories.map((c) => {
                    const count = products.filter((p) => p.category_id === c.id).length;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setActiveCategoryFilter(c.id);
                          setCurrentView('catalog');
                          setIsCategoriesMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors mt-0.5 ${
                          activeCategoryFilter === c.id
                            ? 'bg-emerald-50 text-emerald-800 font-bold'
                            : 'text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <span>{locale === 'ar' ? c.name_ar : c.name_en}</span>
                        <span className="text-[10px] text-stone-400 font-mono">({count})</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Request New Device Button - Placed in header next to catalog and categories */}
            <button
              id="nav-link-request-device"
              type="button"
              onClick={() => setIsPhoneRequestOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition-all shadow-2xs hover:scale-[1.02] active:scale-98"
              title={locale === 'ar' ? 'طلب هاتف أو جهاز جديد بالاسم والمواصفات' : 'Request a New Device by Name & Specs'}
            >
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>{locale === 'ar' ? 'طلب جهاز جديد' : 'Request New Device'}</span>
            </button>

            {/* Site Details Button (Map, Phone, Address Text) */}
            <button
              id="nav-link-site-details"
              type="button"
              onClick={() => setIsSiteDetailsOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-bold text-[#3d5e4b] bg-[#f0f4f1] hover:bg-[#e4ece6] border border-[#cbd8cf] transition-all shadow-2xs hover:scale-[1.02]"
              title={locale === 'ar' ? 'عرض الخريطة ورقم الهاتف والعنوان كنص' : 'View Store Map, Phone & Physical Address'}
            >
              <MapPin className="w-4 h-4 text-[#547b66]" />
              <span>{t('site_details')}</span>
            </button>
          </nav>

          {/* Right Action Controls: Search, Currency Switcher, Language Switcher, Wishlist, Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Global Search Button */}
            <button
              id="header-search-toggle-btn"
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors relative"
              title={t('search_placeholder')}
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Currency Switcher (Primary: SYP, Supported: USD) */}
            <div className="flex items-center bg-stone-100 rounded-full p-0.5 border border-stone-200">
              <button
                type="button"
                onClick={() => setActiveCurrency('SYP')}
                className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all ${
                  activeCurrency === 'SYP'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="العملة الأساسية: ليرة سورية"
              >
                ل.س
              </button>
              <button
                type="button"
                onClick={() => setActiveCurrency('USD')}
                className={`px-2 py-1 text-xs font-bold rounded-full transition-all ${
                  activeCurrency === 'USD'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="الدولار الأمريكي"
              >
                $
              </button>
            </div>

            {/* Quick Live Dollar Rate Pill */}
            {exchangeRateData && (
              <button
                id="header-live-rate-badge-btn"
                type="button"
                onClick={() => setIsExchangeModalOpen(true)}
                className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition-all shadow-2xs group cursor-pointer"
                title={locale === 'ar' ? 'سعر صرف الدولار المباشر من sp-today.com - انقر للتفاصيل والمحول' : 'Live USD rate from sp-today.com - click for details & calc'}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-emerald-950 font-bold">
                  1$ = {exchangeRateData.new_lira.sell} جديدة ({exchangeRateData.old_lira.sell.toLocaleString()} قديمة)
                </span>
              </button>
            )}

            {/* Language Switcher */}
            <button
              id="header-language-toggle-btn"
              type="button"
              onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors shadow-xs"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-stone-500" />
              <span>{locale === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            {/* Wishlist Button */}
            <button
              id="header-wishlist-btn"
              type="button"
              onClick={() => {
                setActiveCategoryFilter(null);
                setCurrentView('catalog');
              }}
              className="relative p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors hidden sm:flex"
              title={t('wishlist')}
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 rtl:right-auto rtl:left-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Drawer Trigger */}
            <button
              id="header-cart-drawer-btn"
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 transition-all shadow-sm active:scale-95"
              aria-label="Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 rtl:-right-auto rtl:-left-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-stone-900">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline font-bold">{t('cart')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top duration-200">
          {/* Mobile Live Dollar Exchange Rate Card */}
          {exchangeRateData && (
            <div
              id="mobile-exchange-rate-card"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsExchangeModalOpen(true);
              }}
              className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 flex items-center justify-between cursor-pointer hover:bg-emerald-500/15 transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                  $
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-stone-900">
                      {t('live_dollar_rate')}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold">
                      sp-today.com
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-600 font-medium mt-0.5">
                    جديدة: <span className="font-bold text-emerald-700">{exchangeRateData.new_lira.sell}</span> • قديمة: <span className="font-bold text-stone-900">{exchangeRateData.old_lira.sell.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 px-2 py-1 bg-emerald-100 rounded-lg">
                {locale === 'ar' ? 'المحول' : 'Calc'}
              </span>
            </div>
          )}

          <button
            id="mobile-nav-home"
            type="button"
            onClick={() => {
              setCurrentView('home');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium ${
              currentView === 'home' ? 'bg-stone-100 text-stone-900 font-bold' : 'text-stone-700'
            }`}
          >
            <span>{t('home')}</span>
          </button>

          <button
            id="mobile-nav-catalog"
            type="button"
            onClick={() => {
              setActiveCategoryFilter(null);
              setCurrentView('catalog');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold ${
              currentView === 'catalog' && activeCategoryFilter === null ? 'bg-[#181e23] text-white' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <span>{t('catalog')}</span>
          </button>

          {/* Mobile Categories Accordion/Chips */}
          <div className="px-1 py-1">
            <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider px-3 mb-1.5">
              {t('categories')}
            </div>
            <div className="flex flex-wrap gap-1.5 px-3">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setActiveCategoryFilter(c.id);
                    setCurrentView('catalog');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeCategoryFilter === c.id
                      ? 'bg-stone-900 text-white font-bold'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {locale === 'ar' ? c.name_ar : c.name_en}
                </button>
              ))}
            </div>
          </div>

          {/* Request New Device Button (Mobile) */}
          <button
            id="mobile-nav-request-device"
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsPhoneRequestOpen(true);
            }}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold bg-emerald-50 text-emerald-800 border border-emerald-200"
          >
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>{locale === 'ar' ? 'طلب جهاز جديد بالاسم' : 'Request New Device'}</span>
            </div>
          </button>

          {/* Site Details Button */}
          <button
            id="mobile-nav-site-details"
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsSiteDetailsOpen(true);
            }}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold bg-[#f0f4f1] text-[#3d5e4b] border border-[#cbd8cf]"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#547b66]" />
              <span>{locale === 'ar' ? 'تفاصيل الموقع (الخريطة، العنوان، الهاتف)' : 'Site Details (Map, Address, Phone)'}</span>
            </div>
          </button>

          <div className="pt-2 border-t border-stone-100 flex items-center justify-between px-2">
            <button
              type="button"
              onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-semibold text-stone-700"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{locale === 'ar' ? 'English' : 'العربية'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Real-time Search Overlay Dialog */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[80vh]">
            {/* Search Input Bar */}
            <div className="p-4 border-b border-stone-100 flex items-center gap-3">
              <Search className="w-5 h-5 text-stone-400 flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t('search_placeholder')}
                className="w-full bg-transparent text-stone-900 placeholder-stone-400 text-base focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results or Quick Suggestions */}
            <div className="flex-1 overflow-y-auto p-4 divide-y divide-stone-100">
              {searchInput.trim() === '' ? (
                <div>
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                    {t('categories')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectCategory(c.id)}
                        className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 hover:bg-stone-200 text-xs font-medium"
                      >
                        {locale === 'ar' ? c.name_ar : c.name_en}
                      </button>
                    ))}
                  </div>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-8 text-center text-stone-500 text-sm">
                  {t('no_results')} "{searchInput}"
                </div>
              ) : (
                searchResults.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleSelectProduct(product.id)}
                    className="w-full flex items-center gap-4 py-3 hover:bg-stone-50 rounded-xl px-2 text-left rtl:text-right transition-colors"
                  >
                    <div className="w-12 h-12 rounded-lg bg-stone-100 border border-stone-200 overflow-hidden flex-shrink-0 aspect-square">
                      <img
                        src={product.images[0]}
                        alt={product.title_ar}
                        className="w-full h-full object-cover aspect-square"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-stone-900 truncate">
                        {locale === 'ar' ? product.title_ar : product.title_en}
                      </h4>
                      <p className="text-xs text-stone-500">{product.brand} • SKU: {product.sku}</p>
                    </div>
                    <div className="text-right rtl:text-left font-extrabold text-sm text-stone-900">
                      {formatPrice(product.price)}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
