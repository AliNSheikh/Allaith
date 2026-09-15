import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  X,
  ShoppingBag,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Truck,
  ShieldCheck
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    locale,
    t,
    cart,
    cartCount,
    cartSubtotal,
    deliveryFee,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
    setIsCheckoutOpen,
    updateCartQuantity,
    removeFromCart,
    storeSettings,
    formatPrice,
    formatDualPrice,
    setCurrentView
  } = useStore();

  if (!isCartOpen) return null;

  const isAr = locale === 'ar';
  const freeThreshold = storeSettings.free_delivery_threshold;
  const remainingForFree = Math.max(0, freeThreshold - cartSubtotal);
  const freeShippingProgress = Math.min(100, (cartSubtotal / freeThreshold) * 100);

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const totalDual = formatDualPrice(cartTotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Slide-over Drawer */}
      <div className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 max-w-full flex pl-10 rtl:pl-0 rtl:pr-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right rtl:slide-in-from-left duration-300">
          {/* Header */}
          <div className="p-5 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-stone-900" />
              <h2 className="text-base font-extrabold text-stone-900">
                {t('your_cart')} ({cartCount})
              </h2>
            </div>
            <button
              id="cart-drawer-close-btn"
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-stone-50 px-5 py-3 border-b border-stone-200/80">
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="flex items-center gap-1 text-stone-700">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                {remainingForFree <= 0
                  ? (isAr ? 'مبارك! حصلت على توصيل مجاني 🎉' : 'Free delivery qualified! 🎉')
                  : (isAr ? `أضف بقيمة ${formatPrice(remainingForFree)} للحصول على توصيل مجاني` : `Add ${formatPrice(remainingForFree)} more for Free Delivery`)}
              </span>
              <span className="text-[11px] font-bold text-stone-500">
                {Math.round(freeShippingProgress)}%
              </span>
            </div>
            <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-stone-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-stone-900">{t('cart_empty')}</h3>
                <p className="text-xs text-stone-500 max-w-xs leading-relaxed">
                  {isAr
                    ? 'استكشف أحدث الهواتف الذكية والأجهزة وملحقاتها في متجر الليث وأضفها إلى سلتك.'
                    : 'Discover the latest smart devices and accessories at Al-Laith store.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    setCurrentView('catalog');
                  }}
                  className="px-6 py-2.5 rounded-full bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  {t('start_shopping')}
                </button>
              </div>
            ) : (
              cart.map((item, index) => {
                const title = isAr ? item.product.title_ar : item.product.title_en;
                const variantKey = JSON.stringify(item.selectedVariants);
                const variantString = Object.entries(item.selectedVariants)
                  .map(([_, v]) => `${v}`)
                  .join(' / ');

                const linePriceDual = formatDualPrice(item.product.price * item.quantity);

                return (
                  <div key={`${item.product.id}-${index}`} className="py-4 flex gap-4 items-start">
                    <img
                      src={item.product.images[0]}
                      alt={title}
                      className="w-20 h-20 aspect-square object-cover rounded-xl border border-stone-200 bg-stone-50 flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-2">
                          {title}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id, variantKey)}
                          className="text-stone-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {variantString && (
                        <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                          {variantString}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        {/* Quantity Stepper */}
                        <div className="flex items-center rounded-lg border border-stone-200 bg-stone-50 p-0.5">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1, variantKey)}
                            className="w-6 h-6 rounded bg-white text-stone-700 font-bold hover:bg-stone-100 flex items-center justify-center text-xs shadow-xs"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-stone-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1, variantKey)}
                            className="w-6 h-6 rounded bg-white text-stone-700 font-bold hover:bg-stone-100 flex items-center justify-center text-xs shadow-xs"
                          >
                            +
                          </button>
                        </div>

                        {/* Dual Price */}
                        <div className="text-right rtl:text-left">
                          <span className="text-xs sm:text-sm font-black text-stone-900 block">
                            {linePriceDual.primary}
                          </span>
                          <span className="text-[10px] text-stone-500">
                            ≈ {linePriceDual.secondary}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout Action */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-white space-y-3">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>{t('subtotal')}</span>
                  <span className="font-bold text-stone-900">{formatPrice(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('delivery_fee')}</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-700 font-bold">{t('free')}</span>
                    ) : (
                      <span className="font-bold text-stone-900">{formatPrice(deliveryFee)}</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-stone-900 pt-2 border-t border-stone-100">
                  <span>{t('total')}</span>
                  <div className="text-right rtl:text-left">
                    <span>{totalDual.primary}</span>
                    <span className="block text-[11px] text-stone-500 font-medium">≈ {totalDual.secondary}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Trigger Button */}
              <button
                id="cart-proceed-checkout-btn"
                type="button"
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 px-4 rounded-xl bg-stone-900 text-white font-bold text-sm hover:bg-stone-800 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>{t('proceed_to_checkout')}</span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-stone-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isAr ? 'دفع عند الاستلام مع فحص الجهاز' : 'Cash on Delivery with device inspection'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
