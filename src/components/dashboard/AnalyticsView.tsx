import React, { useState, useMemo } from 'react';
import {
  Users,
  Eye,
  ShoppingBag,
  TrendingUp,
  ArrowUpRight,
  Download,
  Calendar,
  Smartphone,
  Laptop,
  Tablet,
  MapPin,
  Flame,
  Search,
  ExternalLink,
  Save,
  CheckCircle2,
  Database,
  Filter,
  RefreshCw,
  FileSpreadsheet,
  Trash2,
  AlertTriangle,
  Radio,
  Compass,
  Store,
  Clock
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import * as XLSX from 'xlsx';

export const AnalyticsView: React.FC = () => {
  const {
    locale,
    analyticsVisits,
    orders,
    products,
    formatPrice,
    storeSettings,
    showToast,
    resetAnalyticsData,
    saveAllDataToSupabase,
    exitAdminPortal
  } = useStore();

  const isAr = locale === 'ar';

  // Timeframe filter: 'today' | '7d' | 'this_month' | 'last_month' | 'custom'
  const [timeFilter, setTimeFilter] = useState<'today' | '7d' | 'this_month' | 'last_month' | 'custom'>('today');
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isSyncingSupabase, setIsSyncingSupabase] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Filter visit records based on selected timeframe
  const filteredVisits = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return analyticsVisits.filter((v) => {
      const vDate = new Date(v.timestamp);

      if (timeFilter === 'today') {
        return vDate >= startOfToday;
      }
      if (timeFilter === '7d') {
        const d7 = new Date();
        d7.setDate(d7.getDate() - 7);
        return vDate >= d7;
      }
      if (timeFilter === 'this_month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return vDate >= startOfMonth;
      }
      if (timeFilter === 'last_month') {
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        return vDate >= startOfLastMonth && vDate <= endOfLastMonth;
      }
      if (timeFilter === 'custom') {
        const start = new Date(customStartDate + 'T00:00:00');
        const end = new Date(customEndDate + 'T23:59:59');
        return vDate >= start && vDate <= end;
      }
      return true;
    });
  }, [analyticsVisits, timeFilter, customStartDate, customEndDate]);

  // Genuine Real-Time Stats (Zero fake multipliers)
  const totalVisitorsCount = useMemo(() => {
    return new Set(filteredVisits.map((v) => v.visitor_id)).size;
  }, [filteredVisits]);

  const totalPageViewsCount = filteredVisits.length;
  const totalOrdersCount = orders.length;
  const totalRevenueSYP = orders.reduce((acc, o) => acc + (o.total || o.subtotal || 0), 0);
  const conversionRate = totalVisitorsCount > 0 ? ((totalOrdersCount / totalVisitorsCount) * 100).toFixed(1) : '0.0';

  // Live active visitors (visited in the last 15 minutes)
  const liveActiveCount = useMemo(() => {
    const fifteenMinAgo = Date.now() - 15 * 60 * 1000;
    const active = new Set(
      analyticsVisits
        .filter((v) => new Date(v.timestamp).getTime() >= fifteenMinAgo)
        .map((v) => v.visitor_id)
    );
    return Math.max(active.size, 1);
  }, [analyticsVisits]);

  // Device Breakdown computed dynamically from real filtered visits
  const deviceStats = useMemo(() => {
    const counts = { mobile: 0, desktop: 0, tablet: 0 };
    filteredVisits.forEach((v) => {
      if (v.device === 'mobile') counts.mobile++;
      else if (v.device === 'tablet') counts.tablet++;
      else counts.desktop++;
    });
    const total = filteredVisits.length;
    return {
      mobile: counts.mobile,
      desktop: counts.desktop,
      tablet: counts.tablet,
      mobilePct: total > 0 ? Math.round((counts.mobile / total) * 100) : 0,
      desktopPct: total > 0 ? Math.round((counts.desktop / total) * 100) : 0,
      tabletPct: total > 0 ? Math.round((counts.tablet / total) * 100) : 0
    };
  }, [filteredVisits]);

  // Top Visited Pages
  const topPages = useMemo(() => {
    const map: Record<string, { path: string; title: string; count: number }> = {};
    filteredVisits.forEach((v) => {
      if (!map[v.path]) {
        map[v.path] = { path: v.path, title: v.page_title || v.path, count: 0 };
      }
      map[v.path].count++;
    });
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [filteredVisits]);

  // Top Traffic Sources / Referrers
  const topReferrers = useMemo(() => {
    const map: Record<string, number> = {};
    filteredVisits.forEach((v) => {
      const ref = v.referrer || 'Direct';
      map[ref] = (map[ref] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [filteredVisits]);

  // Governorate distribution computed from real customer orders
  const governorateStats = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((o) => {
      const g = o.governorate || 'اللاذقية';
      map[g] = (map[g] || 0) + 1;
    });
    const total = orders.length || 1;
    const colors = ['bg-emerald-500', 'bg-indigo-500', 'bg-sky-500', 'bg-amber-500', 'bg-rose-500'];
    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);

    if (entries.length === 0) {
      return [
        { name_ar: 'اللاذقية', name_en: 'Latakia', percentage: 0, count: isAr ? 'لا توجد طلبات بعد' : 'No orders yet', color: 'bg-emerald-500' }
      ];
    }

    return entries.slice(0, 5).map(([name, count], idx) => ({
      name_ar: name,
      name_en: name,
      percentage: Math.round((count / total) * 100),
      count: isAr ? `${count} طلب` : `${count} orders`,
      color: colors[idx % colors.length]
    }));
  }, [orders, isAr]);

  // Export to Excel XLSX
  const exportToExcel = () => {
    if (filteredVisits.length === 0) {
      showToast(isAr ? 'لا توجد بيانات زيارات لتصديرها حالياً' : 'No visits data to export yet');
      return;
    }
    const dataToExport = filteredVisits.map((v, idx) => ({
      '#': idx + 1,
      'Date & Time': new Date(v.timestamp).toLocaleString(),
      'Page URL': v.path,
      'Page Title': v.page_title || 'Store',
      'Device': v.device,
      'Referrer / Source': v.referrer || 'Direct',
      'Visitor ID': v.visitor_id,
      'Duration (sec)': v.duration_seconds || 30
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Visits Data');
    XLSX.writeFile(wb, `Al-Laith-Analytics-${timeFilter}-${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast(isAr ? 'تم تصدير ملف الإكسل (XLSX) بنجاح!' : 'Excel file exported successfully!');
  };

  // Export to CSV
  const exportAnalyticsCsv = () => {
    if (filteredVisits.length === 0) {
      showToast(isAr ? 'لا توجد بيانات زيارات لتصديرها حالياً' : 'No visits data to export yet');
      return;
    }
    let csv = 'ID,Timestamp,Path,PageTitle,Device,Referrer,VisitorID\n';
    filteredVisits.forEach((v) => {
      csv += `"${v.id}","${v.timestamp}","${v.path}","${v.page_title}","${v.device}","${v.referrer}","${v.visitor_id}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `allaith-visits-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/analytics/summary');
      const data = await res.json();
      showToast(
        isAr
          ? `تم تحديث البيانات! إجمالي الزيارات المسجلة في السيرفر: ${data.total_visits}`
          : `Analytics refreshed! Total server visits: ${data.total_visits}`
      );
    } catch {
      showToast(isAr ? 'تم تحديث العرض' : 'Refreshed');
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  const handleExecuteReset = async () => {
    await resetAnalyticsData();
    setShowResetConfirm(false);
  };

  const handleSyncSupabase = async () => {
    setIsSyncingSupabase(true);
    await saveAllDataToSupabase();
    setIsSyncingSupabase(false);
  };

  return (
    <div className="space-y-6 pb-12" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Top Header with Live Indicator, Reset & Sync Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-black text-stone-900">
              {isAr ? 'إحصائيات وزوار متجر الليث (تتبع مباشر)' : 'Live Store Traffic & Analytics'}
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>{isAr ? `${liveActiveCount} متصل الآن` : `${liveActiveCount} online now`}</span>
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {isAr
              ? 'تتبع دقيق وحقيقي للزيارات يبدأ من هذه اللحظة، مع إمكانية التصفير والمزامنة والتصدير'
              : 'Real-time visit tracking active from now on, with full reset, sync, and export'}
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh button */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-50 hover:bg-stone-100 active:scale-95 text-stone-700 text-xs font-bold transition-all border border-stone-200 cursor-pointer disabled:opacity-50"
            title={isAr ? 'تحديث البيانات' : 'Refresh analytics'}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-stone-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isAr ? 'تحديث مباشر' : 'Refresh'}</span>
          </button>

          {/* Sync Supabase */}
          <button
            type="button"
            onClick={handleSyncSupabase}
            disabled={isSyncingSupabase}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-50 hover:bg-stone-100 active:scale-95 text-stone-700 text-xs font-bold transition-all border border-stone-200 cursor-pointer disabled:opacity-50"
            title="Sync with Supabase"
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isSyncingSupabase ? (isAr ? 'جارِ المزامنة...' : 'Syncing...') : (isAr ? 'مزامنة Supabase' : 'Sync')}</span>
          </button>

          {/* Reset & Start Fresh Button */}
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            title={isAr ? 'حذف وتصفير كافة سجلات الزيارات' : 'Delete & reset visit logs'}
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>{isAr ? 'تصفير وسجل زيارات جديد' : 'Reset & Clear Data'}</span>
          </button>

          {/* Test Live Visit */}
          <button
            type="button"
            onClick={exitAdminPortal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold transition-all cursor-pointer shadow-sm shadow-emerald-600/20"
            title={isAr ? 'الانتقال إلى واجهة المتجر لتسجيل زيارات حية' : 'Visit store to test live tracking'}
          >
            <Store className="w-3.5 h-3.5" />
            <span>{isAr ? 'زيارة المتجر لتجربة الرصد' : 'Visit Storefront'}</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-5 border border-stone-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-black text-stone-900">
                  {isAr ? 'تأكيد تصفير وحذف بيانات الزيارات' : 'Confirm Analytics & Visits Reset'}
                </h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  {isAr
                    ? 'سيتم حذف وتصفير كافة سجلات الزيارات والمشاهدات السابقة بالكامل، وسيبدأ النظام برصد وتسجيل الزيارات الحقيقية للمتجر من الصفر ابتداءً من هذه اللحظة.'
                    : 'All previous visit logs and impression counts will be permanently erased. Tracking will restart clean from zero from this moment onward.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleExecuteReset}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm shadow-rose-600/20"
              >
                {isAr ? 'نعم، تصفير والبدء من الآن' : 'Yes, Reset to Zero'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timeframe Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-100 rounded-xl border border-stone-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setTimeFilter('today')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              timeFilter === 'today' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {isAr ? 'اليوم' : 'Today'}
          </button>
          <button
            type="button"
            onClick={() => setTimeFilter('7d')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              timeFilter === '7d' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {isAr ? 'آخر 7 أيام' : 'Last 7 Days'}
          </button>
          <button
            type="button"
            onClick={() => setTimeFilter('this_month')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              timeFilter === 'this_month' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {isAr ? 'هذا الشهر' : 'This Month'}
          </button>
          <button
            type="button"
            onClick={() => setTimeFilter('last_month')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              timeFilter === 'last_month' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {isAr ? 'الشهر الماضي' : 'Last Month'}
          </button>
          <button
            type="button"
            onClick={() => setTimeFilter('custom')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              timeFilter === 'custom' ? 'bg-amber-500 text-stone-950 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{isAr ? 'فترة مخصصة' : 'Custom'}</span>
          </button>
        </div>

        {/* Custom Date Pickers */}
        {timeFilter === 'custom' && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-stone-500 font-semibold">{isAr ? 'من:' : 'From:'}</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1 text-xs text-stone-800 outline-none"
            />
            <span className="text-stone-500 font-semibold">{isAr ? 'إلى:' : 'To:'}</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1 text-xs text-stone-800 outline-none"
            />
          </div>
        )}

        {/* Export Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportToExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-emerald-800 bg-emerald-50 text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isAr ? 'تصدير Excel (XLSX)' : 'Export Excel'}</span>
          </button>

          <button
            type="button"
            onClick={exportAnalyticsCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid (Accurate Real-Time Values) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Visitors */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">
              {isAr ? 'الزوار الفريدون' : 'Unique Visitors'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-stone-900 font-mono">
              {totalVisitorsCount.toLocaleString()}
            </span>
            <span className="text-[11px] font-bold text-stone-500">
              {isAr ? 'زائر' : 'visitors'}
            </span>
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">
            {isAr ? 'بناءً على المعرفات الحقيقية المسجلة' : 'Based on real recorded IDs'}
          </span>
        </div>

        {/* Page Views */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">
              {isAr ? 'مشاهدات الصفحات' : 'Page Views'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-stone-900 font-mono">
              {totalPageViewsCount.toLocaleString()}
            </span>
            <span className="text-[11px] font-bold text-stone-500">
              {isAr ? 'مشاهدة' : 'views'}
            </span>
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">
            {isAr ? 'تصفح الصفحات والأجهزة والكتالوج' : 'Catalog & PDP impressions'}
          </span>
        </div>

        {/* Orders */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">
              {isAr ? 'طلبات الشراء' : 'Total Orders'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-stone-900 font-mono">
              {totalOrdersCount}
            </span>
            <span className="text-[11px] font-bold text-stone-500">
              {isAr ? 'طلب' : 'orders'}
            </span>
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">
            {isAr ? 'طلبات مؤكدة ومسجلة في النظام' : 'Confirmed sales orders in store'}
          </span>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">
              {isAr ? 'معدل التحويل الحقيقي' : 'Real Conversion Rate'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-stone-900 font-mono">
              {conversionRate}%
            </span>
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">
            {isAr ? 'نسبة الزوار الذين أتموا طلب شراء' : 'Percentage of visitors who ordered'}
          </span>
        </div>
      </div>

      {/* Real-time Detailed Visit Log Table */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-stone-900">
                {isAr ? 'سجل الزيارات المباشر والدائم' : 'Live & Permanent Visit Activity Log'}
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {isAr ? 'تتبع نشط' : 'Tracking Active'}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              {filteredVisits.length > 0
                ? (isAr
                  ? `عرض ${filteredVisits.length} زيارة مسجلة ومحفوظة ضمن الفترة المحددة`
                  : `Showing ${filteredVisits.length} recorded visits for current filter`)
                : (isAr
                  ? 'تم تصفير البيانات بنجاح • سيتم تسجيل أي زيارة جديدة فور تصفح الموقع'
                  : 'Data reset successfully • New visits will appear immediately')}
            </p>
          </div>
          <div className="text-xs text-stone-400 font-mono">
            {isAr ? 'تخزين دائم في الذاكرة والمتصفح والسيرفر' : 'Permanent local & server logging'}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200/60">
              <tr>
                <th className="py-3 px-4 text-start">{isAr ? 'الوقت والتاريخ' : 'Timestamp'}</th>
                <th className="py-3 px-4 text-start">{isAr ? 'المسار / الصفحة' : 'Path'}</th>
                <th className="py-3 px-4 text-start">{isAr ? 'عنوان الصفحة' : 'Page Title'}</th>
                <th className="py-3 px-4 text-start">{isAr ? 'الجهاز' : 'Device'}</th>
                <th className="py-3 px-4 text-start">{isAr ? 'المصدر' : 'Referrer'}</th>
                <th className="py-3 px-4 text-start">{isAr ? 'معرف الزائر' : 'Visitor ID'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {filteredVisits.slice(0, 20).map((visit) => (
                <tr key={visit.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-2.5 px-4 font-mono text-stone-600 whitespace-nowrap">
                    {new Date(visit.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}{' '}
                    <span className="text-[10px] text-stone-400">
                      {new Date(visit.timestamp).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-emerald-700 font-bold whitespace-nowrap">
                    {visit.path}
                  </td>
                  <td className="py-2.5 px-4 text-stone-800 whitespace-nowrap max-w-[220px] truncate">
                    {visit.page_title || 'Al-Laith Telecom'}
                  </td>
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[11px]">
                      {visit.device === 'mobile' && <Smartphone className="w-3 h-3 text-amber-600" />}
                      {visit.device === 'desktop' && <Laptop className="w-3 h-3 text-blue-600" />}
                      {visit.device === 'tablet' && <Tablet className="w-3 h-3 text-purple-600" />}
                      <span>{visit.device}</span>
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-stone-600 whitespace-nowrap">
                    {visit.referrer || 'Direct'}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-stone-500 text-[11px] whitespace-nowrap">
                    {visit.visitor_id}
                  </td>
                </tr>
              ))}
              {filteredVisits.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200">
                        <Radio className="w-6 h-6 animate-pulse" />
                      </div>
                      <h4 className="text-sm font-bold text-stone-800">
                        {isAr ? 'تم تصفير سجلات الزيارات بنجاح' : 'Visits Data Reset Successfully'}
                      </h4>
                      <p className="text-xs text-stone-500 leading-relaxed">
                        {isAr
                          ? 'نظام التتبع المباشر نشط الآن: في اللحظة التي يدخل فيها أي زائر إلى المتجر أو يتصفح المنتجات والأقسام، سيتم تسجيل زيارته وتحديث هذا الجدول تلقائياً.'
                          : 'Live tracking is now active. As soon as visitors browse the store, their visits, devices, and paths will be captured in real time right here.'}
                      </p>
                      <button
                        type="button"
                        onClick={exitAdminPortal}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                      >
                        <Store className="w-3.5 h-3.5" />
                        <span>{isAr ? 'تصفح المتجر الآن لتسجيل زيارة تجريبية' : 'Open Storefront to Trigger a Live Visit'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Visited Pages & Traffic Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Visited Pages */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-600" />
              <span>{isAr ? 'أكثر الصفحات والمسارات زيارة' : 'Top Visited Pages'}</span>
            </h3>
            <span className="text-xs text-stone-400 font-mono">
              {topPages.length} {isAr ? 'صفحات نشطة' : 'active paths'}
            </span>
          </div>

          <div className="space-y-2.5">
            {topPages.map((page, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 h-5 rounded-md bg-stone-200 text-stone-700 font-mono font-bold flex items-center justify-center text-[10px] shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-mono font-bold text-emerald-800 truncate">{page.path}</p>
                    <p className="text-[11px] text-stone-500 truncate">{page.title}</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-stone-900 px-2 py-0.5 rounded-md bg-white border border-stone-200 text-xs shrink-0">
                  {page.count} {isAr ? 'مشاهدة' : 'views'}
                </span>
              </div>
            ))}
            {topPages.length === 0 && (
              <div className="py-8 text-center text-xs text-stone-400">
                {isAr ? 'سيتم تصنيف الصفحات الأكثر زيارة فور بدء تصفح المتجر' : 'Top visited pages will appear as visitors browse'}
              </div>
            )}
          </div>
        </div>

        {/* Traffic Sources / Referrers */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-emerald-600" />
              <span>{isAr ? 'مصادر الزيارات والإحالات (Referrers)' : 'Traffic Sources & Referrers'}</span>
            </h3>
            <span className="text-xs text-stone-400 font-mono">
              {topReferrers.length} {isAr ? 'مصادر' : 'sources'}
            </span>
          </div>

          <div className="space-y-2.5">
            {topReferrers.map(([ref, count], idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-bold text-stone-800">{ref}</span>
                </div>
                <span className="font-mono font-bold text-stone-900 px-2 py-0.5 rounded-md bg-white border border-stone-200 text-xs">
                  {count} {isAr ? 'زيارة' : 'visits'}
                </span>
              </div>
            ))}
            {topReferrers.length === 0 && (
              <div className="py-8 text-center text-xs text-stone-400">
                {isAr ? 'سيتم تسجيل مصادر الزيارات (مباشر، محركات بحث، تواصل اجتماعي) فور بدء الزيارات' : 'Traffic sources will be recorded as visitors arrive'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Governorate Distribution & Device Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Governorates from actual orders */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>{isAr ? 'التوزيع الجغرافي للمبيعات والطلبات بالمحافظات' : 'Order Distribution by Syrian Governorate'}</span>
            </h3>
            <span className="text-xs text-stone-500 font-bold">
              {orders.length} {isAr ? 'طلب مسجل' : 'total orders'}
            </span>
          </div>

          <div className="space-y-3">
            {governorateStats.map((gov, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                  <span>{isAr ? gov.name_ar : gov.name_en}</span>
                  <span className="font-mono text-stone-900">{gov.percentage}%</span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${gov.color} rounded-full transition-all duration-500`}
                    style={{ width: `${gov.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Devices Breakdown (Actual Real Visits Breakdown) */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-amber-500" />
              <span>{isAr ? 'توزيع الأجهزة المستخدمة للتسوق' : 'Device Breakdown'}</span>
            </h3>
            <span className="text-xs text-stone-500 font-mono">
              {filteredVisits.length} {isAr ? 'زيارة مفحوصة' : 'tracked visits'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/60 text-center">
              <Smartphone className="w-6 h-6 text-amber-600 mx-auto mb-1.5" />
              <div className="text-lg font-black text-stone-900 font-mono">
                {deviceStats.mobilePct}%
              </div>
              <div className="text-[11px] font-bold text-stone-600">{isAr ? 'هواتف ذكية' : 'Mobile'}</div>
              <div className="text-[10px] text-stone-400 font-mono mt-0.5">({deviceStats.mobile})</div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/60 text-center">
              <Laptop className="w-6 h-6 text-blue-600 mx-auto mb-1.5" />
              <div className="text-lg font-black text-stone-900 font-mono">
                {deviceStats.desktopPct}%
              </div>
              <div className="text-[11px] font-bold text-stone-600">{isAr ? 'أجهزة حاسوب' : 'Desktop'}</div>
              <div className="text-[10px] text-stone-400 font-mono mt-0.5">({deviceStats.desktop})</div>
            </div>

            <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200/60 text-center">
              <Tablet className="w-6 h-6 text-purple-600 mx-auto mb-1.5" />
              <div className="text-lg font-black text-stone-900 font-mono">
                {deviceStats.tabletPct}%
              </div>
              <div className="text-[11px] font-bold text-stone-600">{isAr ? 'أجهزة لوحية' : 'Tablets'}</div>
              <div className="text-[10px] text-stone-400 font-mono mt-0.5">({deviceStats.tablet})</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
