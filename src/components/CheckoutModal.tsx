import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  X,
  MessageCircle,
  CheckCircle2,
  FileSpreadsheet,
  ShieldCheck,
  Building,
  User,
  Phone,
  MapPin,
  FileText,
  ExternalLink
} from 'lucide-react';
import { Order } from '../types';

export const CheckoutModal: React.FC = () => {
  const {
    locale,
    t,
    cart,
    cartTotal,
    deliveryFee,
    isCheckoutOpen,
    setIsCheckoutOpen,
    createOrder,
    formatDualPrice
  } = useStore();

  const isAr = locale === 'ar';

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [governorate, setGovernorate] = useState(isAr ? 'دمشق' : 'Damascus');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success result state
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string>('');

  if (!isCheckoutOpen) return null;

  const syrianGovernorates = isAr
    ? [
        'دمشق',
        'ريف دمشق',
        'حلب',
        'حمص',
        'اللاذقية',
        'طرطوس',
        'حماة',
        'درعا',
        'السويداء',
        'القنيطرة',
        'دير الزور',
        'الحسكة',
        'الرقة',
        'إدلب'
      ]
    : [
        'Damascus',
        'Rural Damascus',
        'Aleppo',
        'Homs',
        'Latakia',
        'Tartus',
        'Hama',
        'Daraa',
        'As-Suwayda',
        'Quneitra',
        'Deir ez-Zor',
        'Al-Hasakah',
        'Raqqa',
        'Idlib'
      ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim()) {
      return;
    }

    setIsSubmitting(true);

    const { order, whatsappUrl: waUrl } = createOrder({
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      governorate,
      delivery_address: deliveryAddress.trim(),
      notes: notes.trim() || undefined
    });

    setCompletedOrder(order);
    setWhatsappUrl(waUrl);
    setIsSubmitting(false);

    // Open WhatsApp in new tab
    window.open(waUrl, '_blank');
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setCompletedOrder(null);
    setWhatsappUrl('');
  };

  const totalDual = formatDualPrice(cartTotal);
  const deliveryDual = deliveryFee > 0 ? formatDualPrice(deliveryFee) : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-stone-900">
              {completedOrder ? t('order_success') : t('checkout_title')}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {completedOrder
                ? `${t('order_number')}: #${completedOrder.order_number}`
                : t('whatsapp_checkout_note')}
            </p>
          </div>
          <button
            id="checkout-modal-close-btn"
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6">
          {!completedOrder ? (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Order Summary Pill Bar with Syrian Lira + USD */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-stone-500 block">{t('total')}:</span>
                  <span className="text-base font-black text-stone-900">
                    {totalDual.primary}
                  </span>
                  <span className="text-[11px] text-stone-500 block">
                    ≈ {totalDual.secondary}
                  </span>
                </div>
                <div className="text-right rtl:text-left text-[11px] text-stone-500">
                  <span>{cart.length} {isAr ? 'عناصر' : 'items'}</span>
                  <span className="block text-emerald-700 font-semibold">
                    {deliveryFee === 0 ? t('free') : `${t('delivery_fee')}: ${deliveryDual?.primary}`}
                  </span>
                </div>
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-stone-500" />
                  <span>{t('customer_name')} *</span>
                </label>
                <input
                  id="checkout-input-name"
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={isAr ? 'مثال: باسل الصباغ' : 'e.g. Bassel Sabbagh'}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-none focus:border-stone-900 shadow-xs"
                />
              </div>

              {/* Phone (Syrian format) */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-stone-500" />
                  <span>{t('phone_number')} *</span>
                </label>
                <input
                  id="checkout-input-phone"
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder={isAr ? '0988 123 456 أو +963 988 123 456' : '+963 988 123 456'}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-none focus:border-stone-900 shadow-xs"
                  dir="ltr"
                />
              </div>

              {/* Syrian Governorate */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-stone-500" />
                  <span>{t('governorate')} *</span>
                </label>
                <select
                  id="checkout-select-governorate"
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-none focus:border-stone-900 shadow-xs"
                >
                  {syrianGovernorates.map((gov) => (
                    <option key={gov} value={gov}>
                      {gov}
                    </option>
                  ))}
                </select>
              </div>

              {/* Detailed Address */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-stone-500" />
                  <span>{t('delivery_address')} *</span>
                </label>
                <textarea
                  id="checkout-input-address"
                  required
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder={isAr ? 'دمشق - المزة أوتوستراد - بناء 12 - طابق 3...' : 'e.g. Damascus, Mazzeh Highway, Bldg 12...'}
                  className="w-full px-4 py-2 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-none focus:border-stone-900 shadow-xs resize-none"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-stone-500" />
                  <span>{t('order_notes')}</span>
                </label>
                <input
                  id="checkout-input-notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={isAr ? 'ملاحظات بخصوص موعد التسليم أو التأكد من سلامة العلبة...' : 'Notes regarding delivery time...'}
                  className="w-full px-4 py-2 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-none focus:border-stone-900 shadow-xs"
                />
              </div>

              {/* WhatsApp Invoice Button */}
              <button
                id="checkout-submit-whatsapp-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-emerald-600/30 cursor-pointer active:scale-95"
              >
                <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
                <span>{t('whatsapp_checkout_btn')}</span>
              </button>

              {/* Notice */}
              <div className="pt-2 flex flex-col items-center justify-center gap-1.5 text-center text-stone-500 text-xs">
                <div className="flex items-center gap-2 text-stone-600 font-semibold text-[11px]">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('synced_sheets_success')}</span>
                </div>
                <div className="flex items-center gap-1.5 text-stone-400 text-[10px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-stone-500" />
                  <span>{isAr ? 'الدفع نقداً عند الاستلام بعد معاينة وفحص الجهاز بالكامل' : 'Cash on Delivery upon physical inspection'}</span>
                </div>
              </div>
            </form>
          ) : (
            /* Order Placed Success View */
            <div className="text-center py-4 space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-xl font-black text-stone-900 mb-1">
                  {t('order_success')}
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  {isAr
                    ? 'تم تسجيل طلبك بنجاح في متجر الليث للاتصالات وتجهيز فاتورة وتساب المعتمدة.'
                    : 'Your order was successfully recorded and synced.'}
                </p>
              </div>

              {/* Order Receipt Box */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-right rtl:text-right text-xs space-y-2 text-stone-700">
                <div className="flex justify-between font-bold text-stone-900 border-b border-stone-200 pb-2">
                  <span>{t('order_number')}:</span>
                  <span className="font-mono text-emerald-800">#{completedOrder.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('customer_name')}:</span>
                  <span className="font-medium">{completedOrder.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('phone_number')}:</span>
                  <span className="font-mono" dir="ltr">{completedOrder.customer_phone}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('governorate')}:</span>
                  <span className="font-medium">{completedOrder.governorate}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('total')}:</span>
                  <span className="font-black text-stone-900">{formatDualPrice(completedOrder.total).primary}</span>
                </div>

                {/* Google Sheets Sync Badge */}
                <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-emerald-700 font-semibold text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>{t('synced_sheets_success')}</span>
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* WhatsApp Launch Link */}
              <div className="space-y-2">
                <a
                  id="checkout-whatsapp-reopen-btn"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
                  <span>{isAr ? 'فتح المحادثة مجدداً على وتساب' : 'Open WhatsApp Conversation'}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-2.5 text-xs font-bold text-stone-500 hover:text-stone-900"
                >
                  {isAr ? 'إغلاق والعودة للمتجر' : 'Close & Return to Store'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
