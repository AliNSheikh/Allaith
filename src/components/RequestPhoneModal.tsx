import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  X,
  Smartphone,
  Send,
  MessageCircle,
  User,
  Phone,
  MapPin,
  Sparkles,
  HardDrive,
  Palette,
  CheckCircle2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

const popularBrands = [
  'iPhone',
  'Samsung Galaxy',
  'Xiaomi / Redmi',
  'Huawei',
  'Honor',
  'Google Pixel'
];

const storageOptions = [
  '128 GB',
  '256 GB',
  '512 GB',
  '1 TB'
];

export const RequestPhoneModal: React.FC = () => {
  const {
    isPhoneRequestOpen,
    setIsPhoneRequestOpen,
    createPhoneRequest,
    locale,
    t
  } = useStore();

  const isAr = locale === 'ar';

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [governorate, setGovernorate] = useState('اللاذقية');
  const [addressDetails, setAddressDetails] = useState('');
  const [deviceType, setDeviceType] = useState('');
  const [storage, setStorage] = useState('256 GB');
  const [color, setColor] = useState('');
  const [condition, setCondition] = useState<'new' | 'used'>('new');
  const [specifications, setSpecifications] = useState('');

  // Result state
  const [submittedRequestUrl, setSubmittedRequestUrl] = useState<string | null>(null);

  if (!isPhoneRequestOpen) return null;

  const handleClose = () => {
    setIsPhoneRequestOpen(false);
    setSubmittedRequestUrl(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const fullAddress = `${governorate}${addressDetails ? ` - ${addressDetails.trim()}` : ''}`;

    const { whatsappUrl } = createPhoneRequest({
      customer_name: customerName.trim(),
      phone: phone.trim(),
      address: fullAddress,
      device_type: deviceType.trim(),
      specifications: specifications.trim() || (isAr ? 'حسب المواصفات المحددة أعلاه' : 'Standard specifications'),
      storage,
      color: color.trim() || undefined,
      condition
    });

    setSubmittedRequestUrl(whatsappUrl);

    // Open WhatsApp in a new tab
    if (typeof window !== 'undefined') {
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleQuickBrandClick = (brand: string) => {
    if (!deviceType) {
      setDeviceType(brand + ' ');
    } else if (!deviceType.includes(brand)) {
      setDeviceType(brand + ' ' + deviceType);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/70 backdrop-blur-xs overflow-y-auto">
      <div
        id="request-phone-modal-card"
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white p-5 sm:p-6">
          <button
            id="close-request-phone-modal-btn"
            type="button"
            onClick={handleClose}
            className="absolute top-4 rtl:left-4 ltr:right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  {t('request_phone_title')}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  {t('request_phone_badge')}
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-1 leading-relaxed max-w-md">
                {t('request_phone_desc')}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {submittedRequestUrl ? (
          /* Success Screen */
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h4 className="text-lg sm:text-xl font-black text-stone-900">
                {isAr ? 'تم تجهيز وإرسال طلب جهازك!' : 'Device Request Prepared!'}
              </h4>
              <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-md mx-auto leading-relaxed">
                {isAr
                  ? 'تم تجهيز رسالة وتساب مفصلة بطلبك، سنقوم بالتحقق من توافر الجهاز بأفضل سعر والرد عليك فوراً.'
                  : 'Your customized WhatsApp request message was prepared. We will check device availability and reply shortly.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-right rtl:text-right ltr:text-left text-xs space-y-1.5 text-stone-700">
              <div className="flex justify-between font-bold text-stone-900 border-b border-stone-200 pb-2 mb-2">
                <span>{isAr ? 'الجهاز المطلوب:' : 'Requested Device:'}</span>
                <span className="text-emerald-700 font-black">{deviceType}</span>
              </div>
              <div className="flex justify-between">
                <span>{isAr ? 'سعة التخزين واللون:' : 'Storage & Color:'}</span>
                <span className="font-medium">{storage} {color ? `• ${color}` : ''}</span>
              </div>
              <div className="flex justify-between">
                <span>{isAr ? 'حالة الجهاز:' : 'Condition:'}</span>
                <span className="font-medium">
                  {condition === 'new' ? (isAr ? 'جديد ومختوم' : 'Brand New') : (isAr ? 'مستعمل نظيف مفحوص' : 'Certified Pre-owned')}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                id="reopen-whatsapp-phone-request-btn"
                href={submittedRequestUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{isAr ? 'فتح محادثة وتساب مجدداً' : 'Open WhatsApp Chat Again'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                id="finish-phone-request-btn"
                type="button"
                onClick={handleClose}
                className="py-3 px-6 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-bold text-xs sm:text-sm transition-colors"
              >
                {isAr ? 'إغلاق والعودة للتسوق' : 'Close and Continue Shopping'}
              </button>
            </div>
          </div>
        ) : (
          /* Input Form */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* 1. Device Type & Model */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-stone-600" />
                  <span>{t('device_type_model')}</span>
                  <span className="text-red-500">*</span>
                </span>
                <span className="text-[10px] text-stone-400 font-normal">
                  {isAr ? 'اكتب الموديل أو اختر ماركة' : 'Type model or pick brand'}
                </span>
              </label>

              {/* Quick brand chips */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {popularBrands.map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => handleQuickBrandClick(brand)}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-medium transition-colors"
                  >
                    + {brand}
                  </button>
                ))}
              </div>

              <input
                id="phone-request-device-type"
                type="text"
                required
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value)}
                placeholder={isAr ? 'مثال: iPhone 16 Pro Max أو Samsung S24 Ultra...' : 'e.g. iPhone 16 Pro Max or S24 Ultra...'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 text-xs sm:text-sm text-stone-900"
              />
            </div>

            {/* 2. Specifications: Storage, Color, Condition */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Storage */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5 flex items-center gap-1">
                  <HardDrive className="w-3.5 h-3.5 text-stone-600" />
                  <span>{t('storage')}</span>
                </label>
                <select
                  id="phone-request-storage"
                  value={storage}
                  onChange={(e) => setStorage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs text-stone-900 bg-white"
                >
                  {storageOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                  <option value="سعة أخرى">{isAr ? 'سعة أخرى' : 'Other'}</option>
                </select>
              </div>

              {/* Color */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-stone-600" />
                  <span>{t('color')}</span>
                </label>
                <input
                  id="phone-request-color"
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder={isAr ? 'مثال: تيتانيوم صحراوي / أسود' : 'e.g. Natural Titanium / Black'}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs text-stone-900"
                />
              </div>

              {/* Condition (New vs Used) */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isAr ? 'الحالة المطلوبة' : 'Condition'}</span>
                </label>
                <div className="grid grid-cols-2 gap-1 p-1 bg-stone-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setCondition('new')}
                    className={`py-1 text-[11px] font-bold rounded-lg transition-colors ${
                      condition === 'new'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {isAr ? 'جديد' : 'New'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCondition('used')}
                    className={`py-1 text-[11px] font-bold rounded-lg transition-colors ${
                      condition === 'used'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {isAr ? 'مستعمل' : 'Used'}
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Detailed Specifications / Extra Notes */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1.5">
                {t('specifications_label')}
              </label>
              <textarea
                id="phone-request-specifications"
                rows={2}
                value={specifications}
                onChange={(e) => setSpecifications(e.target.value)}
                placeholder={t('specifications_placeholder')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
              />
            </div>

            {/* Separator: Customer Details */}
            <div className="pt-2 border-t border-stone-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                {isAr ? 'بيانات التواصل والتسليم' : 'Contact & Delivery Details'}
              </span>
            </div>

            {/* 4. Customer Name & Phone Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-stone-600" />
                  <span>{t('customer_name')}</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone-request-customer-name"
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={isAr ? 'اسمك الكريم' : 'Your full name'}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-stone-600" />
                  <span>{t('phone_number')}</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone-request-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09xxxxxxxx"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-900 font-mono"
                  dir="ltr"
                />
              </div>
            </div>

            {/* 5. Address (Governorate & Detailed Address) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-800 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-600" />
                <span>{t('customer_address_label')}</span>
                <span className="text-red-500">*</span>
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select
                  id="phone-request-governorate"
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs text-stone-900 bg-white"
                >
                  <option value="دمشق">{t('gov_damascus')}</option>
                  <option value="ريف دمشق">{t('gov_rif_dimashq')}</option>
                  <option value="حلب">{t('gov_aleppo')}</option>
                  <option value="حمص">{t('gov_homs')}</option>
                  <option value="حماة">{t('gov_hama')}</option>
                  <option value="اللاذقية">{t('gov_latakia')}</option>
                  <option value="طرطوس">{t('gov_tartus')}</option>
                  <option value="السويداء">{t('gov_suwayda')}</option>
                  <option value="درعا">{t('gov_daraa')}</option>
                  <option value="دير الزور">{t('gov_deir_ezzor')}</option>
                  <option value="الحسكة">{t('gov_hasakah')}</option>
                  <option value="الرقة">{t('gov_raqqa')}</option>
                  <option value="القنيطرة">{t('gov_quneitra')}</option>
                </select>

                <input
                  id="phone-request-address-details"
                  type="text"
                  required
                  value={addressDetails}
                  onChange={(e) => setAddressDetails(e.target.value)}
                  placeholder={t('customer_address_placeholder')}
                  className="sm:col-span-2 w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-900"
                />
              </div>
            </div>

            {/* Trust badge */}
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-emerald-900 text-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                {isAr
                  ? 'يتم فحص جميع الأجهزة المطلوبة مخبرياً وتأمينها بكفالة رسمية معتمدة وتوصيل لكافة المحافظات.'
                  : 'All custom devices are inspected in our certified lab with official warranty and nationwide delivery.'}
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                id="submit-phone-request-whatsapp-btn"
                type="submit"
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-xs sm:text-sm transition-all shadow-md hover:shadow-lg"
              >
                <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
                <span>{t('send_phone_request_whatsapp')}</span>
                <Send className="w-4 h-4 rtl:rotate-180" />
              </button>
              <p className="text-[11px] text-center text-stone-400 mt-2">
                {isAr
                  ? 'سيتم توجيهك فوراً لتطبيق وتساب مع نص الرسالة المنظم للتأكيد المباشر مع فريق المبيعات'
                  : 'You will be redirected to WhatsApp with structured details to confirm with sales directly'}
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
