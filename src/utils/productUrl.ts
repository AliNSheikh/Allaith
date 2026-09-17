import { Product } from '../types';

/**
 * Returns the unique slug or fallback ID for a product
 */
export function getProductUniqueSlug(product: { id: string; slug?: string }): string {
  if (product.slug && product.slug.trim()) {
    return product.slug.trim();
  }
  return product.id;
}

/**
 * Returns the public direct shareable URL for a product.
 * Uses hash format (#product/:slug) which works across all CDNs, static hosting, and proxies.
 */
export function getProductShareableUrl(
  product: { id: string; slug?: string },
  customDomain?: string
): string {
  let origin = '';
  if (customDomain && customDomain.trim()) {
    origin = customDomain.trim().replace(/\/+$/, '');
  } else if (typeof window !== 'undefined' && window.location.origin) {
    origin = window.location.origin;
  } else {
    origin = 'https://allaith.vercel.app';
  }

  const slug = getProductUniqueSlug(product);
  return `${origin}/#product/${slug}`;
}

/**
 * Returns a pre-filled WhatsApp share URL for a product
 */
export function getProductWhatsAppShareUrl(
  product: Product,
  customDomain?: string,
  currencyAr = 'ل.س'
): string {
  const url = getProductShareableUrl(product, customDomain);
  const priceFormatted = product.pricing_type === 'inquire'
    ? 'السعر عند الطلب'
    : `${product.price.toLocaleString()} ${currencyAr}`;

  const message = `✨ تفقد هذا المنتج من *متجر ومخبر الليث للاتصالات*:\n\n📱 *${product.title_ar}*\n🏷️ الماركة: ${product.brand}\n💰 السعر: ${priceFormatted}\n\n🔗 اضغط على الرابط التالي لمشاهدة كافة المواصفات والطلب مباشرة:\n${url}`;

  return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}

/**
 * Returns a Telegram share URL for a product
 */
export function getProductTelegramShareUrl(
  product: Product,
  customDomain?: string
): string {
  const url = getProductShareableUrl(product, customDomain);
  const text = `🌟 تفقد منتج "${product.title_ar}" من متجر الليث للاتصالات`;
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
}

/**
 * Returns a Facebook share URL for a product
 */
export function getProductFacebookShareUrl(
  product: Product,
  customDomain?: string
): string {
  const url = getProductShareableUrl(product, customDomain);
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}
