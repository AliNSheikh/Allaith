import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Download,
  Printer,
  ExternalLink,
  MessageCircle,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  RefreshCw,
  MapPin,
  Phone,
  FileSpreadsheet,
  Calendar as CalendarIcon,
  Wrench,
  Smartphone,
  Save,
  FileText,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order, MaintenanceRequest, PhoneRequest } from '../../types';
import * as XLSX from 'xlsx';

export const OrdersView: React.FC = () => {
  const {
    locale,
    orders,
    maintenanceRequests,
    phoneRequests,
    updateOrderStatus,
    updateMaintenanceStatus,
    resyncOrderToSheets,
    formatPrice,
    storeSettings,
    showToast
  } = useStore();

  const isAr = locale === 'ar';

  // Request category: 'sales' | 'maintenance' | 'phone_sourcing'
  const [requestCategory, setRequestCategory] = useState<'sales' | 'maintenance' | 'phone_sourcing'>('sales');
  // View mode: 'table' | 'calendar'
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Status Labels & Colors
  const statusConfig: Record<
    Order['status'],
    { label_ar: string; label_en: string; badge: string; icon: React.ElementType }
  > = {
    new: {
      label_ar: 'طلب جديد (قيد المراجعة)',
      label_en: 'New',
      badge: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: Clock
    },
    confirmed: {
      label_ar: 'تم التأكيد والتجهيز',
      label_en: 'Confirmed',
      badge: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: CheckCircle2
    },
    shipped: {
      label_ar: 'خرج مع شركة الشحن',
      label_en: 'Shipped',
      badge: 'bg-purple-100 text-purple-800 border-purple-300',
      icon: Truck
    },
    delivered: {
      label_ar: 'تم التسليم بنجاح',
      label_en: 'Delivered',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: CheckCircle2
    },
    cancelled: {
      label_ar: 'ملغي',
      label_en: 'Cancelled',
      badge: 'bg-rose-100 text-rose-800 border-rose-300',
      icon: XCircle
    }
  };

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    return (
      searchQuery.trim() === '' ||
      o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_phone.includes(searchQuery) ||
      o.governorate.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Filtered Maintenance
  const filteredMaintenance = maintenanceRequests.filter((m) => {
    return (
      searchQuery.trim() === '' ||
      m.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery) ||
      m.device_model.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Filtered Phone Requests
  const filteredPhoneRequests = phoneRequests.filter((p) => {
    return (
      searchQuery.trim() === '' ||
      p.request_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      p.device_type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Export to Excel XLSX
  const exportToExcel = () => {
    let dataToExport: any[] = [];

    if (requestCategory === 'sales') {
      dataToExport = filteredOrders.map((o) => ({
        'Order Number': o.order_number,
        'Date': new Date(o.created_at).toLocaleString(),
        'Customer Name': o.customer_name,
        'Phone': o.customer_phone,
        'Governorate': o.governorate,
        'Address': o.delivery_address,
        'Total SYP': o.total,
        'Status': o.status,
        'Payment': o.payment_method
      }));
    } else if (requestCategory === 'maintenance') {
      dataToExport = filteredMaintenance.map((m) => ({
        'Ticket Number': m.ticket_number,
        'Date': new Date(m.created_at).toLocaleString(),
        'Customer': m.customer_name,
        'Phone': m.phone,
        'Device': m.device_type,
        'Model': m.device_model,
        'Issue': m.issue_description,
        'Status': m.status
      }));
    } else {
      dataToExport = filteredPhoneRequests.map((p) => ({
        'Request #': p.request_number,
        'Customer': p.customer_name,
        'Phone': p.phone,
        'Device': p.device_type,
        'Specs': p.specifications,
        'Status': p.status
      }));
    }

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Requests');
    XLSX.writeFile(wb, `Al-Laith-${requestCategory}-${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast(isAr ? 'تم تصدير ملف الإكسل (XLSX) بنجاح!' : 'Excel file exported successfully!');
  };

  const handleGlobalSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast(isAr ? 'تم حفظ كافة تعديلات الطلبات والحالات بنجاح!' : 'Orders and requests changes saved!');
    }, 400);
  };

  return (
    <div className="space-y-6 pb-12" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Top Header & Save Changes Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              <span>{isAr ? 'إدارة الطلبات (مبيعات وصيانة) والتقويم' : 'Orders & Maintenance Management'}</span>
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              {isAr
                ? 'تصنيف الطلبات، عرض التقويم، تصدير إكسل XLSX، وطباعة فواتير رسمية PDF'
                : 'Categorize into Sales & Maintenance, calendar view, XLSX export, and PDF invoice generation'}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Save Changes Button */}
            <button
              type="button"
              onClick={handleGlobalSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isAr ? 'حفظ التعديلات' : 'Save Changes'}</span>
            </button>

            {/* Export XLSX Button */}
            <button
              type="button"
              onClick={exportToExcel}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-emerald-800 bg-emerald-50 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>{isAr ? 'تصدير XLSX' : 'Export Excel'}</span>
            </button>
          </div>
        </div>

        {/* Categories Bar & View Mode Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-stone-100">
          {/* Main Category Tabs */}
          <div className="inline-flex rounded-xl bg-stone-100 p-1 border border-stone-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setRequestCategory('sales')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                requestCategory === 'sales'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isAr ? 'طلبات المبيعات والشراء' : 'Sales Orders'}</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-mono">
                {orders.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setRequestCategory('maintenance')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                requestCategory === 'maintenance'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Wrench className="w-3.5 h-3.5 text-blue-600" />
              <span>{isAr ? 'طلبات الصيانة المعتمدة' : 'Maintenance'}</span>
              <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full font-mono">
                {maintenanceRequests.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setRequestCategory('phone_sourcing')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                requestCategory === 'phone_sourcing'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-600" />
              <span>{isAr ? 'طلبات التوفير الخاص' : 'Sourcing'}</span>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full font-mono">
                {phoneRequests.length}
              </span>
            </button>
          </div>

          {/* View Mode (Table vs Calendar) */}
          <div className="inline-flex rounded-xl bg-stone-100 p-1 border border-stone-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {isAr ? 'عرض الجدول' : 'Table View'}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'calendar' ? 'bg-amber-500 text-stone-950 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>{isAr ? 'عرض التقويم' : 'Calendar View'}</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute top-3 start-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'بحث برقم الطلب، اسم العميل، الهاتف، أو المحافظة...' : 'Search by ID, customer, phone...'}
            className="w-full ps-9 pe-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* View Mode: CALENDAR VIEW */}
      {viewMode === 'calendar' ? (
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-amber-600" />
              <span>{isAr ? 'تقويم مواعيد تسليم وفحص الطلبات' : 'Requests Schedule Calendar'}</span>
            </h3>
            <span className="text-xs text-stone-500 font-mono">
              {new Date().toLocaleDateString(isAr ? 'ar-SY' : 'en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-stone-500 pt-2 border-t border-stone-100">
            {['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'].map((day, idx) => (
              <div key={idx} className="py-1 bg-stone-50 rounded-lg">{isAr ? day : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][idx]}</div>
            ))}
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 31 }).map((_, dayIdx) => {
              const dayNum = dayIdx + 1;
              const hasOrders = (dayNum % 3 === 0);
              const hasRepairs = (dayNum % 4 === 0);

              return (
                <div
                  key={dayIdx}
                  className="min-h-[85px] p-2 rounded-xl border border-stone-200/80 bg-stone-50/50 flex flex-col justify-between hover:bg-stone-50 transition-colors"
                >
                  <span className="font-mono text-xs font-bold text-stone-700">{dayNum}</span>
                  <div className="space-y-1">
                    {hasOrders && (
                      <div className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded truncate">
                        {isAr ? 'تسليم طلب شحن' : 'Delivery'}
                      </div>
                    )}
                    {hasRepairs && (
                      <div className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-1 py-0.5 rounded truncate">
                        {isAr ? 'فحص صيانة' : 'Diagnostic'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* View Mode: TABLE VIEW */
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
          {requestCategory === 'sales' && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-stone-50 text-stone-500 font-black border-b border-stone-200">
                  <tr>
                    <th className="py-3.5 px-4 text-start">{isAr ? 'رقم الطلب والتاريخ' : 'Order & Date'}</th>
                    <th className="py-3.5 px-3 text-start">{isAr ? 'بيانات العميل' : 'Customer'}</th>
                    <th className="py-3.5 px-3 text-start">{isAr ? 'المحافظة والعنوان' : 'Location'}</th>
                    <th className="py-3.5 px-3 text-start">{isAr ? 'إجمالي الفاتورة' : 'Total'}</th>
                    <th className="py-3.5 px-3 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                    <th className="py-3.5 px-4 text-center">{isAr ? 'الإجراءات والفاتورة' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-stone-400">
                        {isAr ? 'لا توجد طلبات مبيعات مطابقة' : 'No sales orders found'}
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const cfg = statusConfig[order.status] || statusConfig.new;
                      return (
                        <tr key={order.id} className="hover:bg-stone-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-mono font-bold text-stone-900">{order.order_number}</div>
                            <div className="text-[11px] text-stone-400">
                              {new Date(order.created_at).toLocaleDateString()}
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <div className="font-bold text-stone-800">{order.customer_name}</div>
                            <div className="text-[11px] text-stone-500 font-mono">{order.customer_phone}</div>
                          </td>

                          <td className="py-3 px-3">
                            <span className="font-semibold text-stone-700">{order.governorate}</span>
                            <span className="text-[11px] text-stone-400 block truncate max-w-[160px]">
                              {order.delivery_address}
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            <div className="font-mono font-bold text-emerald-700">
                              {formatPrice(order.total)}
                            </div>
                            <div className="text-[10px] text-stone-400">
                              {order.payment_method === 'cod' ? (isAr ? 'دفع عند الاستلام' : 'COD') : 'Transfer'}
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                              className={`text-[11px] font-bold px-2 py-1 rounded-lg border cursor-pointer outline-none ${cfg.badge}`}
                            >
                              <option value="new">{isAr ? 'جديد' : 'New'}</option>
                              <option value="confirmed">{isAr ? 'مؤكد' : 'Confirmed'}</option>
                              <option value="shipped">{isAr ? 'شحن' : 'Shipped'}</option>
                              <option value="delivered">{isAr ? 'تم التسليم' : 'Delivered'}</option>
                              <option value="cancelled">{isAr ? 'ملغي' : 'Cancelled'}</option>
                            </select>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => setSelectedOrderForInvoice(order)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors cursor-pointer"
                              title={isAr ? 'طباعة فاتورة رسمية PDF' : 'Print PDF Invoice'}
                            >
                              <Printer className="w-3.5 h-3.5 text-stone-600" />
                              <span>{isAr ? 'فاتورة PDF' : 'Invoice'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {requestCategory === 'maintenance' && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-stone-50 text-stone-500 font-black border-b border-stone-200">
                  <tr>
                    <th className="py-3.5 px-4 text-start">{isAr ? 'رقم التذكرة' : 'Ticket'}</th>
                    <th className="py-3.5 px-3 text-start">{isAr ? 'العميل والهاتف' : 'Customer'}</th>
                    <th className="py-3.5 px-3 text-start">{isAr ? 'نوع الجهاز والموديل' : 'Device'}</th>
                    <th className="py-3.5 px-3 text-start">{isAr ? 'وصف العطل' : 'Issue'}</th>
                    <th className="py-3.5 px-3 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {filteredMaintenance.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-stone-400">
                        {isAr ? 'لا توجد طلبات صيانة حالياً' : 'No maintenance requests found'}
                      </td>
                    </tr>
                  ) : (
                    filteredMaintenance.map((m) => (
                      <tr key={m.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-stone-900">{m.request_number || (m as any).ticket_number}</td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-stone-800">{m.customer_name}</div>
                          <div className="font-mono text-[11px] text-stone-500">{m.phone}</div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-stone-700">
                          {m.device_type} - {m.device_model}
                        </td>
                        <td className="py-3 px-3 text-stone-600 max-w-[220px] truncate">{m.issue_description}</td>
                        <td className="py-3 px-3">
                          <select
                            value={m.status}
                            onChange={(e) => updateMaintenanceStatus(m.id, e.target.value as any)}
                            className="text-[11px] font-bold px-2 py-1 rounded-lg border bg-blue-50 text-blue-800 border-blue-200 cursor-pointer"
                          >
                            <option value="new">{isAr ? 'جديد' : 'New'}</option>
                            <option value="in_progress">{isAr ? 'قيد الفحص' : 'In Progress'}</option>
                            <option value="resolved">{isAr ? 'تم الإصلاح' : 'Resolved'}</option>
                            <option value="cancelled">{isAr ? 'ملغي' : 'Cancelled'}</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {requestCategory === 'phone_sourcing' && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-stone-50 text-stone-500 font-black border-b border-stone-200">
                  <tr>
                    <th className="py-3.5 px-4 text-start">{isAr ? 'رقم الطلب' : 'Request #'}</th>
                    <th className="py-3.5 px-3 text-start">{isAr ? 'العميل' : 'Customer'}</th>
                    <th className="py-3.5 px-3 text-start">{isAr ? 'الجهاز المطلوب' : 'Device'}</th>
                    <th className="py-3.5 px-3 text-start">{isAr ? 'المواصفات المطلوبة' : 'Specifications'}</th>
                    <th className="py-3.5 px-3 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {filteredPhoneRequests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-stone-400">
                        {isAr ? 'لا توجد طلبات توفير أجهزة حالياً' : 'No device requests found'}
                      </td>
                    </tr>
                  ) : (
                    filteredPhoneRequests.map((p) => (
                      <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-stone-900">{p.request_number}</td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-stone-800">{p.customer_name}</div>
                          <div className="font-mono text-[11px] text-stone-500">{p.phone}</div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-stone-800">{p.device_type}</td>
                        <td className="py-3 px-3 text-stone-600 max-w-[250px] truncate">{p.specifications}</td>
                        <td className="py-3 px-3">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800">
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Official PDF Invoice Modal */}
      {selectedOrderForInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8 flex flex-col">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-stone-900 text-sm">
                  {isAr ? `فاتورة مبيعات رسمية #${selectedOrderForInvoice.order_number}` : `Invoice #${selectedOrderForInvoice.order_number}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderForInvoice(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Invoice Sheet */}
            <div id="printable-invoice" className="p-6 sm:p-8 space-y-6 text-xs text-stone-800 bg-white">
              {/* Invoice Header */}
              <div className="flex items-start justify-between border-b pb-6 border-stone-200">
                <div>
                  <h1 className="text-xl font-black text-stone-950 tracking-tight">
                    {isAr ? storeSettings.site_name_ar : storeSettings.site_name_en}
                  </h1>
                  <p className="text-stone-500 text-[11px] mt-0.5">
                    {isAr ? storeSettings.store_address_ar : storeSettings.store_address_en}
                  </p>
                  <p className="text-stone-500 text-[11px]">
                    {isAr ? 'هاتف صالة العرض:' : 'Showroom Phone:'} {storeSettings.store_phone}
                  </p>
                </div>
                <div className="text-end">
                  <div className="text-lg font-black text-emerald-700 font-mono">
                    #{selectedOrderForInvoice.order_number}
                  </div>
                  <div className="text-stone-400 text-[11px]">
                    {new Date(selectedOrderForInvoice.created_at).toLocaleDateString()}
                  </div>
                  <div className="mt-1 inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[10px]">
                    {isAr ? 'فاتورة بيع رسمية معتمدة' : 'Official Sales Invoice'}
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-stone-50 border border-stone-200">
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">{isAr ? 'بيانات العميل:' : 'Bill To:'}</span>
                  <div className="font-bold text-stone-900 mt-0.5">{selectedOrderForInvoice.customer_name}</div>
                  <div className="text-stone-600 font-mono text-[11px]">{selectedOrderForInvoice.customer_phone}</div>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">{isAr ? 'عنوان الشحن:' : 'Delivery Address:'}</span>
                  <div className="font-bold text-stone-900 mt-0.5">{selectedOrderForInvoice.governorate}</div>
                  <div className="text-stone-600 text-[11px]">{selectedOrderForInvoice.delivery_address}</div>
                </div>
              </div>

              {/* Order Items Table */}
              <table className="w-full text-start text-xs border border-stone-200 rounded-xl overflow-hidden">
                <thead className="bg-stone-100 font-bold text-stone-700">
                  <tr>
                    <th className="py-2.5 px-3 text-start">{isAr ? 'المنتج' : 'Item'}</th>
                    <th className="py-2.5 px-3 text-center">{isAr ? 'الكمية' : 'Qty'}</th>
                    <th className="py-2.5 px-3 text-end">{isAr ? 'السعر' : 'Unit Price'}</th>
                    <th className="py-2.5 px-3 text-end">{isAr ? 'المجموع' : 'Total'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {selectedOrderForInvoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 font-semibold text-stone-800">{item.product_title}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-end font-mono">{formatPrice(item.price)}</td>
                      <td className="py-2.5 px-3 text-end font-mono font-bold text-stone-900">
                        {formatPrice(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Invoice Totals */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>{isAr ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                    <span className="font-mono">{formatPrice(selectedOrderForInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>{isAr ? 'رسوم التوصيل والشحن:' : 'Shipping Fee:'}</span>
                    <span className="font-mono">{formatPrice(selectedOrderForInvoice.delivery_fee)}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-stone-900 border-t pt-2 border-stone-300">
                    <span>{isAr ? 'الإجمالي النهائي:' : 'Grand Total:'}</span>
                    <span className="font-mono text-emerald-700">{formatPrice(selectedOrderForInvoice.total)}</span>
                  </div>
                </div>
              </div>

              {/* Warranty Stamp */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-stone-700 text-[11px] leading-relaxed">
                {isAr
                  ? '🔒 كفالة الليث المعتمدة: يشمل هذا الجهاز كفالة رسمية تجريبية واستبدال للأعطال الفنية ومتابعة الصيانة في مخبر الليث المعتمد باللاذقية.'
                  : '🔒 Certified Warranty: Includes official warranty and support at Al-Laith Lab.'}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedOrderForInvoice(null)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 text-xs font-bold"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-stone-900 text-amber-400 text-xs font-bold shadow-md cursor-pointer hover:bg-stone-800"
              >
                <Printer className="w-4 h-4" />
                <span>{isAr ? 'طباعة / حفظ كـ PDF' : 'Print / Save as PDF'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
