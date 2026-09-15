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
  LiraDisplayMode
} from '../types';
import { fetchLiveDollarRate, DEFAULT_FALLBACK_RATE } from '../utils/exchangeRateClient';
import { translations } from '../locales/translations';
import {
  initialCategories,
  initialProducts,
  initialStoreSettings,
  initialOrders,
  initialMaintenanceRequests,
  initialBrands,
  initialPhoneRequests
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
  refreshExchangeRate: () => Promise<void>;
  isExchangeModalOpen: boolean;
  setIsExchangeModalOpen: (open: boolean) => void;
  liraDisplayMode: LiraDisplayMode;
  setLiraDisplayMode: (mode: LiraDisplayMode) => void;
  applyLiveRateToCatalog: () => void;
  
  // Navigation & Views
  currentView: 'home' | 'catalog' | 'pdp' | 'admin';
  setCurrentView: (view: 'home' | 'catalog' | 'pdp' | 'admin') => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategoryFilter: string | null;
  setActiveCategoryFilter: (catId: string | null) => void;
  
  // Private Admin Portal Navigation
  isPrivateAdminRoute: boolean;
  getPrivateAdminLink: () => string;
  exitAdminPortal: () => void;
  
  // Data
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'created_at'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  categories: Category[];
  updateCategory: (id: string, data: Partial<Category>) => void;
  
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
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  // Private Admin Route Detection via URL Hash or Query
  // Admin is fully separated from public navigation and accessible via dedicated private link (e.g. #admin-portal or ?admin=laith)
  const checkIsAdminHash = () => {
    if (typeof window === 'undefined') return false;
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    return hash === '#admin-portal' || hash === '#admin' || search.includes('portal=admin') || search.includes('admin=laith');
  };

  const [isPrivateAdminRoute, setIsPrivateAdminRoute] = useState<boolean>(checkIsAdminHash);
  const [currentView, setCurrentViewState] = useState<'home' | 'catalog' | 'pdp' | 'admin'>(() => {
    return checkIsAdminHash() ? 'admin' : 'home';
  });

  // Listen to hash changes so direct navigation to #admin-portal works immediately
  useEffect(() => {
    const handleHashChange = () => {
      if (checkIsAdminHash()) {
        setIsPrivateAdminRoute(true);
        setCurrentViewState('admin');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const setCurrentView = (view: 'home' | 'catalog' | 'pdp' | 'admin') => {
    if (view === 'admin') {
      window.location.hash = 'admin-portal';
      setIsPrivateAdminRoute(true);
    }
    setCurrentViewState(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const exitAdminPortal = () => {
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    setIsPrivateAdminRoute(false);
    setCurrentViewState('home');
  };

  const getPrivateAdminLink = () => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}${window.location.pathname}#admin-portal`;
  };

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);

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
      return saved ? JSON.parse(saved) : initialPhoneRequests;
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
        // Ensure the official logo is always favored over old generic svg placeholders
        if (!parsed.logo_url || parsed.logo_url.includes('TELECOM') || parsed.logo_url.includes('EXPRESS STORE') || parsed.logo_url.startsWith('data:image/svg')) {
          parsed.logo_url = '/al-laith-logo-horizontal.svg';
        }
        // Ensure new contact number and Latakia store address override old mock data
        if (!parsed.whatsapp_number || parsed.whatsapp_number === '+963933123456') {
          parsed.whatsapp_number = initialStoreSettings.whatsapp_number;
          parsed.maintenance_whatsapp = initialStoreSettings.maintenance_whatsapp;
          parsed.store_phone = initialStoreSettings.store_phone;
        }
        if (!parsed.store_address_ar || parsed.store_address_ar.includes('دمشق') || parsed.store_address_ar.includes('الثورة')) {
          parsed.store_address_ar = initialStoreSettings.store_address_ar;
          parsed.store_address_en = initialStoreSettings.store_address_en;
          parsed.announcement_ar = initialStoreSettings.announcement_ar;
          parsed.announcement_en = initialStoreSettings.announcement_en;
        }
        parsed.store_lat = initialStoreSettings.store_lat;
        parsed.store_lng = initialStoreSettings.store_lng;
        parsed.google_maps_url = initialStoreSettings.google_maps_url;
        return { ...initialStoreSettings, ...parsed };
      }
      return initialStoreSettings;
    } catch {
      return initialStoreSettings;
    }
  });

  useEffect(() => {
    localStorage.setItem('allaith_settings', JSON.stringify(storeSettings));
  }, [storeSettings]);

  const updateStoreSettings = (data: Partial<StoreSettings>) => {
    setStoreSettings((prev) => ({ ...prev, ...data }));
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

  const refreshExchangeRate = useCallback(async () => {
    setIsExchangeRateLoading(true);
    setExchangeRateError(null);
    try {
      const data = await fetchLiveDollarRate();
      setExchangeRateData(data);
      if (data && data.old_lira && data.old_lira.sell > 0) {
        setStoreSettings((prev) => ({
          ...prev,
          usd_exchange_rate: data.old_lira.sell
        }));
      }
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

  const addProduct = (prodData: Omit<Product, 'id' | 'created_at'>) => {
    const newProduct: Product = {
      ...prodData,
      id: `prod-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    setProducts((prev) => [newProduct, ...prev]);
    showToast(t('product_saved'));
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
    showToast(t('product_saved'));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast(t('product_deleted'));
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

  const updateCategory = (id: string, data: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c))
    );
  };

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
      return saved ? JSON.parse(saved) : initialOrders;
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
      return saved ? JSON.parse(saved) : initialMaintenanceRequests;
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
        selectedProductId,
        setSelectedProductId,
        searchQuery,
        setSearchQuery,
        activeCategoryFilter,
        setActiveCategoryFilter,
        isPrivateAdminRoute,
        getPrivateAdminLink,
        exitAdminPortal,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        categories,
        updateCategory,
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
