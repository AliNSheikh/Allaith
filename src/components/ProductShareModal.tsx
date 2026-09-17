import React, { useState } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import {
  getProductShareableUrl,
  getProductWhatsAppShareUrl,
  getProductTelegramShareUrl,
  getProductFacebookShareUrl
} from '../utils/productUrl';
import {
  Share2,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Send,
  QrCode,
  X,
  Sparkles,
  Smartphone
} from 'lucide-react';

interface ProductShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const ProductShareModal: React.FC<ProductShareModalProps> = ({
  isOpen,
  onClose,
  product
}) => {
  const { locale, storeSettings, showToast, formatProductPrice } = useStore();
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!isOpen || !product) return null;

  const isAr = locale === 'ar';
  const shareUrl = getProductShareableUrl(product, storeSettings.site_domain);
  const title = isAr ? product.title_ar : product.title_en;
  const priceInfo = formatProductPrice(product);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const input = document.createElement('input');
        input.value = shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      showToast(isAr ? 'تم نسخ رابط المنتج الفريد بنجاح!' : 'Product link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast(isAr ? 'تعذر النسخ تلقائياً، يرجى تحديد الرابط ونسخه يدوياً' : 'Could not copy automatically, please copy manually');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: isAr
            ? `شاهد هذا المنتج من متجر الليث للاتصالات: ${title}`
            : `Check out ${title} at Al-Laith Telecommunications`,
          url: shareUrl
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(shareUrl)}&margin=10`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-100 bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center shadow-xs">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-stone-900 leading-tight">
                {isAr ? 'مشاركة رابط المنتج المباشر' : 'Share Unique Product Link'}
              </h3>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {isAr ? 'رابط دائم وخاص بهذا الجهاز لفتحه مباشرة' : 'Permanent direct link to view this item'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Preview Summary */}
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
            <img
              src={product.images[0] || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=120'}
              alt={title}
              className="w-16 h-16 rounded-xl object-cover bg-white border border-stone-200 shrink-0 aspect-square"
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                {product.brand} • {product.sku}
              </div>
              <h4 className="text-sm font-black text-stone-900 truncate mt-0.5">
                {title}
              </h4>
              <div className="text-xs font-black text-stone-900 mt-1 flex items-baseline gap-2">
                <span>{priceInfo.primary}</span>
                {priceInfo.secondary && (
                  <span className="text-[11px] font-medium text-stone-500">
                    ({priceInfo.secondary})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Unique Link Input Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                {isAr ? 'الرابط الفريد المخصص للمنتج:' : 'Unique Product URL:'}
              </span>
              <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
                #{product.slug || product.id}
              </span>
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  className="w-full pl-3 pr-3 py-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs font-mono text-stone-800 select-all outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-xs ${
                  copied
                    ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                    : 'bg-stone-900 hover:bg-stone-800 text-white'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ الرابط' : 'Copy Link')}</span>
              </button>
            </div>
          </div>

          {/* Sharing Channels Grid */}
          <div className="pt-2">
            <div className="text-xs font-bold text-stone-500 mb-2">
              {isAr ? 'إرسال مباشر عبر التطبيقات:' : 'Send directly via apps:'}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {/* WhatsApp */}
              <a
                href={getProductWhatsAppShareUrl(product, storeSettings.site_domain, storeSettings.currency_ar)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 transition-colors shadow-xs"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>{isAr ? 'واتساب' : 'WhatsApp'}</span>
              </a>

              {/* Telegram */}
              <a
                href={getProductTelegramShareUrl(product, storeSettings.site_domain)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-xs border border-sky-200 transition-colors shadow-xs"
              >
                <Send className="w-4 h-4 text-sky-600" />
                <span>{isAr ? 'تيليغرام' : 'Telegram'}</span>
              </a>

              {/* QR Code toggle */}
              <button
                type="button"
                onClick={() => setShowQr(!showQr)}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl font-bold text-xs border transition-colors shadow-xs cursor-pointer ${
                  showQr
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200'
                }`}
              >
                <QrCode className="w-4 h-4 text-amber-700" />
                <span>{isAr ? 'رمز QR' : 'QR Code'}</span>
              </button>
            </div>
          </div>

          {/* QR Code Expansion Panel */}
          {showQr && (
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center animate-in fade-in duration-200">
              <div className="inline-block p-3 bg-white rounded-xl shadow-xs border border-stone-200 mx-auto">
                <img
                  src={qrImageUrl}
                  alt="Product Link QR"
                  className="w-40 h-40 object-contain mx-auto"
                  loading="lazy"
                />
              </div>
              <p className="text-[11px] text-stone-600 font-medium mt-2">
                {isAr
                  ? 'امسح رمز الاستجابة السريعة (QR) بكاميرا هاتفك لفتح صفحة المنتج فوراً'
                  : 'Scan this QR code with your phone camera to open the product directly'}
              </p>
            </div>
          )}

          {/* Native System Share (Mobile / Tablet) */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-stone-600" />
              <span>{isAr ? 'مشاركة عبر تطبيقات أخرى (الهاتف)' : 'Share via System Menu'}</span>
            </button>
          )}

          {/* Direct Link Access Explanation Note */}
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-950 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              {isAr ? (
                <span>
                  <strong>رابط مخصص ودائم:</strong> عند مشاركة هذا الرابط مع أي شخص عبر واتساب أو شبكات التواصل، سيتم توجيهه مباشرة إلى صفحة هذا الجهاز بالتحديد لعرض تفاصيله وإمكانية طلبه فوراً.
                </span>
              ) : (
                <span>
                  <strong>Dedicated Direct Link:</strong> Sending this link allows anyone to open this specific product page immediately, view its live specs, and place an order.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-stone-100 bg-stone-50/60 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold transition-colors cursor-pointer"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
