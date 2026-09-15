import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Palette,
  BarChart3,
  Search,
  Users,
  Database,
  Settings,
  Eye,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { StaffRole } from '../../types';

export type DashboardTab =
  | 'analytics'
  | 'orders'
  | 'products'
  | 'categories'
  | 'content'
  | 'reports'
  | 'google_seo'
  | 'supabase'
  | 'settings';

interface DashboardSidebarProps {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  setIsOpenMobile
}) => {
  const {
    locale,
    storeSettings,
    exitAdminPortal,
    orders,
    products,
    activeStaffRole
  } = useStore();

  const isAr = locale === 'ar';
  const newOrdersCount = orders.filter((o) => o.status === 'new').length;

  const navItems: {
    id: DashboardTab;
    label_ar: string;
    label_en: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeColor?: string;
    requiredPermission?: 'canManageProducts' | 'canManageOrders' | 'canManageSettings' | 'canViewAnalytics' | 'canManageContent' | 'canManageUsers';
  }[] = [
    {
      id: 'analytics',
      label_ar: 'التحليلات والزيارات',
      label_en: 'Visitor Analytics',
      icon: LayoutDashboard,
      requiredPermission: 'canViewAnalytics'
    },
    {
      id: 'orders',
      label_ar: 'الطلبات والشحن',
      label_en: 'Orders & Shipping',
      icon: ShoppingBag,
      badge: newOrdersCount > 0 ? newOrdersCount : undefined,
      badgeColor: 'bg-amber-500 text-stone-950 font-bold',
      requiredPermission: 'canManageOrders'
    },
    {
      id: 'products',
      label_ar: 'المنتجات والأسعار',
      label_en: 'Products & Pricing',
      icon: Package,
      badge: products.length,
      badgeColor: 'bg-stone-800 text-stone-300',
      requiredPermission: 'canManageProducts'
    },
    {
      id: 'categories',
      label_ar: 'الفئات والماركات',
      label_en: 'Categories & Brands',
      icon: Layers,
      requiredPermission: 'canManageProducts'
    },
    {
      id: 'content',
      label_ar: 'تخصيص الواجهة والبانرات',
      label_en: 'Homepage & Banners',
      icon: Palette,
      requiredPermission: 'canManageContent'
    },
    {
      id: 'reports',
      label_ar: 'التقارير المالية',
      label_en: 'Financial Reports',
      icon: BarChart3,
      requiredPermission: 'canViewAnalytics'
    },
    {
      id: 'google_seo',
      label_ar: 'خدمات Google و Sitemap',
      label_en: 'Google Suite & SEO',
      icon: Search,
      requiredPermission: 'canManageSettings'
    },
    {
      id: 'supabase',
      label_ar: 'قاعدة بيانات Supabase',
      label_en: 'Supabase Cloud DB',
      icon: Database,
      requiredPermission: 'canManageSettings'
    },
    {
      id: 'settings',
      label_ar: 'إعدادات المتجر',
      label_en: 'Store Settings',
      icon: Settings,
      requiredPermission: 'canManageSettings'
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 bg-stone-950/60 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar Container - Shopify Polaris Dark Theme */}
      <aside
        className={`fixed top-0 bottom-0 z-50 w-72 bg-[#121619] text-stone-300 border-r rtl:border-r-0 rtl:border-l border-stone-800 flex flex-col transition-transform duration-300 ease-in-out ${
          isAr ? 'right-0' : 'left-0'
        } ${
          isOpenMobile
            ? 'translate-x-0'
            : isAr
            ? 'translate-x-full lg:translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-stone-800/80 bg-[#0d1012]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-black text-lg flex items-center justify-center shadow-md">
              ل
            </div>
            <div>
              <span className="font-extrabold text-white text-sm block tracking-tight leading-tight">
                {isAr ? storeSettings.site_name_ar : storeSettings.site_name_en}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {isAr ? 'لوحة تحكم متجر الليث' : 'Al-Laith Admin Suite'}
              </span>
            </div>
          </div>
        </div>

        {/* Live Visitor Status Banner */}
        <div className="mx-3 mt-3 p-2.5 rounded-xl bg-stone-900/90 border border-stone-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-stone-300 text-[11px] font-semibold">
              {isAr ? 'الزوار الآن' : 'Live Visitors'}:
            </span>
          </div>
          <span className="font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-md text-[11px] border border-emerald-800/50">
            {isAr ? '18 متصل' : '18 online'}
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 scrollbar-thin">
          <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-stone-500">
            {isAr ? 'القائمة الرئيسية' : 'Main Menu'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpenMobile(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all group ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50 font-extrabold'
                    : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-stone-400 group-hover:text-emerald-400'
                    }`}
                  />
                  <span>{isAr ? item.label_ar : item.label_en}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] ${
                      item.badgeColor || (isActive ? 'bg-emerald-700 text-white' : 'bg-stone-800 text-stone-400')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Storefront Link & Exit Footer */}
        <div className="p-3 border-t border-stone-800/80 bg-[#0d1012] space-y-2">
          <button
            type="button"
            onClick={exitAdminPortal}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-colors border border-stone-700/60 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isAr ? 'عرض واجهة المتجر للعملاء' : 'View Storefront'}</span>
          </button>

          <div className="flex items-center justify-between px-2 pt-1 text-[11px] text-stone-500">
            <span className="font-mono">https://allaith.vercel.app</span>
            <span className="text-emerald-500 font-bold">Online</span>
          </div>
        </div>
      </aside>
    </>
  );
};
