import React from 'react';
import {
  Menu,
  Globe,
  ExternalLink,
  Shield,
  Bell,
  Search,
  DollarSign,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { DashboardTab } from './DashboardSidebar';
import { StaffRole } from '../../types';

interface DashboardHeaderProps {
  activeTab: DashboardTab;
  setIsOpenMobile: (open: boolean) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  activeTab,
  setIsOpenMobile
}) => {
  const {
    locale,
    setLocale,
    storeSettings,
    exitAdminPortal,
    setIsAdminAuthenticated
  } = useStore();

  const isAr = locale === 'ar';

  const tabTitles: Record<DashboardTab, { ar: string; en: string; desc_ar: string; desc_en: string }> = {
    analytics: {
      ar: 'تحليلات الزوار والأداء الشامل',
      en: 'Visitor Analytics & Overview',
      desc_ar: 'متابعة حية للزيارات، معدل التحويل، ومصادر الحركة',
      desc_en: 'Real-time metrics, conversion rates, and traffic sources'
    },
    orders: {
      ar: 'إدارة الطلبات والشحن',
      en: 'Orders & Fulfillment',
      desc_ar: 'معالجة فواتير الشحن، حالات الطلبات، وتزامن Google Sheets',
      desc_en: 'Manage shipments, print invoices, and sync status'
    },
    products: {
      ar: 'إدارة المنتجات والأسعار السريعة',
      en: 'Products & Fast Pricing',
      desc_ar: 'تعديل الأسعار المباشر، إضافة حتى 5 صور، وتحديد نسب الخصم',
      desc_en: 'Quick inline price editing, 5-image uploads, and discounts'
    },
    categories: {
      ar: 'الفئات والماركات التجارية',
      en: 'Categories & Brands',
      desc_ar: 'تنظيم تصنيفات المتجر وماركات الهواتف والإلكترونيات',
      desc_en: 'Organize catalog categories, brands, and device types'
    },
    content: {
      ar: 'تخصيص الواجهة الرئيسية والبانرات',
      en: 'Homepage Customization & Banners',
      desc_ar: 'تعديل نصوص السلايدر، الإعلانات العلوية، ومعلومات الموقع والخرائط',
      desc_en: 'Update hero slides, promo banners, map coordinates, and store text'
    },
    reports: {
      ar: 'التقارير والإحصائيات المالية',
      en: 'Financial Reports & Sales',
      desc_ar: 'تحليل المبيعات بحسب المحافظات والماركات وصافي الأرباح',
      desc_en: 'Detailed sales breakdown by brand, governorate, and profits'
    },
    google_seo: {
      ar: 'حزمة خدمات Google و Sitemap',
      en: 'Google Suite & XML Sitemap',
      desc_ar: 'ربط Google Analytics, Ads, Search Console وتوليد خريطة الموقع XML',
      desc_en: 'GA4, Ads, Search Console integrations and live XML sitemap'
    },
    settings: {
      ar: 'إعدادات المتجر العامة',
      en: 'Store General Settings',
      desc_ar: 'معلومات التواصل، الواتساب، العملات، وأسعار الصرف اليومية',
      desc_en: 'Store contact, WhatsApp, exchange rates, and delivery rules'
    }
  };

  const currentTabInfo = tabTitles[activeTab];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/90 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        {/* Mobile Toggle Button */}
        <button
          type="button"
          onClick={() => setIsOpenMobile(true)}
          className="p-2 rounded-xl text-stone-600 hover:text-stone-950 hover:bg-stone-100 lg:hidden cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Tab Header Title */}
        <div>
          <h1 className="text-base sm:text-lg font-black text-stone-900 leading-tight">
            {isAr ? currentTabInfo.ar : currentTabInfo.en}
          </h1>
          <p className="hidden sm:block text-[11px] text-stone-500 font-medium">
            {isAr ? currentTabInfo.desc_ar : currentTabInfo.desc_en}
          </p>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live USD Exchange Rate Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{isAr ? 'سعر الصرف اليومي:' : 'Daily USD Rate:'}</span>
          <span className="font-mono font-extrabold">
            {storeSettings.usd_exchange_rate.toLocaleString()} {storeSettings.currency_ar}
          </span>
        </div>

        {/* Master Admin Profile Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-xs">
          <Shield className="w-3.5 h-3.5 text-amber-600" />
          <span className="font-extrabold text-stone-900">
            {storeSettings.admin_username || 'admin'}
          </span>
          <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-md font-bold">
            {isAr ? 'مدير عام' : 'Admin'}
          </span>
        </div>

        {/* Language Switcher */}
        <button
          type="button"
          onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
          title={isAr ? 'تبديل اللغة' : 'Switch Language'}
        >
          <Globe className="w-3.5 h-3.5 text-stone-500" />
          <span>{locale === 'ar' ? 'English' : 'عربي'}</span>
        </button>

        {/* Exit Storefront Button */}
        <button
          type="button"
          onClick={exitAdminPortal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isAr ? 'المتجر' : 'Store'}</span>
        </button>

        {/* Logout Button */}
        <button
          type="button"
          onClick={() => setIsAdminAuthenticated(false)}
          className="p-1.5 rounded-xl bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-rose-600 transition-colors cursor-pointer"
          title={isAr ? 'تسجيل الخروج من لوحة التحكم' : 'Logout'}
        >
          <UserCheck className="w-4 h-4 text-stone-400 hover:text-rose-600" />
        </button>
      </div>
    </header>
  );
};
