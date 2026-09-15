import React, { useState } from 'react';
import {
  Wrench,
  Smartphone,
  CheckCircle2,
  Clock,
  RotateCcw,
  MessageCircle,
  Search,
  Filter,
  AlertCircle
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { MaintenanceRequest } from '../../types';

export const MaintenanceRequestsView: React.FC = () => {
  const {
    locale,
    maintenanceRequests,
    phoneRequests,
    updateMaintenanceStatus
  } = useStore();

  const isAr = locale === 'ar';
  const [activeSubTab, setActiveSubTab] = useState<'maintenance' | 'phone_sourcing'>('maintenance');
  const [search, setSearch] = useState('');

  const statusBadges: Record<
    MaintenanceRequest['status'],
    { label_ar: string; label_en: string; badge: string }
  > = {
    new: {
      label_ar: 'طلب جديد مستلم',
      label_en: 'New Request',
      badge: 'bg-amber-100 text-amber-800 border-amber-200'
    },
    in_progress: {
      label_ar: 'قيد الفحص والصيانة',
      label_en: 'In Progress',
      badge: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    resolved: {
      label_ar: 'تم الإصلاح وجاهز للتسليم',
      label_en: 'Resolved & Ready',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    },
    cancelled: {
      label_ar: 'ملغي / متعذر الإصلاح',
      label_en: 'Cancelled',
      badge: 'bg-stone-100 text-stone-700 border-stone-200'
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-emerald-600" />
              <span>{isAr ? 'طلبات الصيانة المعتمدة وطلبات توفير الأجهزة' : 'Hardware Maintenance & Sourcing Requests'}</span>
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              {isAr
                ? 'متابعة أجهزة الصيانة في مركز الليث، وتحديث الحالات والتواصل مع الزبائن'
                : 'Track in-shop repair devices and custom handset sourcing requests'}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveSubTab('maintenance')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'maintenance'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
              }`}
            >
              <span>{isAr ? 'طلبات الصيانة' : 'Repairs'}</span>
              <span className="ms-1.5 text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">
                {maintenanceRequests.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('phone_sourcing')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'phone_sourcing'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
              }`}
            >
              <span>{isAr ? 'طلبات التوفير الخاص' : 'Sourcing'}</span>
              <span className="ms-1.5 text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">
                {phoneRequests.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub Tab: Repairs */}
      {activeSubTab === 'maintenance' && (
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right rtl:text-right ltr:text-left">
              <thead className="bg-stone-50 text-stone-500 font-black border-b border-stone-200">
                <tr>
                  <th className="py-3.5 px-4">{isAr ? 'رقم التذكرة والجهاز' : 'Ticket & Device'}</th>
                  <th className="py-3.5 px-3">{isAr ? 'العميل والهاتف' : 'Customer & Contact'}</th>
                  <th className="py-3.5 px-3">{isAr ? 'نوع العطل والمشكلة' : 'Issue Description'}</th>
                  <th className="py-3.5 px-3">{isAr ? 'حالة الصيانة' : 'Repair Status'}</th>
                  <th className="py-3.5 px-4 text-center">{isAr ? 'تواصل واتساب' : 'WhatsApp'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {maintenanceRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-stone-400 font-medium">
                      {isAr ? 'لا توجد طلبات صيانة حالية' : 'No maintenance requests'}
                    </td>
                  </tr>
                ) : (
                  maintenanceRequests.map((req) => {
                    const badge = statusBadges[req.status];
                    return (
                      <tr key={req.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-stone-900 block">{req.request_number}</span>
                          <span className="text-emerald-700 font-bold text-xs">{req.device_model}</span>
                        </td>

                        <td className="py-3.5 px-3">
                          <span className="font-bold text-stone-900 block">{req.customer_name}</span>
                          <span className="font-mono text-stone-500 text-[11px]">{req.phone}</span>
                        </td>

                        <td className="py-3.5 px-3 max-w-[280px]">
                          <span className="font-semibold text-stone-800 block">{req.device_type}</span>
                          <span className="text-[11px] text-stone-500 line-clamp-1">{req.issue_description}</span>
                        </td>

                        <td className="py-3.5 px-3">
                          <select
                            value={req.status}
                            onChange={(e) => updateMaintenanceStatus(req.id, e.target.value as MaintenanceRequest['status'])}
                            className={`py-1 px-2 rounded-lg text-xs font-bold border focus:outline-none cursor-pointer ${badge.badge}`}
                          >
                            <option value="new">{isAr ? 'طلب جديد' : 'New'}</option>
                            <option value="in_progress">{isAr ? 'قيد الصيانة' : 'In Progress'}</option>
                            <option value="resolved">{isAr ? 'تم الإصلاح' : 'Resolved'}</option>
                            <option value="cancelled">{isAr ? 'ملغي' : 'Cancelled'}</option>
                          </select>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <a
                            href={`https://wa.me/${req.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `مرحباً ${req.customer_name}، نتواصل معك من مركز صيانة الليث للاتصالات بخصوص جهازك (${req.device_model}) رقم الطلب #${req.request_number}.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{isAr ? 'مراسلة' : 'Chat'}</span>
                          </a>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub Tab: Phone Sourcing Requests */}
      {activeSubTab === 'phone_sourcing' && (
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right rtl:text-right ltr:text-left">
              <thead className="bg-stone-50 text-stone-500 font-black border-b border-stone-200">
                <tr>
                  <th className="py-3.5 px-4">{isAr ? 'الجهاز المطلوب ومواصفاته' : 'Requested Device'}</th>
                  <th className="py-3.5 px-3">{isAr ? 'العميل والهاتف' : 'Customer'}</th>
                  <th className="py-3.5 px-3">{isAr ? 'الميزانية المتوقعة' : 'Budget'}</th>
                  <th className="py-3.5 px-3">{isAr ? 'تاريخ الطلب' : 'Date'}</th>
                  <th className="py-3.5 px-4 text-center">{isAr ? 'تواصل واتساب' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {phoneRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-stone-400 font-medium">
                      {isAr ? 'لا توجد طلبات توفير حالية' : 'No phone sourcing requests'}
                    </td>
                  </tr>
                ) : (
                  phoneRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-stone-900 block text-xs">{req.device_type}</span>
                        <span className="text-[11px] text-stone-500">{req.specifications} {req.condition ? `(${req.condition})` : ''}</span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-bold text-stone-900 block">{req.customer_name}</span>
                        <span className="font-mono text-stone-500 text-[11px]">{req.phone}</span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-mono font-bold text-stone-800">{req.address || '—'}</span>
                      </td>

                      <td className="py-3.5 px-3 font-mono text-stone-400 text-[11px]">
                        {new Date(req.created_at).toLocaleDateString(isAr ? 'ar-SY' : 'en-US')}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <a
                          href={`https://wa.me/${req.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `مرحباً ${req.customer_name}، نتواصل معك من متجر الليث للاتصالات بخصوص طلب توفير جهاز ${req.device_type} (${req.request_number}).`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{isAr ? 'مراسلة' : 'Chat'}</span>
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
