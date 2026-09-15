/**
 * Slug and SKU utilities with duplicate prevention
 */

// Simple transliteration map for Arabic to Latin characters for SEO URLs
const ARABIC_TO_LATIN: { [key: string]: string } = {
  'أ': 'a', 'إ': 'e', 'آ': 'a', 'ا': 'a', 'ب': 'b', 'ت': 't', 'ث': 'th',
  'ج': 'j', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'th', 'ر': 'r', 'ز': 'z',
  'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': 'a',
  'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
  'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'a', 'ة': 'h', 'ء': 'a', 'ئ': 'y', 'ؤ': 'o',
  'پ': 'p', 'چ': 'ch', 'ژ': 'zh', 'ڤ': 'v', 'گ': 'g'
};

export function slugifyText(text: string): string {
  if (!text) return '';

  let converted = text.trim();

  // If text contains English, prefer English words
  const englishMatches = converted.match(/[a-zA-Z0-9]+/g);
  if (englishMatches && englishMatches.join(' ').length >= 3) {
    return englishMatches
      .join('-')
      .toLowerCase()
      .replace(/[^\w-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  // Transliterate Arabic
  let latin = '';
  for (const char of converted) {
    if (ARABIC_TO_LATIN[char]) {
      latin += ARABIC_TO_LATIN[char];
    } else if (/[a-zA-Z0-9]/.test(char)) {
      latin += char.toLowerCase();
    } else if (/\s|[-_]/.test(char)) {
      latin += '-';
    }
  }

  const clean = latin
    .toLowerCase()
    .replace(/[^\w-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return clean || `item-${Date.now().toString().slice(-6)}`;
}

/**
 * Generate a guaranteed unique slug by checking against existing items
 */
export function generateUniqueSlug(
  baseTitle: string,
  existingSlugs: string[],
  currentId?: string,
  existingItems?: { id: string; slug: string }[]
): { slug: string; isDuplicateFound: boolean } {
  let baseSlug = slugifyText(baseTitle);
  if (!baseSlug) baseSlug = 'item';

  // Filter out the current item if editing
  const reservedSlugs = new Set<string>();
  if (existingItems && currentId) {
    existingItems.forEach(item => {
      if (item.id !== currentId && item.slug) {
        reservedSlugs.add(item.slug.toLowerCase());
      }
    });
  } else {
    existingSlugs.forEach(s => {
      if (s) reservedSlugs.add(s.toLowerCase());
    });
  }

  if (!reservedSlugs.has(baseSlug.toLowerCase())) {
    return { slug: baseSlug, isDuplicateFound: false };
  }

  // Duplicate detected! Append sequential counter
  let counter = 2;
  let candidateSlug = `${baseSlug}-${counter}`;
  while (reservedSlugs.has(candidateSlug.toLowerCase())) {
    counter++;
    candidateSlug = `${baseSlug}-${counter}`;
  }

  return { slug: candidateSlug, isDuplicateFound: true };
}

/**
 * Check whether a slug already exists
 */
export function checkIsSlugDuplicate(
  slug: string,
  existingItems: { id: string; slug: string }[],
  currentId?: string
): boolean {
  const target = slug.trim().toLowerCase();
  if (!target) return false;
  return existingItems.some(
    item => item.id !== currentId && item.slug?.trim().toLowerCase() === target
  );
}

/**
 * Generate a unique, professional SKU for a product
 * Format: LTH-[BRAND]-[CAT]-[4-DIGIT-NUM]
 */
export function generateUniqueSku(
  brand: string,
  categoryNameOrId: string,
  existingSkus: string[]
): string {
  const brandCode = (brand || 'GEN')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 3)
    .toUpperCase() || 'LTH';

  const catCode = (categoryNameOrId || 'DEV')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 3)
    .toUpperCase() || 'DEV';

  const reserved = new Set(existingSkus.map(s => (s || '').trim().toUpperCase()));

  for (let i = 0; i < 50; i++) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const candidateSku = `LTH-${brandCode}-${catCode}-${randomNum}`;
    if (!reserved.has(candidateSku)) {
      return candidateSku;
    }
  }

  return `LTH-${brandCode}-${Date.now().toString().slice(-4)}`;
}
