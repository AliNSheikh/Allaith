import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Wrench,
  X,
  MessageCircle,
  Upload,
  Calendar,
  Smartphone,
  Tablet,
  Home,
  Laptop,
  CheckCircle2,
  ShieldAlert,
  User,
  Phone,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { MaintenanceRequest } from '../types';

export const MaintenanceModal: React.FC = () => {
  const {
    locale,
    t,
    isMaintenanceOpen,
    setIsMaintenanceOpen,
    setIsPhoneRequestOpen,
    createMaintenanceRequest
  } = useStore();

  const isAr = locale === 'ar';

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [deviceType, setDeviceType] = useState<MaintenanceRequest['device_type']>('home_appliance');
  const [deviceModel, setDeviceModel] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState<MaintenanceRequest | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string>('');

  const deviceCategories = [
    { id: 'smartphone', label_ar: 'هاتف ذكي', label_en: 'Smartphone', icon: Smartphone },
    { id: 'home_appliance', label_ar: 'جهاز منزلي (مكنسة/قلاية/قهوة)', label_en: 'Home Appliance', icon: Home },
    { id: 'tablet', label_ar: 'تابلت / آيباد', label_en: 'Tablet / iPad', icon: Tablet },
    { id: 'laptop', label_ar: 'كمبيوتر محمول', label_en: 'Laptop', icon: Laptop },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim() || !deviceModel.trim() || !issueDescription.trim()) {
      return;
    }

    const { request, whatsappUrl: waUrl } = createMaintenanceRequest({
      customer_name: customerName.trim(),
      phone: phone.trim(),
      device_type: deviceType,
      device_model: deviceModel.trim(),
      issue_description: issueDescription.trim(),
      preferred_date: preferredDate || new Date().toISOString().split('T')[0],
      photo_url: photoUrl.trim() || undefined
    });

    setSubmittedTicket(request);
    setWhatsappUrl(waUrl);

    // Launch WhatsApp
    window.open(waUrl, '_blank');
  };

  const handleClose = () => {
    setIsMaintenanceOpen(false);
    setSubmittedTicket(null);
    setWhatsappUrl('');
  };

  const handleSimulatePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      {/* Persistent Floating Action Button on all storefront views */}
      <div className="fixed bottom-20 sm:bottom-8 left-4 rtl:left-auto rtl:right-4 z-40">
        <button
          id="floating-maintenance-btn"
          type="button"
          onClick={() => setIsMaintenanceOpen(true)}
          className="relative group flex items-center gap-2.5 px-4 py-3 sm:px-5 sm:py-3.5 rounded-full bg-[#181e23] hover:bg-[#252d34] text-white font-bold text-xs sm:text-sm shadow-xl hover:shadow-2xl transition-all hover:scale-105 border border-[#3d4a55]"
          aria-label="Request Maintenance"
        >
          {/* Pulsing Beacon Ring in brand sage/emerald */}
          <span className="absolute -top-1 -right-1 rtl:-right-auto rtl:-left-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6b947e] opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#547b66]" />
          </span>

          <Wrench className="w-4 h-4 text-[#729a84] group-hover:rotate-12 transition-transform" />
          <span>{t('request_maintenance_btn')}</span>
        </button>
      </div>

      {/* Booking Service Modal */}
      {isMaintenanceOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-900 text-emerald-400 flex items-center justify-center shadow-xs">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-stone-900">
                    {submittedTicket ? t('maintenance_success') : t('maintenance_title')}
                  </h2>
                  <p className="text-xs text-stone-500">
                    {submittedTicket
                      ? `${t('order_number')}: #${submittedTicket.request_number}`
                      : isAr
                      ? 'مخبر صيانة متجر الليث المعتمد في دمشق - فحص إلكتروني وقطع أصلية'
                      : 'Al-Laith Certified Repair Lab in Damascus, Syria'}
                  </p>
                </div>
              </div>
              <button
                id="maintenance-modal-close-btn"
                type="button"
                onClick={handleClose}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6">
              {!submittedTicket ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200/80">
                    {t('maintenance_desc')}
                  </p>

                  {/* Device Category Picker */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-2">
                      {t('device_category')} *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {deviceCategories.map((cat) => {
                        const Icon = cat.icon;
                        const isSelected = deviceType === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setDeviceType(cat.id as MaintenanceRequest['device_type'])}
                            className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-bold transition-all border text-left rtl:text-right ${
                              isSelected
                                ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                                : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-stone-500'}`} />
                            <span>{isAr ? cat.label_ar : cat.label_en}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Customer Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-stone-400" />
                        <span>{t('customer_name')} *</span>
                      </label>
                      <input
                        id="maint-input-name"
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder={isAr ? 'الاسم الكامل' : 'Full Name'}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-xs sm:text-sm focus:outline-none focus:border-stone-900 shadow-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-stone-400" />
                        <span>{t('phone_number')} *</span>
                      </label>
                      <input
                        id="maint-input-phone"
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={isAr ? '0988 123 456 أو +963 988 123 456' : '+963 988 123 456'}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-xs sm:text-sm focus:outline-none focus:border-stone-900 shadow-xs"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Device Model */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {t('device_model')} *
                    </label>
                    <input
                      id="maint-input-model"
                      type="text"
                      required
                      value={deviceModel}
                      onChange={(e) => setDeviceModel(e.target.value)}
                      placeholder={isAr ? 'مثال: iPhone 15 Pro Max أو Galaxy S24 Ultra أو iPad Pro' : 'e.g. iPhone 15 Pro Max, Galaxy S24 Ultra'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-xs sm:text-sm focus:outline-none focus:border-stone-900 shadow-xs"
                    />
                  </div>

                  {/* Issue Description */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {t('issue_description')} *
                    </label>
                    <textarea
                      id="maint-input-description"
                      required
                      rows={3}
                      value={issueDescription}
                      onChange={(e) => setIssueDescription(e.target.value)}
                      placeholder={isAr ? 'اشرح ما يحدث بالجهاز (صوت غير طبيعي، لا يشحن، تسريب، كسر شاشة...)' : 'Describe symptoms, errors, or required spare parts...'}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-stone-900 text-xs sm:text-sm focus:outline-none focus:border-stone-900 shadow-xs resize-none"
                    />
                  </div>

                  {/* Preferred Date & Photo Upload */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <span>{t('preferred_visit_date')}</span>
                      </label>
                      <input
                        id="maint-input-date"
                        type="date"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-stone-900 text-xs focus:outline-none focus:border-stone-900 shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                        <Upload className="w-3.5 h-3.5 text-stone-400" />
                        <span>{t('device_photo')}</span>
                      </label>
                      <div className="relative">
                        <input
                          id="maint-file-photo"
                          type="file"
                          accept="image/*"
                          onChange={handleSimulatePhotoUpload}
                          className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Photo Preview if loaded */}
                  {photoUrl && (
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-stone-50 border border-stone-200">
                      <img src={photoUrl} alt="Device Preview" className="w-12 h-12 object-cover rounded-lg" />
                      <span className="text-xs text-stone-600 font-medium">
                        {isAr ? 'تم إرفاق صورة الجهاز بنجاح' : 'Photo attached successfully'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPhotoUrl('')}
                        className="mr-auto rtl:mr-0 rtl:ml-auto text-xs text-rose-600 font-semibold"
                      >
                        {isAr ? 'إزالة' : 'Remove'}
                      </button>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-3">
                    <button
                      id="maint-submit-whatsapp-btn"
                      type="submit"
                      className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all"
                    >
                      <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
                      <span>{t('submit_maintenance')}</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Ticket Success State */
                <div className="text-center py-4 space-y-5 animate-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-stone-900 mb-1">
                      {t('maintenance_success')}
                    </h3>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto">
                      {isAr
                        ? 'تم إدراج بلاغك في قائمة مهام ورشة الصيانة وسيتم التواصل معك مباشرة لتحديد موعد الاستلام أو الزيارة.'
                        : 'Your maintenance request is logged into our repair system. An engineer will follow up shortly.'}
                    </p>
                  </div>

                  {/* Ticket Details Box */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-right rtl:text-right text-xs space-y-2 text-stone-700">
                    <div className="flex justify-between font-bold text-stone-900 border-b border-stone-200 pb-2">
                      <span>رقم التذكرة:</span>
                      <span className="font-mono text-emerald-800">#{submittedTicket.request_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الجهاز:</span>
                      <span className="font-semibold">{submittedTicket.device_model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>العميل:</span>
                      <span>{submittedTicket.customer_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>حالة التذكرة:</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
                        {t('maintenance_status_new')}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <a
                      id="maint-whatsapp-reopen-btn"
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
                      <span>{isAr ? 'فتح المحادثة مجدداً على وتساب' : 'Open WhatsApp Thread'}</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <button
                      type="button"
                      onClick={handleClose}
                      className="w-full py-2 text-xs font-bold text-stone-500 hover:text-stone-900"
                    >
                      {isAr ? 'إغلاق النافذة' : 'Close'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
