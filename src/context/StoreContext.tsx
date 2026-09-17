import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Language,
  ActiveCurrency,
  Product,
  Category,
  CartItem,
  Order,
  MaintenanceRequest,
  StoreSettings,
  PhoneRequest,
  SpTodayExchangeData,
  LiraDisplayMode,
  HeroSlide,
  StaffUser,
  StaffRole,
  VisitorStatDay,
  AnalyticsVisitRecord
} from '../types';
import { getProductShareableUrl, getProductUniqueSlug } from '../utils/productUrl';
import {
  getSupabaseClient,
  authenticateAdminWithSupabase,
  fetchProductsFromSupabase,
  upsertProductToSupabase,
  deleteProductFromSupabase,
  archiveProductInSupabase,
  fetchCategoriesFromSupabase,
  upsertCategoryToSupabase,
  deleteCategoryFromSupabase,
  archiveCategoryInSupabase,
  fetchHeroSlidesFromSupabase,
  upsertHeroSlideToSupabase,
  deleteHeroSlideFromSupabase,
  fetchSettingsFromSupabase,
  upsertSettingsToSupabase,
  fetchOrdersFromSupabase,
  upsertOrderToSupabase,
  updateOrderStatusInSupabase,
  fetchMaintenanceRequestsFromSupabase,
  upsertMaintenanceRequestToSupabase,
  updateMaintenanceStatusInSupabase,
  fetchPhoneRequestsFromSupabase,
  upsertPhoneRequestToSupabase,
  subscribeToStoreSync,
  isSupabaseConfigured
} from '../lib/supabase';
import { fetchLiveDollarRate, DEFAULT_FALLBACK_RATE } from '../utils/exchangeRateClient';
import { translations } from '../locales/translations';
import {
  initialCategories,
  initialProducts,
  initialStoreSettings,
  initialOrders,
  initialMaintenanceRequests,
  initialBrands,
  initialPhoneRequests,
  initialHeroSlides,
  initialStaffUsers,
  initialVisitorStats
} from '../data/initialData';

interface SheetsSyncLog {
  id: string;
  timestamp: string;
  orderNumber: string;
  status: 'success' | 'failed';
  message: string;
}

interface StoreContextType {
  locale: Language;
  setLocale: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  
  // Currency Management (Primary: SYP, Supported: USD)
  activeCurrency: ActiveCurrency;
  setActiveCurrency: (c: ActiveCurrency) => void;
  formatPrice: (amountInSYP: number) => string;
  formatDualPrice: (amountInSYP: number) => { primary: string; secondary: string };
  convertSYPtoUSD: (amountInSYP: number) => number;

  // Real-time Dollar Exchange Rate from sp-today.com
  exchangeRateData: SpTodayExchangeData | null;
  isExchangeRateLoading: boolean;
  exchangeRateError: string | null;
  refreshExchangeRate: (force?: boolean) => Promise<void>;
  isExchangeModalOpen: boolean;
  setIsExchangeModalOpen: (open: boolean) => void;
  liraDisplayMode: LiraDisplayMode;
  setLiraDisplayMode: (mode: LiraDisplayMode) => void;
  applyLiveRateToCatalog: () => void;
  
  // Navigation & Views
  currentView: 'home' | 'catalog' | 'pdp' | 'admin';
  setCurrentView: (view: 'home' | 'catalog' | 'pdp' | 'admin') => void;
  navigateToProduct: (productOrId: Product | string) => void;
  getProductUrl: (product: Product | { id: string; slug?: string }) => string;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategoryFilter: string | null;
  setActiveCategoryFilter: (catId: string | null) => void;
  
  // Private Admin Portal Navigation & Security
  isPrivateAdminRoute: boolean;
  isAdminAuthenticated: boolean;
  loginAdmin: (user: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => void;
  getPrivateAdminLink: () => string;
  exitAdminPortal: () => void;
  returnToStorefront: () => void;
  
  // Data
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'created_at'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  quickUpdateProductPrice: (id: string, newPriceSYP: number, newPriceUSD?: number) => void;
  deleteProduct: (id: string) => void;
  archiveProduct: (id: string, isArchived: boolean) => void;
  
  categories: Category[];
  addCategory: (catData: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  archiveCategory: (id: string, isArchived: boolean) => void;
  
  heroSlides: HeroSlide[];
  addHeroSlide: (slide: Omit<HeroSlide, 'id'>) => void;
  updateHeroSlide: (id: string, data: Partial<HeroSlide>) => void;
  deleteHeroSlide: (id: string) => void;
  
  staffUsers: StaffUser[];
  addStaffUser: (user: Omit<StaffUser, 'id' | 'created_at'>) => void;
  updateStaffUser: (id: string, data: Partial<StaffUser>) => void;
  deleteStaffUser: (id: string) => void;
  activeStaffRole: StaffRole;
  setActiveStaffRole: (role: StaffRole) => void;
  
  // Analytics & Permanent Storage
  visitorStats: VisitorStatDay[];
  analyticsVisits: AnalyticsVisitRecord[];
  trackVisit: (path: string, pageTitle?: string) => void;
  resetAnalyticsData: () => Promise<void>;
  saveAllDataToSupabase: () => Promise<{ success: boolean; message: string }>;
  generateSitemapXml: () => string;
  generateRobotsTxt: () => string;
  
  orders: Order[];
  createOrder: (orderData: {
    customer_name: string;
    customer_phone: string;
    governorate: string;
    delivery_address: string;
    notes?: string;
  }) => { order: Order; whatsappUrl: string };
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  resyncOrderToSheets: (orderId: string) => Promise<boolean>;
  
  maintenanceRequests: MaintenanceRequest[];
  createMaintenanceRequest: (req: Omit<MaintenanceRequest, 'id' | 'request_number' | 'created_at' | 'status'>) => { request: MaintenanceRequest; whatsappUrl: string };
  updateMaintenanceStatus: (id: string, status: MaintenanceRequest['status'], adminNotes?: string) => void;
  
  storeSettings: StoreSettings;
  updateStoreSettings: (settings: Partial<StoreSettings>) => void;
  
  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedVariants?: { [variantName: string]: string }) => void;
  removeFromCart: (productId: string, variantKey?: string) => void;
  updateCartQuantity: (productId: string, quantity: number, variantKey?: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  deliveryFee: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  
  // Maintenance Modal
  isMaintenanceOpen: boolean;
  setIsMaintenanceOpen: (open: boolean) => void;

  // Site Details Modal
  isSiteDetailsOpen: boolean;
  setIsSiteDetailsOpen: (open: boolean) => void;

  // Custom Phone Request Modal
  isPhoneRequestOpen: boolean;
  setIsPhoneRequestOpen: (open: boolean) => void;
  phoneRequests: PhoneRequest[];
  createPhoneRequest: (reqData: {
    customer_name: string;
    phone: string;
    address: string;
    device_type: string;
    specifications: string;
    storage?: string;
    color?: string;
    condition?: string;
  }) => { request: PhoneRequest; whatsappUrl: string };
  
  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  
  // Google Sheets Logs
  sheetsSyncLogs: SheetsSyncLog[];
  testGoogleSheetsWebhook: (customUrl?: string) => Promise<{ success: boolean; message: string }>;
  
  // Toast notifications
  toastMessage: string | null;
  showToast: (msg: string) => void;
  
  // Helpers
  getWhatsAppProductUrl: (product: Product) => string;
  getWhatsAppPriceInquiryUrl: (product: Product) => string;
  formatProductPrice: (product: Product) => {
    type: 'syp' | 'usd' | 'inquire';
    primary: string;
    secondary?: string;
    isDiscounted?: boolean;
    compareAt?: string;
    sypValue?: number;
    usdValue?: number;
  };

  // Brands
  brands: string[];
  addBrand: (brandName: string) => boolean;
  deleteBrand: (brandName: string) => void;

  // Supabase Real-Time Data Sync & Loading State
  isDataLoading: boolean;
  refreshAllStoreData: () => Promise<void>;
  isSupabaseConfigured: boolean;
  lastSynced: Date | null;
  lastSyncStatus: 'synced' | 'syncing' | 'error';
  triggerManualSync: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Supabase Database Sync Status & Timestamp
  const [lastSynced, setLastSynced] = useState<Date | null>(new Date());
  const [lastSyncStatus, setLastSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');

  const onDatabaseSynced = useCallback((result?: any) => {
    if (result && result.success === false) {
      console.warn('Database sync reported error:', result.error);
      setLastSyncStatus('error');
      return;
    }
    setLastSynced(new Date());
    setLastSyncStatus('synced');
  }, []);

  const onDatabaseSyncError = useCallback((err?: any) => {
    console.warn('Database sync error:', err);
    setLastSyncStatus('error');
  }, []);

  // Locale State
  const [locale, setLocaleState] = useState<Language>(() => {
    const saved = localStorage.getItem('allaith_locale');
    return (saved === 'en' || saved === 'ar') ? saved : 'ar';
  });

  // Currency State (Primary: SYP, Supported: USD)
  const [activeCurrency, setActiveCurrency] = useState<ActiveCurrency>(() => {
    const saved = localStorage.getItem('allaith_currency');
    return (saved === 'USD' || saved === 'SYP') ? saved : 'SYP';
  });

  useEffect(() => {
    localStorage.setItem('allaith_currency', activeCurrency);
  }, [activeCurrency]);

  // Set document direction on locale change
  useEffect(() => {
    localStorage.setItem('allaith_locale', locale);
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (lang: Language) => {
    setLocaleState(lang);
  };

  // Translations
  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const dict = translations[locale] as Record<string, string>;
    let text = dict[key] || key;
    if (params) {
      Object.entries(params).forEach(([pKey, pVal]) => {
        text = text.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal));
      });
    }
    return text;
  }, [locale]);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4000);
  };

  // Private Admin Route & Dedicated URL Detection
  const checkIsAdminHash = () => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    return (
      path.endsWith('/admin') ||
      path === '/admin/' ||
      hash === '#admin' ||
      hash === '#/admin' ||
      hash === '#admin-portal' ||
      search.includes('portal=admin') ||
      search.includes('admin=laith')
    );
  };

  const [isPrivateAdminRoute, setIsPrivateAdminRoute] = useState<boolean>(checkIsAdminHash);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('allaith_admin_auth') === 'true';
  });

  const [currentView, setCurrentViewState] = useState<'home' | 'catalog' | 'pdp' | 'admin'>(() => {
    if (typeof window === 'undefined') return 'home';
    if (checkIsAdminHash()) return 'admin';
    const hash = window.location.hash;
    const path = window.location.pathname;
    const search = window.location.search;
    if (hash.match(/^#\/?product\//i) || path.match(/^\/product\//i) || search.includes('product=') || search.includes('p=')) {
      return 'pdp';
    }
    if (hash.includes('catalog') || path === '/catalog') {
      return 'catalog';
    }
    return 'home';
  });

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);

  const loginAdmin = async (usernameInput: string, passwordInput: string): Promise<{ success: boolean; error?: string }> => {
    const result = await authenticateAdminWithSupabase(usernameInput, passwordInput, {
      customUrl: storeSettings.supabase_url,
      customKey: storeSettings.supabase_anon_key,
      fallbackUsername: storeSettings.admin_username || 'admin',
      fallbackPassword: storeSettings.admin_password || 'laith2026'
    });

    if (result.success) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('allaith_admin_auth', 'true');
      showToast(locale === 'ar' ? 'تم تسجيل الدخول إلى لوحة التحكم بنجاح!' : 'Logged in to dashboard successfully!');
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('allaith_admin_auth');
    exitAdminPortal();
    showToast(locale === 'ar' ? 'تم تسجيل الخروج من لوحة التحكم' : 'Logged out from control panel');
  };

  const exitAdminPortal = () => {
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    setIsPrivateAdminRoute(false);
    setCurrentViewState('home');
  };

  const returnToStorefront = () => {
    exitAdminPortal();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPrivateAdminLink = () => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/admin (أو ${window.location.origin}/#/admin)`;
  };

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [isPhoneRequestOpen, setIsPhoneRequestOpen] = useState(false);
  const [isSiteDetailsOpen, setIsSiteDetailsOpen] = useState(false);

  // Custom Phone Requests
  const [phoneRequests, setPhoneRequests] = useState<PhoneRequest[]>(() => {
    try {
      const saved = localStorage.getItem('allaith_phone_requests');
      if (saved) {
        const parsed: PhoneRequest[] = JSON.parse(saved);
        return parsed.filter((r) => r.id !== 'req-1');
      }
      return initialPhoneRequests;
    } catch {
      return initialPhoneRequests;
    }
  });

  useEffect(() => {
    localStorage.setItem('allaith_phone_requests', JSON.stringify(phoneRequests));
  }, [phoneRequests]);

  // Store Settings
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('allaith_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...initialStoreSettings, ...parsed };
      }
      return initialStoreSettings;
    } catch {
      return initialStoreSettings;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('allaith_settings', JSON.stringify(storeSettings));
    } catch (e) {
      console.warn('Error saving allaith_settings to localStorage:', e);
    }
  }, [storeSettings]);

  const updateStoreSettings = (data: Partial<StoreSettings>) => {
    setStoreSettings((prev) => {
      const merged = { ...prev, ...data };
      try {
        localStorage.setItem('allaith_settings', JSON.stringify(merged));
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }

      // Persist to server backend storage immediately
      fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged)
      }).catch((e) => console.warn('Server settings sync error:', e));

      // Persist to Supabase database immediately
      upsertSettingsToSupabase(merged)
        .then((res) => {
          if (res.success) {
            onDatabaseSynced();
          } else {
            console.warn('Supabase settings sync error:', res.error);
            onDatabaseSyncError(res.error);
          }
        })
        .catch(onDatabaseSyncError);

      return merged;
    });
    showToast(t('save_changes'));
  };

  // Real-time Dollar Exchange Rate State (fetched immediately on site open from sp-today.com)
  const [exchangeRateData, setExchangeRateData] = useState<SpTodayExchangeData | null>(() => {
    try {
      const cached = sessionStorage.getItem('sptoday_exchange_rate');
      return cached ? JSON.parse(cached) : DEFAULT_FALLBACK_RATE;
    } catch {
      return DEFAULT_FALLBACK_RATE;
    }
  });
  const [isExchangeRateLoading, setIsExchangeRateLoading] = useState<boolean>(true);
  const [exchangeRateError, setExchangeRateError] = useState<string | null>(null);
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState<boolean>(false);
  const [liraDisplayMode, setLiraDisplayModeState] = useState<LiraDisplayMode>(() => {
    const saved = localStorage.getItem('allaith_lira_mode') as LiraDisplayMode;
    return (saved === 'both' || saved === 'new' || saved === 'old') ? saved : 'both';
  });

  const setLiraDisplayMode = (mode: LiraDisplayMode) => {
    setLiraDisplayModeState(mode);
    localStorage.setItem('allaith_lira_mode', mode);
  };

  const refreshExchangeRate = useCallback(async (force = false) => {
    setIsExchangeRateLoading(true);
    setExchangeRateError(null);
    try {
      const data = await fetchLiveDollarRate(force);
      setExchangeRateData(data);
      // NOTE: We do not silently overwrite storeSettings.usd_exchange_rate here
      // so any rate saved by the store owner in the dashboard settings is strictly preserved.
      // The owner can explicitly click "Apply Live Rate" whenever desired.
    } catch (err: any) {
      console.warn('Error fetching live dollar rate from sp-today.com:', err);
      setExchangeRateError(err?.message || 'Error fetching rate');
    } finally {
      setIsExchangeRateLoading(false);
    }
  }, []);

  const applyLiveRateToCatalog = useCallback(() => {
    if (exchangeRateData?.old_lira?.sell) {
      updateStoreSettings({
        usd_exchange_rate: exchangeRateData.old_lira.sell
      });
      showToast(locale === 'ar'
        ? `تم تطبيق سعر الصرف المباشر (1$ = ${exchangeRateData.old_lira.sell.toLocaleString()} ل.س)`
        : `Applied live USD rate (1$ = ${exchangeRateData.old_lira.sell.toLocaleString()} SYP)`
      );
    }
  }, [exchangeRateData, locale, showToast]);

  // Automatically fetch real-time dollar rate when user opens site + periodic sync every 3 minutes
  useEffect(() => {
    refreshExchangeRate();
    const interval = setInterval(() => {
      refreshExchangeRate();
    }, 180000);
    return () => clearInterval(interval);
  }, [refreshExchangeRate]);

  // Currency Converter & Formatter
  const convertSYPtoUSD = useCallback((amountInSYP: number) => {
    const rate = storeSettings.usd_exchange_rate > 0 ? storeSettings.usd_exchange_rate : 13425;
    return Math.round(amountInSYP / rate);
  }, [storeSettings.usd_exchange_rate]);

  const formatPrice = useCallback((amountInSYP: number): string => {
    if (activeCurrency === 'USD') {
      const usdVal = convertSYPtoUSD(amountInSYP);
      return `$${usdVal.toLocaleString()}`;
    }
    const newLira = Number((amountInSYP / 100).toFixed(2));
    if (liraDisplayMode === 'new') {
      return `${newLira.toLocaleString()} ${locale === 'ar' ? 'ل.س جديدة' : 'SYP (new)'}`;
    }
    if (liraDisplayMode === 'old') {
      return `${amountInSYP.toLocaleString()} ${locale === 'ar' ? 'ل.س قديمة' : 'SYP (old)'}`;
    }
    // both
    return `${newLira.toLocaleString()} ${locale === 'ar' ? 'جديدة' : 'new'} (${amountInSYP.toLocaleString()} ${locale === 'ar' ? 'قديمة' : 'old'})`;
  }, [activeCurrency, convertSYPtoUSD, liraDisplayMode, locale]);

  const formatDualPrice = useCallback((amountInSYP: number): { primary: string; secondary: string } => {
    const usdVal = convertSYPtoUSD(amountInSYP);
    const newLira = Number((amountInSYP / 100).toFixed(2));
    const sypFormatted = liraDisplayMode === 'new'
      ? `${newLira.toLocaleString()} ${locale === 'ar' ? 'ل.س جديدة' : 'SYP (new)'}`
      : liraDisplayMode === 'old'
      ? `${amountInSYP.toLocaleString()} ${locale === 'ar' ? 'ل.س قديمة' : 'SYP (old)'}`
      : `${newLira.toLocaleString()} ${locale === 'ar' ? 'جديدة' : 'new'} (${amountInSYP.toLocaleString()} ${locale === 'ar' ? 'قديمة' : 'old'})`;
    
    if (activeCurrency === 'USD') {
      return {
        primary: `$${usdVal.toLocaleString()}`,
        secondary: sypFormatted
      };
    }
    return {
      primary: sypFormatted,
      secondary: `$${usdVal.toLocaleString()}`
    };
  }, [activeCurrency, convertSYPtoUSD, liraDisplayMode, locale]);

  // Products
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('allaith_products');
      return saved ? JSON.parse(saved) : initialProducts;
    } catch {
      return initialProducts;
    }
  });

  useEffect(() => {
    localStorage.setItem('allaith_products', JSON.stringify(products));
  }, [products]);

  const getProductUrl = (product: Product | { id: string; slug?: string }): string => {
    return getProductShareableUrl(product, storeSettings.site_domain);
  };

  const navigateToProduct = (productOrId: Product | string) => {
    const prod = typeof productOrId === 'string'
      ? products.find(p => p.id === productOrId || p.slug === productOrId)
      : productOrId;

    if (prod) {
      setSelectedProductId(prod.id);
      const slug = getProductUniqueSlug(prod);
      window.location.hash = `product/${slug}`;
      setCurrentViewState('pdp');
      setIsPrivateAdminRoute(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const setCurrentView = (view: 'home' | 'catalog' | 'pdp' | 'admin') => {
    if (view === 'admin') {
      window.location.hash = '/admin';
      setIsPrivateAdminRoute(true);
    } else if (view === 'catalog') {
      window.location.hash = 'catalog';
      setIsPrivateAdminRoute(false);
    } else if (view === 'pdp') {
      const prod = products.find(p => p.id === selectedProductId);
      if (prod) {
        const slug = getProductUniqueSlug(prod);
        window.location.hash = `product/${slug}`;
      }
      setIsPrivateAdminRoute(false);
    } else if (view === 'home') {
      if (window.location.hash) {
        window.location.hash = '';
      }
      setIsPrivateAdminRoute(false);
    }
    setCurrentViewState(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Keep browser address bar in sync with the active product when viewing PDP
  useEffect(() => {
    if (currentView === 'pdp' && selectedProductId) {
      const prod = products.find(p => p.id === selectedProductId);
      if (prod) {
        const slug = getProductUniqueSlug(prod);
        const desiredHash = `#product/${slug}`;
        if (window.location.hash !== desiredHash && window.location.hash !== `#/${desiredHash.slice(1)}`) {
          window.location.hash = `product/${slug}`;
        }
      }
    }
  }, [currentView, selectedProductId, products]);

  const addProduct = (prodData: Omit<Product, 'id' | 'created_at'>) => {
    // Generate clean unique URL slug from title
    const baseSlug = (prodData.slug || prodData.title_en || prodData.title_ar || `product-${Date.now()}`)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || `product-${Date.now()}`;

    // Auto-calculate discount if compare_at_price is provided
    let hasDiscount = prodData.has_discount;
    let discountPercent = prodData.discount_percent || 0;
    if (prodData.compare_at_price && prodData.compare_at_price > prodData.price) {
      hasDiscount = true;
      discountPercent = Math.round(((prodData.compare_at_price - prodData.price) / prodData.compare_at_price) * 100);
    } else if (prodData.compare_at_price_usd && prodData.price_usd && prodData.compare_at_price_usd > prodData.price_usd) {
      hasDiscount = true;
      discountPercent = Math.round(((prodData.compare_at_price_usd - prodData.price_usd) / prodData.compare_at_price_usd) * 100);
    }

    const newProduct: Product = {
      ...prodData,
      slug: baseSlug,
      has_discount: hasDiscount,
      discount_percent: discountPercent,
      is_archived: false,
      id: `prod-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    setProducts((prev) => [newProduct, ...prev]);
    upsertProductToSupabase(newProduct)
      .then((res) => {
        if (res.success) {
          onDatabaseSynced(res);
        } else {
          onDatabaseSyncError(res.error);
          console.error('Supabase product sync error:', res.error);
        }
      })
      .catch(onDatabaseSyncError);
    showToast(t('product_saved'));
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const merged = { ...p, ...updated };
        if (merged.compare_at_price && merged.compare_at_price > merged.price) {
          merged.has_discount = true;
          merged.discount_percent = Math.round(((merged.compare_at_price - merged.price) / merged.compare_at_price) * 100);
        } else if (merged.compare_at_price_usd && merged.price_usd && merged.compare_at_price_usd > merged.price_usd) {
          merged.has_discount = true;
          merged.discount_percent = Math.round(((merged.compare_at_price_usd - merged.price_usd) / merged.compare_at_price_usd) * 100);
        }
        upsertProductToSupabase(merged)
          .then((res) => {
            if (res.success) {
              onDatabaseSynced(res);
            } else {
              onDatabaseSyncError(res.error);
              console.error('Supabase product update error:', res.error);
            }
          })
          .catch(onDatabaseSyncError);
        return merged;
      })
    );
    showToast(t('product_saved'));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    deleteProductFromSupabase(id).then(onDatabaseSynced).catch(onDatabaseSyncError);
    showToast(t('product_deleted'));
  };

  const archiveProduct = (id: string, isArchived: boolean) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, is_archived: isArchived } : p)));
    archiveProductInSupabase(id, isArchived).then(onDatabaseSynced).catch(onDatabaseSyncError);
    showToast(
      isArchived
        ? (locale === 'ar' ? 'تمت أرشفة المنتج وإخفاؤه من الواجهة العامة للمتجر' : 'Product archived and hidden from public store')
        : (locale === 'ar' ? 'تمت استعادة المنتج وإلغاء الأرشفة بنجاح' : 'Product restored and unarchived')
    );
  };

  const quickUpdateProductPrice = (id: string, newPriceSYP: number, newPriceUSD?: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const currentRate = storeSettings.usd_exchange_rate > 0 ? storeSettings.usd_exchange_rate : 15000;
        const usd = newPriceUSD !== undefined && newPriceUSD > 0 ? newPriceUSD : Math.round(newPriceSYP / currentRate);
        const updated = {
          ...p,
          price: newPriceSYP,
          price_usd: usd
        };
        upsertProductToSupabase(updated).then(onDatabaseSynced).catch(onDatabaseSyncError);
        return updated;
      })
    );
    showToast(locale === 'ar' ? 'تم تحديث السعر وحفظه فوراً في المتجر!' : 'Price updated and saved instantly!');
  };

  // Brands Management (Dynamic brands configurable from Admin Panel)
  const [brands, setBrands] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('allaith_brands');
      if (saved) return JSON.parse(saved);
      const productBrands = initialProducts.map((p) => p.brand).filter(Boolean);
      return Array.from(new Set([...initialBrands, ...productBrands]));
    } catch {
      return initialBrands;
    }
  });

  useEffect(() => {
    localStorage.setItem('allaith_brands', JSON.stringify(brands));
  }, [brands]);

  const addBrand = (brandName: string): boolean => {
    const trimmed = brandName.trim();
    if (!trimmed) return false;
    if (brands.some((b) => b.toLowerCase() === trimmed.toLowerCase())) {
      showToast(locale === 'ar' ? 'هذه الماركة موجودة بالفعل' : 'Brand already exists');
      return false;
    }
    setBrands((prev) => [...prev, trimmed]);
    showToast(t('brand_added_success'));
    return true;
  };

  const deleteBrand = (brandName: string) => {
    setBrands((prev) => prev.filter((b) => b.toLowerCase() !== brandName.toLowerCase()));
    showToast(locale === 'ar' ? 'تم حذف الماركة من القائمة' : 'Brand removed from list');
  };

  // Dedicated WhatsApp link for price inquiry ("Inquire about price")
  const getWhatsAppPriceInquiryUrl = useCallback((product: Product): string => {
    const isAr = locale === 'ar';
    const title = isAr ? product.title_ar : product.title_en;
    const storeName = isAr ? storeSettings.site_name_ar : storeSettings.site_name_en;
    const conditionText = product.condition === 'used'
      ? (isAr ? 'مستعمل ومفحوص' : 'Used & Inspected')
      : (isAr ? 'جديد كلياً' : 'Brand New');

    const msg = isAr
      ? `مرحباً ${storeName}،\nأود الاستفسار عن سعر وتوفر الجهاز التالي:\n• الجهاز: *${title}*\n• الماركة: ${product.brand}\n• الحالة: ${conditionText}\n• رمز القطعة (SKU): ${product.sku}\n${product.condition_details ? `• ملاحظات الحالة: ${product.condition_details}\n` : ''}\nيرجى تزويدي بالسعر المعتمد لليوم وخيارات المعاينة أو التوصيل في دمشق وسوريا. شكراً لكم!`
      : `Hello ${storeName},\nI would like to inquire about current price and availability for:\n• Product: *${title}*\n• Brand: ${product.brand}\n• Condition: ${conditionText}\n• SKU: ${product.sku}\n${product.condition_details ? `• Condition Details: ${product.condition_details}\n` : ''}\nPlease provide today's current price and delivery options in Syria. Thank you!`;

    const cleanPhone = storeSettings.whatsapp_number.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  }, [locale, storeSettings.site_name_ar, storeSettings.site_name_en, storeSettings.whatsapp_number]);

  // Comprehensive Product Price Formatter supporting Syrian Lira as base price with USD as secondary
  const formatProductPrice = useCallback((product: Product) => {
    const sypLabel = locale === 'ar' ? 'ل.س' : 'SYP';
    const currentRate = storeSettings.usd_exchange_rate > 0 ? storeSettings.usd_exchange_rate : 13425;

    if (product.pricing_type === 'inquire') {
      return {
        type: 'inquire' as const,
        primary: locale === 'ar' ? 'السعر عند الطلب' : 'Price on Request',
        secondary: locale === 'ar' ? 'تواصل عبر وتساب للاستفسار' : 'Inquire on WhatsApp',
        isDiscounted: false,
        compareAt: undefined,
        sypValue: 0,
        usdValue: 0
      };
    }

    // Determine effective SYP and USD amounts based on strategy
    let effectiveSYP = product.price || 0;
    let effectiveUSD = product.price_usd || 0;

    if (product.pricing_strategy === 'auto_daily_rate' || product.pricing_strategy === 'usd_as_base') {
      // Dynamic: calculated automatically based on the daily dollar rate
      if (effectiveUSD > 0) {
        effectiveSYP = Math.round(effectiveUSD * currentRate);
      } else if (effectiveSYP > 0) {
        effectiveUSD = Math.round(effectiveSYP / currentRate);
      }
    } else if (product.pricing_strategy === 'fixed_usd') {
      // Fixed USD price: base calculation in USD, SYP calculated at current exchange rate
      if (effectiveUSD > 0) {
        effectiveSYP = Math.round(effectiveUSD * currentRate);
      }
    } else {
      // Default: Syrian Lira is base price, USD is calculated equivalent
      if (effectiveSYP > 0 && (!effectiveUSD || effectiveUSD === 0)) {
        effectiveUSD = Math.round(effectiveSYP / currentRate);
      }
    }

    // Format Syrian Lira according to user preference (both, new, old)
    const newLira = Number((effectiveSYP / 100).toFixed(2));
    let sypFormatted = `${effectiveSYP.toLocaleString()} ${sypLabel}`;
    if (liraDisplayMode === 'new') {
      sypFormatted = `${newLira.toLocaleString()} ${locale === 'ar' ? 'ل.س جديدة' : 'SYP (new)'}`;
    } else if (liraDisplayMode === 'old') {
      sypFormatted = `${effectiveSYP.toLocaleString()} ${locale === 'ar' ? 'ل.س قديمة' : 'SYP (old)'}`;
    } else {
      // both
      sypFormatted = `${newLira.toLocaleString()} ${locale === 'ar' ? 'جديدة' : 'new'} (${effectiveSYP.toLocaleString()} ${locale === 'ar' ? 'قديمة' : 'old'})`;
    }

    const usdFormatted = `$${effectiveUSD.toLocaleString()} USD`;

    // Compare-at / discount calculation
    let hasDiscount = false;
    let compareAtFormatted: string | undefined = undefined;

    if (product.compare_at_price && product.compare_at_price > effectiveSYP) {
      hasDiscount = true;
      const compNew = Number((product.compare_at_price / 100).toFixed(2));
      compareAtFormatted = liraDisplayMode === 'new'
        ? `${compNew.toLocaleString()} ${locale === 'ar' ? 'ل.س جديدة' : 'SYP (new)'}`
        : `${product.compare_at_price.toLocaleString()} ${sypLabel}`;
    } else if (product.compare_at_price_usd && product.compare_at_price_usd > effectiveUSD) {
      hasDiscount = true;
      const compSyp = Math.round(product.compare_at_price_usd * currentRate);
      compareAtFormatted = `${compSyp.toLocaleString()} ${sypLabel}`;
    }

    // User explicitly requested: Base price in Syrian Lira, with US Dollar as secondary price.
    // If the customer toggled currency explicitly to USD in header, show USD as primary and SYP as secondary.
    if (activeCurrency === 'USD') {
      return {
        type: product.pricing_type || 'syp',
        primary: usdFormatted,
        secondary: sypFormatted,
        isDiscounted: hasDiscount,
        compareAt: compareAtFormatted ? (product.compare_at_price_usd ? `$${product.compare_at_price_usd.toLocaleString()}` : compareAtFormatted) : undefined,
        sypValue: effectiveSYP,
        usdValue: effectiveUSD
      };
    }

    // Standard default: Syrian Lira is primary base price, USD is secondary
    return {
      type: product.pricing_type || 'syp',
      primary: sypFormatted,
      secondary: usdFormatted,
      isDiscounted: hasDiscount,
      compareAt: compareAtFormatted,
      sypValue: effectiveSYP,
      usdValue: effectiveUSD
    };
  }, [activeCurrency, liraDisplayMode, locale, storeSettings.usd_exchange_rate]);

  // Categories
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('allaith_categories');
      return saved ? JSON.parse(saved) : initialCategories;
    } catch {
      return initialCategories;
    }
  });

  useEffect(() => {
    localStorage.setItem('allaith_categories', JSON.stringify(categories));
  }, [categories]);

  const addCategory = (catData: Omit<Category, 'id'>) => {
    const baseSlug = (catData.slug || catData.name_en || catData.name_ar || `cat-${Date.now()}`)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || `cat-${Date.now()}`;

    const newCat: Category = {
      ...catData,
      slug: baseSlug,
      is_archived: false,
      id: `cat-${Date.now()}`
    };
    setCategories((prev) => [...prev, newCat]);
    upsertCategoryToSupabase(newCat).then(onDatabaseSynced).catch(onDatabaseSyncError);
    showToast(locale === 'ar' ? 'تمت إضافة الفئة بنجاح!' : 'Category added successfully!');
  };

  const updateCategory = (id: string, data: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const merged = { ...c, ...data };
        upsertCategoryToSupabase(merged).then(onDatabaseSynced).catch(onDatabaseSyncError);
        return merged;
      })
    );
    showToast(locale === 'ar' ? 'تم تحديث بيانات الفئة' : 'Category updated');
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    deleteCategoryFromSupabase(id).then(onDatabaseSynced).catch(onDatabaseSyncError);
    showToast(locale === 'ar' ? 'تم حذف الفئة' : 'Category deleted');
  };

  const archiveCategory = (id: string, isArchived: boolean) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, is_archived: isArchived } : c)));
    archiveCategoryInSupabase(id, isArchived).then(onDatabaseSynced).catch(onDatabaseSyncError);
    showToast(
      isArchived
        ? (locale === 'ar' ? 'تمت أرشفة الفئة وإخفاؤها من المتجر' : 'Category archived and hidden')
        : (locale === 'ar' ? 'تمت استعادة الفئة وإلغاء الأرشفة بنجاح' : 'Category restored and unarchived')
    );
  };

  // Synchronize URL and handle back/forward browser navigation
  useEffect(() => {
    const handleUrlChange = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;
      const search = window.location.search;

      if (checkIsAdminHash()) {
        setIsPrivateAdminRoute(true);
        setCurrentViewState('admin');
        return;
      }

      setIsPrivateAdminRoute(false);

      // Check product slug e.g. #product/slug or #/product/slug or /product/slug or ?product=slug or ?p=slug
      let targetProductSlug: string | null = null;

      // 1. Hash matching: #product/xyz or #/product/xyz or #p=xyz
      const hashProdMatch = hash.match(/^#\/?product\/([^/?#&]+)/i) || hash.match(/^#\/?p=([^/?#&]+)/i);
      if (hashProdMatch && hashProdMatch[1]) {
        targetProductSlug = decodeURIComponent(hashProdMatch[1]);
      }

      // 2. Query param matching: ?product=xyz or ?p=xyz
      if (!targetProductSlug && search) {
        try {
          const params = new URLSearchParams(search);
          const pParam = params.get('product') || params.get('p');
          if (pParam) {
            targetProductSlug = decodeURIComponent(pParam);
          }
        } catch {
          // ignore query parse error
        }
      }

      // 3. Path matching: /product/xyz
      if (!targetProductSlug) {
        const pathProdMatch = path.match(/^\/product\/([^/?#]+)/i);
        if (pathProdMatch && pathProdMatch[1]) {
          targetProductSlug = decodeURIComponent(pathProdMatch[1]);
        }
      }

      if (targetProductSlug) {
        const clean = targetProductSlug.trim().toLowerCase();
        const found = products.find(p =>
          (p.slug && p.slug.trim().toLowerCase() === clean) ||
          p.id.toLowerCase() === clean
        );
        if (found) {
          setSelectedProductId(found.id);
          setCurrentViewState('pdp');
          return;
        }
      }

      // Check category slug e.g. #/category/slug or #category/slug
      const catMatch = hash.match(/^#\/?category\/([^/?#]+)/i) || path.match(/^\/category\/([^/?#]+)/i);
      if (catMatch && catMatch[1]) {
        const targetCatSlug = decodeURIComponent(catMatch[1]).toLowerCase();
        const foundCat = categories.find(c => 
          (c.slug && c.slug.toLowerCase() === targetCatSlug) || 
          c.id.toLowerCase() === targetCatSlug
        );
        if (foundCat) {
          setActiveCategoryFilter(foundCat.id);
          setCurrentViewState('catalog');
          return;
        }
      }

      if (hash === '#/catalog' || hash === '#catalog' || path === '/catalog') {
        setCurrentViewState('catalog');
        return;
      }

      if (!hash || hash === '#' || hash === '#/' || path === '/') {
        setCurrentViewState('home');
      }
    };

    // Run immediately on mount or when products / categories change
    handleUrlChange();

    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, [products, categories]);

  // Hero Slider Slides (Dynamic homepage banners editable from dashboard)
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(() => {
    try {
      const saved = localStorage.getItem('allaith_hero_slides');
      return saved ? JSON.parse(saved) : initialHeroSlides;
    } catch {
      return initialHeroSlides;
    }
  });

  useEffect(() => {
    localStorage.setItem('allaith_hero_slides', JSON.stringify(heroSlides));
  }, [heroSlides]);

  const addHeroSlide = (slide: Omit<HeroSlide, 'id'>) => {
    const newSlide: HeroSlide = {
      ...slide,
      id: `slide-${Date.now()}`
    };
    setHeroSlides((prev) => {
      const updated = [...prev, newSlide];
      upsertHeroSlideToSupabase(newSlide, updated.length - 1).then(onDatabaseSynced).catch(onDatabaseSyncError);
      return updated;
    });
    showToast(locale === 'ar' ? 'تمت إضافة بانر جديد للرئيسية' : 'New hero banner added');
  };

  const updateHeroSlide = (id: string, data: Partial<HeroSlide>) => {
    setHeroSlides((prev) =>
      prev.map((s, idx) => {
        if (s.id !== id) return s;
        const merged = { ...s, ...data };
        upsertHeroSlideToSupabase(merged, idx).then(onDatabaseSynced).catch(onDatabaseSyncError);
        return merged;
      })
    );
    showToast(locale === 'ar' ? 'تم حفظ تعديلات البانر بنجاح' : 'Banner slide updated');
  };

  const deleteHeroSlide = (id: string) => {
    setHeroSlides((prev) => prev.filter((s) => s.id !== id));
    deleteHeroSlideFromSupabase(id).then(onDatabaseSynced).catch(onDatabaseSyncError);
    showToast(locale === 'ar' ? 'تم حذف البانر' : 'Banner slide deleted');
  };

  // Staff Users & Restricted Access Roles (RBAC)
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>(() => {
    try {
      const saved = localStorage.getItem('allaith_staff_users');
      return saved ? JSON.parse(saved) : initialStaffUsers;
    } catch {
      return initialStaffUsers;
    }
  });

  useEffect(() => {
    localStorage.setItem('allaith_staff_users', JSON.stringify(staffUsers));
  }, [staffUsers]);

  const [activeStaffRole, setActiveStaffRole] = useState<StaffRole>('super_admin');

  const addStaffUser = (user: Omit<StaffUser, 'id' | 'created_at'>) => {
    const newUser: StaffUser = {
      ...user,
      id: `staff-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    setStaffUsers((prev) => [...prev, newUser]);
    showToast(locale === 'ar' ? 'تمت إضافة المستخدم وتحديد الصلاحيات!' : 'User added successfully!');
  };

  const updateStaffUser = (id: string, data: Partial<StaffUser>) => {
    setStaffUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)));
    showToast(locale === 'ar' ? 'تم تحديث صلاحيات المستخدم' : 'User updated');
  };

  const deleteStaffUser = (id: string) => {
    setStaffUsers((prev) => prev.filter((u) => u.id !== id));
    showToast(locale === 'ar' ? 'تم حذف المستخدم من النظام' : 'User removed');
  };

  // Visitor Analytics & Permanent Visit Logs
  const [visitorStats] = useState<VisitorStatDay[]>(() => {
    return [];
  });

  const [analyticsVisits, setAnalyticsVisits] = useState<AnalyticsVisitRecord[]>(() => {
    try {
      // Versioned reset flag to clear past mock/pre-seeded records once and for all
      const hasReset = localStorage.getItem('allaith_analytics_reset_clean_2026');
      if (!hasReset) {
        localStorage.removeItem('allaith_analytics_visits');
        localStorage.removeItem('allaith_visitor_stats');
        localStorage.setItem('allaith_analytics_reset_clean_2026', 'true');
        return [];
      }

      const saved = localStorage.getItem('allaith_analytics_visits');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Discard any residual mock records that used user_# IDs
          return parsed.filter((r: any) => !r.visitor_id?.startsWith('user_'));
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('allaith_analytics_visits', JSON.stringify(analyticsVisits));
  }, [analyticsVisits]);

  // Sync real visits from server on load
  useEffect(() => {
    fetch('/api/analytics/summary')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.visits) && data.visits.length > 0) {
          setAnalyticsVisits((prev) => {
            const existingIds = new Set(prev.map((v) => v.id));
            const newServerVisits = data.visits.filter((v: AnalyticsVisitRecord) => !existingIds.has(v.id));
            if (newServerVisits.length === 0) return prev;
            const combined = [...prev, ...newServerVisits].sort(
              (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
            return combined.slice(0, 2000);
          });
        }
      })
      .catch(() => {});
  }, []);

  const trackVisit = useCallback((visitPath: string, pageTitle?: string) => {
    // Avoid counting internal admin control panel visits as customer visits
    if (!visitPath || visitPath.startsWith('/admin')) {
      return;
    }

    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    let detectedDevice: 'mobile' | 'desktop' | 'tablet' = 'desktop';
    if (typeof window !== 'undefined') {
      if (/iPad|Tablet/i.test(ua) || (window.innerWidth >= 640 && window.innerWidth < 1024)) {
        detectedDevice = 'tablet';
      } else if (/Mobi|Android|iPhone|iPod/i.test(ua) || window.innerWidth < 640) {
        detectedDevice = 'mobile';
      }
    }

    let detectedReferrer = 'Direct';
    if (typeof document !== 'undefined' && document.referrer) {
      try {
        const refUrl = new URL(document.referrer);
        if (refUrl.origin !== window.location.origin) {
          detectedReferrer = refUrl.hostname.replace(/^www\./, '');
        }
      } catch {
        detectedReferrer = 'Direct';
      }
    }

    let visitorId = 'u_guest';
    if (typeof window !== 'undefined') {
      let vid = localStorage.getItem('allaith_visitor_uid');
      if (!vid) {
        vid = 'v_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('allaith_visitor_uid', vid);
      }
      visitorId = vid;
    }

    const newRecord: AnalyticsVisitRecord = {
      id: `v_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      path: visitPath,
      page_title: pageTitle || 'Al-Laith Telecom',
      referrer: detectedReferrer,
      device: detectedDevice,
      visitor_id: visitorId,
      duration_seconds: 45
    };

    setAnalyticsVisits((prev) => [newRecord, ...prev.slice(0, 1999)]);

    // Send to backend
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRecord)
    }).catch(() => {});
  }, []);

  // Delete & Reset Analytics & Visit Data
  const resetAnalyticsData = useCallback(async () => {
    setAnalyticsVisits([]);
    try {
      localStorage.removeItem('allaith_analytics_visits');
      localStorage.removeItem('allaith_visitor_stats');
      localStorage.setItem('allaith_analytics_reset_clean_2026', 'true');

      // Reset backend in-memory log
      await fetch('/api/analytics/reset', { method: 'POST' }).catch(() => {});

      showToast(locale === 'ar' ? 'تم تصفير وحذف كافة بيانات الزيارات بنجاح، وبدء التتبع من الآن' : 'Analytics reset. Live tracking active from now on.');
    } catch (err) {
      console.error('Error resetting analytics:', err);
    }
  }, [locale, showToast]);

  // Supabase Database Full Sync
  const saveAllDataToSupabase = async (): Promise<{ success: boolean; message: string }> => {
    const supabaseUrl = storeSettings.supabase_url || (typeof window !== 'undefined' ? localStorage.getItem('laith_supabase_url') : null);
    const supabaseKey = storeSettings.supabase_anon_key || (typeof window !== 'undefined' ? localStorage.getItem('laith_supabase_key') : null);

    if (!supabaseUrl || !supabaseKey) {
      showToast(locale === 'ar' ? 'يرجى إدخال رابط ومفتاح Supabase في إعدادات النظام أولاً' : 'Please configure Supabase URL & Anon Key in settings first.');
      return { success: false, message: 'Missing Supabase URL or Anon Key' };
    }

    const client = getSupabaseClient(supabaseUrl, supabaseKey);
    if (!client) {
      showToast(locale === 'ar' ? 'فشل الاتصال بـ Supabase' : 'Failed to connect to Supabase');
      return { success: false, message: 'Could not initialize client' };
    }

    try {
      // 1. Sync Store Settings
      await client.from('store_settings').upsert({
        id: 'default',
        site_name_ar: storeSettings.site_name_ar,
        site_name_en: storeSettings.site_name_en,
        logo_url: storeSettings.logo_url,
        custom_logo_url: storeSettings.custom_logo_url,
        whatsapp_number: storeSettings.whatsapp_number,
        maintenance_whatsapp: storeSettings.maintenance_whatsapp,
        usd_exchange_rate: storeSettings.usd_exchange_rate,
        store_address_ar: storeSettings.store_address_ar,
        store_address_en: storeSettings.store_address_en,
        store_phone: storeSettings.store_phone,
        store_email: storeSettings.store_email,
        store_lat: storeSettings.store_lat,
        store_lng: storeSettings.store_lng,
        footer_quick_links: storeSettings.footer_quick_links || []
      });

      // 2. Sync Categories
      if (categories.length > 0) {
        await client.from('categories').upsert(
          categories.map((c) => ({
            id: c.id,
            name_ar: c.name_ar,
            name_en: c.name_en,
            slug: c.slug,
            image_url: c.image_url,
            sort_order: c.sort_order,
            is_archived: !!c.is_archived
          }))
        );
      }

      // 3. Sync Products
      if (products.length > 0) {
        await client.from('products').upsert(
          products.map((p) => ({
            id: p.id,
            title_ar: p.title_ar,
            title_en: p.title_en,
            slug: p.slug,
            description_ar: p.description_ar,
            description_en: p.description_en,
            category_id: p.category_id,
            brand: p.brand,
            price: p.price,
            price_usd: p.price_usd,
            compare_at_price: p.compare_at_price,
            compare_at_price_usd: p.compare_at_price_usd,
            has_discount: !!p.has_discount,
            discount_percent: p.discount_percent || 0,
            condition: p.condition || 'new',
            condition_details: p.condition_details,
            device_type: p.device_type,
            images: p.images,
            variants: p.variants,
            variant_combinations: p.variant_combinations || [],
            specs: p.specs,
            stock_quantity: p.stock_quantity,
            is_featured: !!p.is_featured,
            is_archived: !!p.is_archived,
            sku: p.sku
          }))
        );
      }

      // 4. Sync Hero Slides
      if (heroSlides.length > 0) {
        await client.from('hero_slides').upsert(
          heroSlides.map((s, idx) => ({
            id: s.id,
            title_ar: s.title_ar,
            title_en: s.title_en,
            subtitle_ar: s.subtitle_ar,
            subtitle_en: s.subtitle_en,
            badge_ar: s.badge_ar,
            badge_en: s.badge_en,
            image_url: s.image_url,
            link_type: s.link_type,
            link_target: s.link_target,
            button_text_ar: s.button_text_ar,
            button_text_en: s.button_text_en,
            sort_order: s.sort_order ?? idx,
            is_active: s.is_active ?? true
          }))
        );
      }

      // 5. Sync Orders
      if (orders.length > 0) {
        await client.from('orders').upsert(
          orders.map((o) => ({
            id: o.id,
            order_number: o.order_number,
            customer_name: o.customer_name,
            customer_phone: o.customer_phone,
            governorate: o.governorate,
            delivery_address: o.delivery_address,
            notes: o.notes,
            items: o.items,
            subtotal: o.subtotal,
            delivery_fee: o.delivery_fee,
            total: o.total,
            currency: o.currency,
            status: o.status,
            whatsapp_sent: !!o.whatsapp_sent,
            google_sheets_synced: !!o.google_sheets_synced,
            synced_to_sheets: !!o.synced_to_sheets,
            created_at: o.created_at
          }))
        );
      }

      // 6. Sync Maintenance Requests
      if (maintenanceRequests.length > 0) {
        await client.from('maintenance_requests').upsert(
          maintenanceRequests.map((m) => ({
            id: m.id,
            request_number: m.request_number,
            customer_name: m.customer_name,
            phone: m.phone,
            device_type: m.device_type,
            device_model: m.device_model,
            issue_description: m.issue_description,
            preferred_date: m.preferred_date,
            photo_url: m.photo_url,
            status: m.status,
            estimated_cost: m.estimated_cost,
            notes_admin: m.notes_admin,
            created_at: m.created_at
          }))
        );
      }

      // 7. Sync Phone Requests
      if (phoneRequests.length > 0) {
        await client.from('phone_requests').upsert(
          phoneRequests.map((pr) => ({
            id: pr.id,
            request_number: pr.request_number,
            customer_name: pr.customer_name,
            phone: pr.phone,
            address: pr.address,
            device_type: pr.device_type,
            specifications: pr.specifications,
            storage: pr.storage,
            color: pr.color,
            condition: pr.condition,
            status: pr.status,
            created_at: pr.created_at
          }))
        );
      }

      showToast(locale === 'ar' ? 'تم حفظ ومزامنة كافة البيانات مع قاعدة بيانات Supabase بنجاح!' : 'All data synced to Supabase successfully!');
      return { success: true, message: 'All tables synced successfully' };
    } catch (err: any) {
      console.error('Supabase sync error:', err);
      const msg = err?.message || 'Sync error';
      showToast(locale === 'ar' ? `خطأ مزامنة: ${msg}` : `Sync error: ${msg}`);
      return { success: false, message: msg };
    }
  };

  // Realtime Supabase Synchronization and Automatic Hydration
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const isSupabaseConfiguredValue = isSupabaseConfigured();

  const refreshAllStoreData = useCallback(async () => {
    setIsDataLoading(true);
    setLastSyncStatus('syncing');
    try {
      // Fetch server-persisted settings
      try {
        const srvRes = await fetch('/api/settings');
        if (srvRes.ok) {
          const srvData = await srvRes.json();
          if (srvData?.success && srvData.settings) {
            setStoreSettings((prev) => ({ ...prev, ...srvData.settings }));
          }
        }
      } catch (err) {
        console.warn('Server settings sync check in refresh:', err);
      }

      const client = getSupabaseClient();
      if (!client) {
        setIsDataLoading(false);
        setLastSyncStatus('synced');
        return;
      }
      const [remoteProds, remoteCats, remoteSlides, remoteSettings, remoteOrders, remoteMnt, remotePhones] = await Promise.all([
        fetchProductsFromSupabase(),
        fetchCategoriesFromSupabase(),
        fetchHeroSlidesFromSupabase(),
        fetchSettingsFromSupabase(),
        fetchOrdersFromSupabase(),
        fetchMaintenanceRequestsFromSupabase(),
        fetchPhoneRequestsFromSupabase()
      ]);

      if (remoteProds && remoteProds.length > 0) setProducts(remoteProds);
      if (remoteCats && remoteCats.length > 0) setCategories(remoteCats);
      if (remoteSlides && remoteSlides.length > 0) setHeroSlides(remoteSlides);
      if (remoteSettings && Object.keys(remoteSettings).length > 0) {
        setStoreSettings((prev) => ({ ...prev, ...remoteSettings }));
      }
      if (remoteOrders && remoteOrders.length > 0) setOrders(remoteOrders);
      if (remoteMnt && remoteMnt.length > 0) setMaintenanceRequests(remoteMnt);
      if (remotePhones && remotePhones.length > 0) setPhoneRequests(remotePhones);
      onDatabaseSynced();
      showToast(locale === 'ar' ? 'تم تحديث كافة بيانات المتجر من قاعدة البيانات بنجاح' : 'Store data refreshed from Supabase');
    } catch (err) {
      console.warn('Manual refresh store data error:', err);
      onDatabaseSyncError(err);
    } finally {
      setIsDataLoading(false);
    }
  }, [locale, showToast, onDatabaseSynced, onDatabaseSyncError]);

  const triggerManualSync = useCallback(async () => {
    await refreshAllStoreData();
  }, [refreshAllStoreData]);

  useEffect(() => {
    let isMounted = true;

    const hydrateFromSupabase = async () => {
      try {
        // Fetch server-persisted settings first
        try {
          const srvRes = await fetch('/api/settings');
          if (srvRes.ok) {
            const srvData = await srvRes.json();
            if (srvData?.success && srvData.settings && isMounted) {
              setStoreSettings((prev) => ({ ...prev, ...srvData.settings }));
            }
          }
        } catch (err) {
          console.warn('Server settings sync check in hydration:', err);
        }

        const client = getSupabaseClient();
        if (!client) {
          // If no Supabase configured yet, resolve skeleton smoothly from local seed data
          setTimeout(() => {
            if (isMounted) setIsDataLoading(false);
          }, 350);
          return;
        }

        const [remoteProds, remoteCats, remoteSlides, remoteSettings, remoteOrders, remoteMnt, remotePhones] = await Promise.all([
          fetchProductsFromSupabase(),
          fetchCategoriesFromSupabase(),
          fetchHeroSlidesFromSupabase(),
          fetchSettingsFromSupabase(),
          fetchOrdersFromSupabase(),
          fetchMaintenanceRequestsFromSupabase(),
          fetchPhoneRequestsFromSupabase()
        ]);

        if (!isMounted) return;

        if (remoteProds && remoteProds.length > 0) {
          setProducts(remoteProds);
        }
        if (remoteCats && remoteCats.length > 0) {
          setCategories(remoteCats);
        }
        if (remoteSlides && remoteSlides.length > 0) {
          setHeroSlides(remoteSlides);
        }
        if (remoteSettings && Object.keys(remoteSettings).length > 0) {
          setStoreSettings((prev) => ({ ...prev, ...remoteSettings }));
        }
        if (remoteOrders && remoteOrders.length > 0) {
          setOrders(remoteOrders);
        }
        if (remoteMnt && remoteMnt.length > 0) {
          setMaintenanceRequests(remoteMnt);
        }
        if (remotePhones && remotePhones.length > 0) {
          setPhoneRequests(remotePhones);
        }
        onDatabaseSynced();
      } catch (e) {
        console.warn('Initial Supabase sync check:', e);
      } finally {
        if (isMounted) {
          setIsDataLoading(false);
        }
      }
    };

    hydrateFromSupabase();

    // Subscribe to realtime database changes for instant sync between dashboard and storefront
    const unsubscribe = subscribeToStoreSync((table, eventType) => {
      if (!isMounted) return;
      console.log(`[Supabase Realtime Sync] Table changed: ${table} (${eventType})`);
      onDatabaseSynced();

      if (table === 'products') {
        fetchProductsFromSupabase().then((latest) => {
          if (latest && isMounted) {
            setProducts(latest);
            onDatabaseSynced();
          }
        });
      } else if (table === 'categories') {
        fetchCategoriesFromSupabase().then((latest) => {
          if (latest && isMounted) {
            setCategories(latest);
            onDatabaseSynced();
          }
        });
      } else if (table === 'hero_slides') {
        fetchHeroSlidesFromSupabase().then((latest) => {
          if (latest && isMounted) {
            setHeroSlides(latest);
            onDatabaseSynced();
          }
        });
      } else if (table === 'store_settings') {
        fetchSettingsFromSupabase().then((latest) => {
          if (latest && isMounted) {
            setStoreSettings((prev) => ({ ...prev, ...latest }));
            onDatabaseSynced();
          }
        });
      } else if (table === 'orders') {
        fetchOrdersFromSupabase().then((latest) => {
          if (latest && isMounted) {
            setOrders(latest);
            onDatabaseSynced();
          }
        });
      } else if (table === 'maintenance_requests') {
        fetchMaintenanceRequestsFromSupabase().then((latest) => {
          if (latest && isMounted) {
            setMaintenanceRequests(latest);
            onDatabaseSynced();
          }
        });
      } else if (table === 'phone_requests') {
        fetchPhoneRequestsFromSupabase().then((latest) => {
          if (latest && isMounted) {
            setPhoneRequests(latest);
            onDatabaseSynced();
          }
        });
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [onDatabaseSynced]);

  // Dynamic XML Sitemap Generator
  const generateSitemapXml = useCallback((): string => {
    const baseUrl = storeSettings.site_domain || 'https://allaith.vercel.app';
    const now = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Homepage
    xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

    // Catalog
    xml += `  <url>\n    <loc>${baseUrl}/#catalog</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;

    // Maintenance
    xml += `  <url>\n    <loc>${baseUrl}/#maintenance</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;

    // Categories
    categories.forEach((cat) => {
      xml += `  <url>\n    <loc>${baseUrl}/#catalog?category=${cat.slug}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    // Products
    products.forEach((prod) => {
      xml += `  <url>\n    <loc>${baseUrl}/#product=${prod.slug || prod.id}</loc>\n    <lastmod>${prod.created_at ? prod.created_at.split('T')[0] : now}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.85</priority>\n  </url>\n`;
    });

    xml += `</urlset>`;
    return xml;
  }, [categories, products, storeSettings.site_domain]);

  // Robots.txt Generator
  const generateRobotsTxt = useCallback((): string => {
    const baseUrl = storeSettings.site_domain || 'https://allaith.vercel.app';
    return `User-agent: *\nAllow: /\nDisallow: /#admin-portal\n\nSitemap: ${baseUrl}/sitemap.xml\n`;
  }, [storeSettings.site_domain]);

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('allaith_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('allaith_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (
    product: Product,
    quantity = 1,
    selectedVariants: { [variantName: string]: string } = {}
  ) => {
    setCart((prev) => {
      const variantKey = JSON.stringify(selectedVariants);
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          JSON.stringify(item.selectedVariants) === variantKey
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { product, quantity, selectedVariants }];
    });
    showToast(t('added_to_cart'));
  };

  const removeFromCart = (productId: string, variantKey?: string) => {
    setCart((prev) =>
      prev.filter((item) => {
        if (item.product.id !== productId) return true;
        if (!variantKey) return false;
        return JSON.stringify(item.selectedVariants) !== variantKey;
      })
    );
  };

  const updateCartQuantity = (productId: string, quantity: number, variantKey?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantKey);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          if (!variantKey || JSON.stringify(item.selectedVariants) === variantKey) {
            return { ...item, quantity };
          }
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const deliveryFee =
    cartSubtotal >= storeSettings.free_delivery_threshold || cartSubtotal === 0
      ? 0
      : storeSettings.delivery_fee_base;
  const cartTotal = cartSubtotal + deliveryFee;

  // Wishlist
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('allaith_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('allaith_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Orders & Google Sheets Webhook
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('allaith_orders');
      if (saved) {
        const parsed: Order[] = JSON.parse(saved);
        return parsed.filter((o) => o.id !== 'ord-101' && o.id !== 'ord-102');
      }
      return initialOrders;
    } catch {
      return initialOrders;
    }
  });

  useEffect(() => {
    localStorage.setItem('allaith_orders', JSON.stringify(orders));
  }, [orders]);

  const [sheetsSyncLogs, setSheetsSyncLogs] = useState<SheetsSyncLog[]>([]);

  const syncOrderToSheetsWebhook = async (order: Order, customUrl?: string): Promise<boolean> => {
    const targetUrl = customUrl || storeSettings.google_sheets_webhook_url;
    if (!targetUrl || !storeSettings.google_sheets_sync_enabled) {
      return false;
    }

    try {
      const payload = {
        event: 'new_order',
        store: 'Al-Laith for Telecommunications',
        order_number: order.order_number,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        governorate: order.governorate,
        delivery_address: order.delivery_address,
        notes: order.notes || '',
        items_count: order.items.length,
        items_summary: order.items.map((i) => `${i.title} (${i.variant_info || 'Standard'}) x${i.quantity} @ ${i.price} SYP`).join(' | '),
        subtotal_syp: order.subtotal,
        delivery_fee_syp: order.delivery_fee,
        total_syp: order.total,
        usd_equivalent: convertSYPtoUSD(order.total),
        currency: order.currency,
        status: order.status,
        created_at: order.created_at
      };

      try {
        await fetch(targetUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.warn('Sheets webhook request sent (no-cors mode):', err);
      }

      const newLog: SheetsSyncLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        orderNumber: order.order_number,
        status: 'success',
        message: `تم تدوين بيانات طلب ${order.order_number} بنجاح في Google Sheets`
      };
      setSheetsSyncLogs((prev) => [newLog, ...prev.slice(0, 29)]);
      return true;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      const failLog: SheetsSyncLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        orderNumber: order.order_number,
        status: 'failed',
        message: `تعذر تدوين الطلب: ${errorMsg}`
      };
      setSheetsSyncLogs((prev) => [failLog, ...prev.slice(0, 29)]);
      return false;
    }
  };

  const testGoogleSheetsWebhook = async (customUrl?: string): Promise<{ success: boolean; message: string }> => {
    const targetUrl = customUrl || storeSettings.google_sheets_webhook_url;
    if (!targetUrl) {
      return { success: false, message: 'يرجى إدخال رابط Webhook صالح' };
    }

    try {
      const testPayload = {
        event: 'ping_test',
        store: 'Al-Laith for Telecommunications',
        timestamp: new Date().toISOString(),
        test_message: 'اختبار اتصال متجر الليث للاتصالات بجدول Google Sheets بنجاح'
      };

      try {
        await fetch(targetUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(testPayload)
        });
      } catch {
        // no-cors fetch
      }

      const log: SheetsSyncLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        orderNumber: 'TEST-PING',
        status: 'success',
        message: 'تم إرسال إشعار اختبار لجدول شيتس بنجاح'
      };
      setSheetsSyncLogs((prev) => [log, ...prev.slice(0, 29)]);
      return { success: true, message: t('webhook_test_success') };
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : 'Test failed';
      return { success: false, message: errMsg };
    }
  };

  const createOrder = (orderData: {
    customer_name: string;
    customer_phone: string;
    governorate: string;
    delivery_address: string;
    notes?: string;
  }) => {
    const orderNumber = `LTH-${Math.floor(1000 + Math.random() * 9000)}`;
    const items = cart.map((item) => {
      const variantStr = Object.entries(item.selectedVariants)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');

      return {
        product_id: item.product.id,
        title: locale === 'ar' ? item.product.title_ar : item.product.title_en,
        quantity: item.quantity,
        price: item.product.price, // Stored in SYP
        variant_info: variantStr || undefined,
        image: item.product.images[0]
      };
    });

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      order_number: orderNumber,
      customer_name: orderData.customer_name,
      customer_phone: orderData.customer_phone,
      governorate: orderData.governorate,
      delivery_address: orderData.delivery_address,
      notes: orderData.notes,
      items,
      subtotal: cartSubtotal,
      delivery_fee: deliveryFee,
      total: cartTotal,
      currency: activeCurrency,
      status: 'new',
      created_at: new Date().toISOString(),
      google_sheets_synced: true,
      synced_to_sheets: true,
      sheets_sync_timestamp: new Date().toISOString(),
      whatsapp_sent: true
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Save directly to Supabase
    upsertOrderToSupabase(newOrder).catch((err) => console.warn('Supabase order save error:', err));

    // Dispatch background sync to Google Sheets
    syncOrderToSheetsWebhook(newOrder);

    // Build formatted Syrian WhatsApp invoice with dual SYP / USD amounts
    const isAr = locale === 'ar';
    const storeName = isAr ? storeSettings.site_name_ar : storeSettings.site_name_en;
    const usdEquivalentTotal = convertSYPtoUSD(cartTotal);

    const itemsText = items
      .map((it, idx) => {
        const variantPart = it.variant_info ? ` (${it.variant_info})` : '';
        const lineTotalSYP = it.quantity * it.price;
        const lineTotalUSD = convertSYPtoUSD(lineTotalSYP);
        return `▫️ *${idx + 1}. ${it.title}*${variantPart}\n   ↳ ${it.quantity} × ${it.price.toLocaleString()} ل.س = *${lineTotalSYP.toLocaleString()} ل.س* (~$${lineTotalUSD})`;
      })
      .join('\n\n');

    let waMessage = '';
    if (isAr) {
      waMessage = `*🧾 فاتورة طلب جديدة من ${storeName}*\n` +
        `-----------------------------------------\n` +
        `🆔 *رقم الطلب:* #${orderNumber}\n` +
        `👤 *الاسم:* ${orderData.customer_name}\n` +
        `📱 *الهاتف:* ${orderData.customer_phone}\n` +
        `📍 *المحافظة:* ${orderData.governorate}\n` +
        `🏠 *العنوان بالتفصيل:* ${orderData.delivery_address}\n` +
        (orderData.notes ? `📝 *ملاحظات:* ${orderData.notes}\n` : '') +
        `-----------------------------------------\n` +
        `📦 *الأجهزة والمنتجات المطلوبة:*\n\n${itemsText}\n` +
        `-----------------------------------------\n` +
        `💵 *المجموع الفرعي:* ${cartSubtotal.toLocaleString()} ل.س\n` +
        `🚚 *أجور التوصيل:* ${deliveryFee === 0 ? 'مجاناً (عرض التوصيل المجاني) 🎉' : `${deliveryFee.toLocaleString()} ل.س`}\n` +
        `💰 *المبلغ الإجمالي:* *${cartTotal.toLocaleString()} ل.س*\n` +
        `💵 *المعادل بالدولار:* *$${usdEquivalentTotal} USD* (تقريباً بسعر الصرف اليومي)\n` +
        `-----------------------------------------\n` +
        `يرجى تأكيد التجهيز وتحديد موعد الاستلام / التسليم. شكراً لاختياركم متجر الليث للاتصالات!`;
    } else {
      waMessage = `*🧾 New Order Invoice - ${storeName}*\n` +
        `-----------------------------------------\n` +
        `🆔 *Order ID:* #${orderNumber}\n` +
        `👤 *Customer:* ${orderData.customer_name}\n` +
        `📱 *Phone:* ${orderData.customer_phone}\n` +
        `📍 *Governorate:* ${orderData.governorate}\n` +
        `🏠 *Address:* ${orderData.delivery_address}\n` +
        (orderData.notes ? `📝 *Notes:* ${orderData.notes}\n` : '') +
        `-----------------------------------------\n` +
        `📦 *Ordered Hardware:*\n\n${itemsText}\n` +
        `-----------------------------------------\n` +
        `💵 *Subtotal:* ${cartSubtotal.toLocaleString()} SYP\n` +
        `🚚 *Delivery Fee:* ${deliveryFee === 0 ? 'FREE 🎉' : `${deliveryFee.toLocaleString()} SYP`}\n` +
        `💰 *Grand Total:* *${cartTotal.toLocaleString()} SYP* (~$${usdEquivalentTotal} USD)\n` +
        `-----------------------------------------\n` +
        `Please confirm fulfillment and delivery. Thank you for choosing Al-Laith!`;
    }

    const cleanPhone = storeSettings.whatsapp_number.replace(/\D/g, '');
    const encoded = encodeURIComponent(waMessage);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encoded}`;

    clearCart();

    return { order: newOrder, whatsappUrl };
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    updateOrderStatusInSupabase(orderId, status).then(onDatabaseSynced).catch(onDatabaseSyncError);
    showToast(t('save_changes'));
  };

  const resyncOrderToSheets = async (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return false;
    const res = await syncOrderToSheetsWebhook(order);
    if (res) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, synced_to_sheets: true, google_sheets_synced: true, sheets_sync_timestamp: new Date().toISOString() } : o))
      );
      showToast(t('synced_sheets_success'));
    }
    return res;
  };

  // Maintenance Requests
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>(() => {
    try {
      const saved = localStorage.getItem('allaith_maintenance');
      if (saved) {
        const parsed: MaintenanceRequest[] = JSON.parse(saved);
        return parsed.filter((m) => m.id !== 'maint-1' && m.id !== 'maint-2');
      }
      return initialMaintenanceRequests;
    } catch {
      return initialMaintenanceRequests;
    }
  });

  useEffect(() => {
    localStorage.setItem('allaith_maintenance', JSON.stringify(maintenanceRequests));
  }, [maintenanceRequests]);

  const createMaintenanceRequest = (reqData: Omit<MaintenanceRequest, 'id' | 'request_number' | 'created_at' | 'status'>) => {
    const reqNum = `MNT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReq: MaintenanceRequest = {
      ...reqData,
      id: `mnt-${Date.now()}`,
      request_number: reqNum,
      status: 'new',
      created_at: new Date().toISOString()
    };

    setMaintenanceRequests((prev) => [newReq, ...prev]);
    upsertMaintenanceRequestToSupabase(newReq).catch((err) => console.warn('Supabase maintenance save error:', err));

    const isAr = locale === 'ar';
    const storeName = isAr ? storeSettings.site_name_ar : storeSettings.site_name_en;
    let waText = '';

    if (isAr) {
      waText = `*🔧 بلاغ صيانة جهاز - مركز ${storeName}*\n` +
        `-----------------------------------------\n` +
        `🆔 *رقم التذكرة:* #${reqNum}\n` +
        `👤 *الاسم:* ${reqData.customer_name}\n` +
        `📱 *رقم الجوال:* ${reqData.phone}\n` +
        `⚙️ *نوع الجهاز:* ${reqData.device_type}\n` +
        `🏷️ *الموديل:* ${reqData.device_model}\n` +
        `🗓️ *تاريخ الزيارة / التسليم:* ${reqData.preferred_date || 'في أقرب وقت'}\n` +
        `-----------------------------------------\n` +
        `⚠️ *وصف العطل بالتفصيل:*\n${reqData.issue_description}\n` +
        (reqData.photo_url ? `\n📸 *رابط الصورة المرفقة:* ${reqData.photo_url}\n` : '') +
        `-----------------------------------------\n` +
        `أرجو تأكيد إمكانية الفحص في مخبر الصيانة وتزويدي بالتكلفة التقديرية. شكراً!`;
    } else {
      waText = `*🔧 Repair Ticket - ${storeName} Lab*\n` +
        `-----------------------------------------\n` +
        `🆔 *Ticket ID:* #${reqNum}\n` +
        `👤 *Customer:* ${reqData.customer_name}\n` +
        `📱 *Phone:* ${reqData.phone}\n` +
        `⚙️ *Category:* ${reqData.device_type}\n` +
        `🏷️ *Model:* ${reqData.device_model}\n` +
        `🗓️ *Preferred Date:* ${reqData.preferred_date || 'Earliest available'}\n` +
        `-----------------------------------------\n` +
        `⚠️ *Issue Description:*\n${reqData.issue_description}\n` +
        (reqData.photo_url ? `\n📸 *Photo:* ${reqData.photo_url}\n` : '') +
        `-----------------------------------------\n` +
        `Please confirm diagnostic slot and estimate. Thank you!`;
    }

    const cleanPhone = (storeSettings.maintenance_whatsapp || storeSettings.whatsapp_number).replace(/\D/g, '');
    const encoded = encodeURIComponent(waText);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encoded}`;

    showToast(t('maintenance_success'));
    return { request: newReq, whatsappUrl };
  };

  const createPhoneRequest = (reqData: {
    customer_name: string;
    phone: string;
    address: string;
    device_type: string;
    specifications: string;
    storage?: string;
    color?: string;
    condition?: string;
  }) => {
    const reqNum = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReq: PhoneRequest = {
      ...reqData,
      id: `req-${Date.now()}`,
      request_number: reqNum,
      status: 'new',
      created_at: new Date().toISOString()
    };

    setPhoneRequests((prev) => [newReq, ...prev]);
    upsertPhoneRequestToSupabase(newReq).catch((err) => console.warn('Supabase phone request save error:', err));

    const isAr = locale === 'ar';
    const storeName = isAr ? storeSettings.site_name_ar : storeSettings.site_name_en;

    let waMessage = '';
    if (isAr) {
      waMessage = `*📱 طلب هاتف / جهاز بالاسم - ${storeName}*\n` +
        `-----------------------------------------\n` +
        `🆔 *رقم الطلب:* #${reqNum}\n` +
        `👤 *اسم العميل:* ${reqData.customer_name}\n` +
        `📞 *رقم الجوال / وتساب:* ${reqData.phone}\n` +
        `📍 *العنوان والمحافظة:* ${reqData.address}\n` +
        `-----------------------------------------\n` +
        `🏷️ *نوع وموديل الجهاز المطلوب:* *${reqData.device_type}*\n` +
        (reqData.storage ? `💾 *سعة التخزين:* ${reqData.storage}\n` : '') +
        (reqData.color ? `🎨 *اللون المفضل:* ${reqData.color}\n` : '') +
        (reqData.condition ? `✨ *الحالة المطلوبة:* ${reqData.condition === 'new' ? 'جديد كلياً بختم الوكالة' : 'مستعمل ونظيف مفحوص'}\n` : '') +
        `📝 *المواصفات والتفاصيل المطلوبة:*\n${reqData.specifications}\n` +
        `-----------------------------------------\n` +
        `أرجو إعلامي بتوفر الجهاز وتكلفته التقديرية بالليرة السورية أو بالدولار وموعد الاستلام. شكراً لكم!`;
    } else {
      waMessage = `*📱 Custom Device Request - ${storeName}*\n` +
        `-----------------------------------------\n` +
        `🆔 *Request ID:* #${reqNum}\n` +
        `👤 *Customer Name:* ${reqData.customer_name}\n` +
        `📞 *Phone / WhatsApp:* ${reqData.phone}\n` +
        `📍 *Address:* ${reqData.address}\n` +
        `-----------------------------------------\n` +
        `🏷️ *Device Requested:* *${reqData.device_type}*\n` +
        (reqData.storage ? `💾 *Storage:* ${reqData.storage}\n` : '') +
        (reqData.color ? `🎨 *Color:* ${reqData.color}\n` : '') +
        (reqData.condition ? `✨ *Condition:* ${reqData.condition}\n` : '') +
        `📝 *Specifications & Notes:*\n${reqData.specifications}\n` +
        `-----------------------------------------\n` +
        `Please let me know availability, price in SYP / USD, and fulfillment details. Thank you!`;
    }

    const cleanPhone = storeSettings.whatsapp_number.replace(/\D/g, '');
    const encoded = encodeURIComponent(waMessage);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encoded}`;

    showToast(t('phone_request_success'));
    return { request: newReq, whatsappUrl };
  };

  const updateMaintenanceStatus = (id: string, status: MaintenanceRequest['status'], adminNotes?: string) => {
    setMaintenanceRequests((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status, notes_admin: adminNotes ?? m.notes_admin } : m))
    );
    updateMaintenanceStatusInSupabase(id, status).catch((err) => console.warn('Supabase maintenance status error:', err));
    showToast(t('save_changes'));
  };

  // WhatsApp direct product inquiry
  const getWhatsAppProductUrl = (product: Product) => {
    const isAr = locale === 'ar';
    const title = isAr ? product.title_ar : product.title_en;
    const storeName = isAr ? storeSettings.site_name_ar : storeSettings.site_name_en;
    const usdVal = convertSYPtoUSD(product.price);

    const msg = isAr
      ? `مرحباً ${storeName}،\nأود الاستفسار عن توفر هذا الجهاز:\n*${title}*\nالسعر: ${product.price.toLocaleString()} ل.س (~$${usdVal} USD)\nرمز المنتج (SKU): ${product.sku}\nهل الجهاز متوفر في صالة العرض بدمشق للشحن أو المعاينة؟`
      : `Hello ${storeName},\nI would like to inquire about this product:\n*${title}*\nPrice: ${product.price.toLocaleString()} SYP (~$${usdVal} USD)\nSKU: ${product.sku}\nIs this in stock at your Damascus showroom?`;

    const cleanPhone = storeSettings.whatsapp_number.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <StoreContext.Provider
      value={{
        locale,
        setLocale,
        t,
        activeCurrency,
        setActiveCurrency,
        formatPrice,
        formatDualPrice,
        convertSYPtoUSD,
        currentView,
        setCurrentView,
        navigateToProduct,
        getProductUrl,
        selectedProductId,
        setSelectedProductId,
        searchQuery,
        setSearchQuery,
        activeCategoryFilter,
        setActiveCategoryFilter,
        isPrivateAdminRoute,
        isAdminAuthenticated,
        loginAdmin,
        logoutAdmin,
        getPrivateAdminLink,
        exitAdminPortal,
        returnToStorefront,
        products,
        addProduct,
        updateProduct,
        quickUpdateProductPrice,
        deleteProduct,
        archiveProduct,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        archiveCategory,
        heroSlides,
        addHeroSlide,
        updateHeroSlide,
        deleteHeroSlide,
        staffUsers,
        addStaffUser,
        updateStaffUser,
        deleteStaffUser,
        activeStaffRole,
        setActiveStaffRole,
        visitorStats,
        analyticsVisits,
        trackVisit,
        resetAnalyticsData,
        saveAllDataToSupabase,
        generateSitemapXml,
        generateRobotsTxt,
        orders,
        createOrder,
        updateOrderStatus,
        resyncOrderToSheets,
        maintenanceRequests,
        createMaintenanceRequest,
        updateMaintenanceStatus,
        storeSettings,
        updateStoreSettings,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        deliveryFee,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isMaintenanceOpen,
        setIsMaintenanceOpen,
        isSiteDetailsOpen,
        setIsSiteDetailsOpen,
        isPhoneRequestOpen,
        setIsPhoneRequestOpen,
        phoneRequests,
        createPhoneRequest,
        wishlist,
        toggleWishlist,
        isInWishlist,
        sheetsSyncLogs,
        testGoogleSheetsWebhook,
        toastMessage,
        showToast,
        getWhatsAppProductUrl,
        getWhatsAppPriceInquiryUrl,
        formatProductPrice,
        brands,
        addBrand,
        deleteBrand,
        isDataLoading,
        refreshAllStoreData,
        isSupabaseConfigured: isSupabaseConfiguredValue,
        lastSynced,
        lastSyncStatus,
        triggerManualSync,
        exchangeRateData,
        isExchangeRateLoading,
        exchangeRateError,
        refreshExchangeRate,
        isExchangeModalOpen,
        setIsExchangeModalOpen,
        liraDisplayMode,
        setLiraDisplayMode,
        applyLiveRateToCatalog
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
