import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  DollarSign,
  TrendingUp,
  Package,
  ShoppingBag,
  ArrowUpRight,
  PieChart,
  Filter
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const ReportsView: React.FC = () => {
  const {
    locale,
    orders,
    products,
    formatPrice,
    storeSettings
  } = useStore();

  const isAr = locale === 'ar';
  const [reportPeriod, setReportPeriod] = useState<'this_month' | 'last_month' | 'year'>('this_month');

  // Financial calculations
  const totalSalesSYP = orders.reduce((acc, o) => acc + (o.total || 0), 0);
  const totalItemsSold = orders.reduce((acc, o) => acc + o.items.reduce((s, it) => s + it.quantity, 0), 0);
  const avgOrderValueSYP = orders.length > 0 ? Math.round(totalSalesSYP / orders.length) : 0;
  const estimatedProfitSYP = Math.round(totalSalesSYP * 0.18); // 18% net margin estimate

  // Brand sales distribution
  const brandSales: Record<string, { count: number; total_syp: number }> = {};
  orders.forEach((order) => {
    order.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.product_id);
      const b = prod?.brand || 'Apple';
      if (!brandSales[b]) {
        brandSales[b] = { count: 0, total_syp: 0 };
      }
      brandSales[b].count += item.quantity;
      brandSales[b].total_syp += item.price * item.quantity;
    });
  });

  const brandSalesList = Object.entries(brandSales).sort((a, b) => b[1].total_syp - a[1].total_syp);

  // Export Financial CSV
  const handleExportFinancialCsv = () => {
    let csv = 'Report_Period,Total_Sales_SYP,Total_Orders,Total_Items,Avg_Order_Value_SYP,Estimated_Net_Profit_SYP\n';
    csv += `"${reportPeriod}",${totalSalesSYP},${orders.length},${totalItemsSold},${avgOrderValueSYP},${estimatedProfitSYP}\n\n`;
    csv += 'Brand,Items_Sold,Gross_Sales_SYP\n';
    brandSalesList.forEach(([brand, data]) => {
      csv += `"${brand}",${data.count},${data.total_syp}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `allaith-financial-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Financial Summary
  const handlePrintFinancialSummary = () => {
    const printWin = window.open('', '_blank');
    if (!printWin) return;

    printWin.document.write(`
      <html dir="rtl" lang="ar">
        <head>
          <title>التقرير المالي والإحصائي - متجر الليث للاتصالات</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 30px; color: #1c1917; }
            h1 { color: #047857; margin-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
            th, td { border: 1px solid #e7e5e4; padding: 10px; text-align: right; }
            th { background-color: #f5f5f4; }
            .kpi-box { display: flex; gap: 20px; margin: 20px 0; }
            .kpi-card { flex: 1; padding: 16px; background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 8px; }
          </style>
        </head>
        <body>
          <h1>متجر الليث للاتصالات - التقرير المالي والإحصائي</h1>
          <p>تاريخ الإصدار: ${new Date().toLocaleDateString('ar-SY')} | المقر: ${storeSettings.store_address_ar}</p>

          <div class="kpi-box">
            <div class="kpi-card">
              <h4>إجمالي المبيعات</h4>
              <h2>${totalSalesSYP.toLocaleString()} ل.س</h2>
            </div>
            <div class="kpi-card">
              <h4>عدد الطلبات</h4>
              <h2>${orders.length} طلب</h2>
            </div>
            <div class="kpi-card">
              <h4>القطع المباعة</h4>
              <h2>${totalItemsSold} جهاز</h2>
            </div>
            <div class="kpi-card">
              <h4>صافي الربح التقديري</h4>
              <h2>${estimatedProfitSYP.toLocaleString()} ل.س</h2>
            </div>
          </div>

          <h3>مبيعات الماركات التجارية</h3>
          <table>
            <thead>
              <tr>
                <th>الماركة</th>
                <th>عدد الأجهزة المباعة</th>
                <th>إجمالي المبيعات (ل.س)</th>
              </tr>
            </thead>
            <tbody>
              ${brandSalesList
                .map(
                  ([b, d]) => `
                <tr>
                  <td>${b}</td>
                  <td>${d.count}</td>
                  <td>${d.total_syp.toLocaleString()} ل.س</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <span>{isAr ? 'التقارير والإحصائيات المالية المتقدمة' : 'Financial Reports & Statistical Analysis'}</span>
          </h2>
          <p className="text-xs text-stone-500 font-medium">
            {isAr
              ? 'توليد كشوفات الحسابات، مبيعات الماركات، ومعدل قيمة السلة الشرائية'
              : 'Generate business statements, sales velocity, margins, and basket metrics'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrintFinancialSummary}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isAr ? 'طباعة التقرير' : 'Print Statement'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportFinancialCsv}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isAr ? 'تصدير التقرير المالي (CSV)' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <span className="text-xs font-bold text-stone-500 block">
            {isAr ? 'إجمالي الإيرادات الإجمالية' : 'Gross Sales Revenue'}
          </span>
          <div className="mt-2 text-xl font-black text-stone-900 font-mono">
            {formatPrice(totalSalesSYP)}
          </div>
          <span className="text-[11px] text-stone-400 font-mono mt-1 block">
            ~${Math.round(totalSalesSYP / (storeSettings.usd_exchange_rate || 15000)).toLocaleString()} USD
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <span className="text-xs font-bold text-stone-500 block">
            {isAr ? 'متوسط قيمة الطلب (AOV)' : 'Average Order Value'}
          </span>
          <div className="mt-2 text-xl font-black text-stone-900 font-mono">
            {formatPrice(avgOrderValueSYP)}
          </div>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 block">
            {isAr ? 'سلة متوازنة' : 'Healthy basket'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <span className="text-xs font-bold text-stone-500 block">
            {isAr ? 'إجمالي الأجهزة المباعة' : 'Units Sold'}
          </span>
          <div className="mt-2 text-xl font-black text-stone-900 font-mono">
            {totalItemsSold} {isAr ? 'جهاز' : 'units'}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">
            {isAr ? 'من مختلف الأصناف والماركات' : 'Across all device models'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <span className="text-xs font-bold text-stone-500 block">
            {isAr ? 'هامش الربح التشغيلي التقديري' : 'Estimated Net Margin'}
          </span>
          <div className="mt-2 text-xl font-black text-emerald-700 font-mono">
            {formatPrice(estimatedProfitSYP)}
          </div>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 block">
            ~18% {isAr ? 'نسبة الهامش التجاري' : 'operating margin'}
          </span>
        </div>
      </div>

      {/* Sales Velocity by Brand */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
        <h3 className="text-base font-black text-stone-900">
          {isAr ? 'توزيع المبيعات بحسب الشركات والماركات المصنعة' : 'Sales Distribution by Brand'}
        </h3>

        <div className="space-y-3">
          {brandSalesList.map(([brand, data]) => {
            const pct = totalSalesSYP > 0 ? Math.round((data.total_syp / totalSalesSYP) * 100) : 0;
            return (
              <div key={brand} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-stone-900">{brand}</span>
                    <span className="text-stone-400 font-mono">({data.count} جهاز)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-stone-800">{formatPrice(data.total_syp)}</span>
                    <span className="font-mono font-black text-emerald-600">{pct}%</span>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(pct, 4)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
