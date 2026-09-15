import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { LaithLogo } from './LaithLogo';
import {
  X,
  MapPin,
  Phone,
  Clock,
  Navigation,
  MessageCircle,
  Copy,
  Check,
  Building2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface SiteDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SiteDetailsModal: React.FC<SiteDetailsModalProps> = ({ isOpen, onClose }) => {
  const { locale, storeSettings } = useStore();
  const isAr = locale === 'ar';
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const address = isAr ? storeSettings.store_address_ar : storeSettings.store_address_en;
  const hours = isAr ? storeSettings.store_hours_ar : storeSettings.store_hours_en;
  const phone = storeSettings.store_phone || '+963 933 123 456';
  const rawPhone = phone.replace(/[^0-9+]/g, '');
  const rawWhatsapp = storeSettings.whatsapp_number.replace(/[^0-9]/g, '');

  const googleMapsUrl = storeSettings.google_maps_url || `https://www.google.com/maps?q=${storeSettings.store_lat || 35.524917},${storeSettings.store_lng || 35.852556}`;
  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${storeSettings.store_lat || 35.524917},${storeSettings.store_lng || 35.852556}&hl=${isAr ? 'ar' : 'en'}&z=16&output=embed`;

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => {
      setCopiedField((current) => (current === fieldId ? null : current));
    }, 2500);
  };

  return (
    <div
      id="site-details-modal-overlay"
      className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6">
        {/* Header with Brand Gradient */}
        <div className="relative bg-gradient-to-r from-[#181e23] via-[#232a31] to-[#2c3740] px-5 py-5 sm:px-7 sm:py-6 text-white">
          <button
            id="close-site-details-modal-btn"
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-2 text-stone-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <LaithLogo variant="icon" size="md" className="drop-shadow-md" />
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#547b66]/30 border border-[#6b947e]/40 text-[#a3c9b4] text-[11px] font-bold">
                <MapPin className="w-3 h-3 text-[#6b947e]" />
                <span>{isAr ? 'تفاصيل الموقع والمعلومات الرسمية' : 'Store Location & Official Details'}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                {isAr ? 'متجر ومركز صيانة الليث للاتصالات' : 'Al-Laith Telecom Store & Repair Center'}
              </h3>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Physical Address Block */}
          <div className="p-4 rounded-2xl bg-[#f7f8f7] border border-[#e2e6e3] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#547b66] uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#547b66]" />
                {isAr ? 'العنوان الجغرافي المباشر' : 'Physical Store Address'}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(address, 'address')}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-stone-600 hover:text-stone-900 bg-white rounded-lg border border-stone-200 transition-colors shadow-2xs"
                title={isAr ? 'نسخ العنوان' : 'Copy address'}
              >
                {copiedField === 'address' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">{isAr ? 'تم النسخ' : 'Copied'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{isAr ? 'نسخ النص' : 'Copy'}</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-sm sm:text-base font-bold text-stone-900 leading-relaxed select-all">
              {address}
            </p>
            <p className="text-xs text-stone-500">
              {isAr
                ? 'اللاذقية - قرية الشير - طريق الحفة - بجانب الإشارة الصفراء'
                : 'Latakia - Al-Shir Village - Al-Haffah Road - Next to the Yellow Traffic Light'}
            </p>
            <div className="pt-1 flex items-center gap-2 text-xs">
              <span className="font-semibold text-stone-600">{isAr ? 'الإحداثيات:' : 'GPS Coordinates:'}</span>
              <span className="font-mono bg-stone-200/80 text-stone-800 px-2 py-0.5 rounded-md text-[11px] font-bold select-all">
                35°31'29.7"N 35°51'09.2"E
              </span>
            </div>
          </div>

          {/* Contact & Phone Numbers Block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Phone Number */}
            <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-[#547b66]" />
                  {isAr ? 'رقم الهاتف المباشر' : 'Direct Phone'}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(phone, 'phone')}
                  className="p-1 text-stone-400 hover:text-stone-700"
                  title="Copy Phone"
                >
                  {copiedField === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-base font-black font-mono text-stone-900" dir="ltr">
                  {phone}
                </span>
              </div>
              <a
                href={`tel:${rawPhone}`}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{isAr ? 'اتصال مباشر الآن' : 'Call Now'}</span>
              </a>
            </div>

            {/* WhatsApp Contact */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  {isAr ? 'خدمة وتساب الفورية' : 'WhatsApp Support'}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {isAr ? 'متاح الآن' : 'Online'}
                </span>
              </div>
              <div className="text-sm font-bold font-mono text-emerald-950" dir="ltr">
                {storeSettings.whatsapp_number}
              </div>
              <a
                href={`https://wa.me/${rawWhatsapp}?text=${encodeURIComponent(
                  isAr ? 'مرحباً متجر الليث للاتصالات، أود الاستفسار عن الأجهزة المتوفرة والأسعار' : 'Hello Al-Laith Telecom, I would like to inquire about devices and prices.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{isAr ? 'مراسلة وتساب فورية' : 'Chat on WhatsApp'}</span>
              </a>
            </div>
          </div>

          {/* Working Hours */}
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
            <Clock className="w-4 h-4 text-[#547b66] mt-0.5 shrink-0" />
            <div className="space-y-0.5">
              <span className="font-extrabold text-stone-800 block">
                {isAr ? 'أوقات الدوام الرسمي في الصالة ومركز الصيانة:' : 'Official Working Hours:'}
              </span>
              <p className="text-stone-600 font-medium">{hours}</p>
            </div>
          </div>

          {/* Interactive Google Map Embed */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-stone-800 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-[#547b66]" />
                {isAr ? 'الخريطة والموقع المباشر على Google Maps' : 'Interactive Map Location'}
              </span>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#547b66] hover:text-[#446554] flex items-center gap-1"
              >
                <span>{isAr ? 'فتح في تطبيق الخرائط' : 'Open in Google Maps'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="w-full h-56 sm:h-64 rounded-2xl overflow-hidden border border-stone-300 bg-stone-100 shadow-inner relative">
              <iframe
                title="Store Location Map"
                src={googleMapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            </div>
          </div>

          {/* Trust Highlights */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-1 text-stone-500 text-xs font-medium">
            <span className="flex items-center gap-1 text-[#547b66]">
              <ShieldCheck className="w-3.5 h-3.5" />
              {isAr ? 'صالة مبيعات معتمدة' : 'Certified Flagship'}
            </span>
            <span>•</span>
            <span>{isAr ? 'كفالة وكيل رسمية' : 'Official Warranty'}</span>
            <span>•</span>
            <span>{isAr ? 'توصيل لكافة المحافظات السورية' : 'Syrian Nationwide Delivery'}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-stone-600 hover:text-stone-900 text-xs font-bold hover:bg-stone-200 transition-colors"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-[#181e23] hover:bg-[#232a31] text-white text-xs font-bold transition-all shadow-xs"
          >
            <Navigation className="w-3.5 h-3.5 text-[#6b947e]" />
            <span>{isAr ? 'الاتجاهات عبر Google Maps' : 'Directions on Google Maps'}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
