// Curated modern logo presets for the store
export interface LogoPreset {
  id: string;
  name_ar: string;
  name_en: string;
  svgDataUrl: string;
}

export const defaultStoreLogoSvg = '/al-laith-logo-horizontal.svg';

export const laithOfficialPresetSvg = '/al-laith-logo.svg';

export const logoPresets: LogoPreset[] = [
  {
    id: 'laith-official',
    name_ar: 'شعار الليث الأصلي (رمادي معدني وأخضر سيلادون)',
    name_en: 'Al-Laith Official (Metallic Slate & Sage)',
    svgDataUrl: '/al-laith-logo-horizontal.svg'
  },
  {
    id: 'telecom-modern',
    name_ar: 'تليكوم إكسبريس (أخضر وداكن)',
    name_en: 'Telecom Express (Emerald)',
    svgDataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 48" fill="none"><rect width="44" height="44" x="2" y="2" rx="12" fill="%2318181b"/><rect x="14" y="10" width="20" height="28" rx="3.5" stroke="%2358816c" stroke-width="2.2"/><circle cx="24" cy="33" r="1.2" fill="%2358816c"/><text x="56" y="27" font-family="sans-serif" font-weight="900" font-size="16" fill="%2318181b">TELECOM</text></svg>`
  },
  {
    id: 'cyber-circuit',
    name_ar: 'الدوائر الذكية (أزرق نيون)',
    name_en: 'Cyber Circuit (Cyan)',
    svgDataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 48" fill="none">
      <rect width="44" height="44" x="2" y="2" rx="12" fill="%230f172a" stroke="%2338bdf8" stroke-width="1.5"/>
      <circle cx="24" cy="24" r="11" stroke="%2338bdf8" stroke-width="2"/>
      <circle cx="24" cy="24" r="4" fill="%2338bdf8"/>
      <path d="M24 8v5M24 35v5M8 24h5M35 24h5" stroke="%2338bdf8" stroke-width="2" stroke-linecap="round"/>
      <text x="56" y="27" font-family="system-ui, sans-serif" font-weight="900" font-size="18" fill="%230f172a" letter-spacing="1.5">CYBER</text>
      <text x="56" y="38" font-family="system-ui, sans-serif" font-weight="700" font-size="8" fill="%230284c7" letter-spacing="2.5">SMART PHONES</text>
    </svg>`
  },
  {
    id: 'golden-crest',
    name_ar: 'الشعار الملكي الذهبي',
    name_en: 'Golden Flagship Crest',
    svgDataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 48" fill="none">
      <rect width="44" height="44" x="2" y="2" rx="12" fill="%231c1917" stroke="%23d97706" stroke-width="1.5"/>
      <path d="M14 30l4-14 6 8 6-8 4 14z" fill="%23f59e0b" stroke="%23d97706" stroke-width="1.5" stroke-linejoin="round"/>
      <circle cx="24" cy="14" r="1.5" fill="%23fbbf24"/>
      <text x="56" y="27" font-family="system-ui, sans-serif" font-weight="900" font-size="18" fill="%231c1917" letter-spacing="1.5">PRIME</text>
      <text x="56" y="38" font-family="system-ui, sans-serif" font-weight="700" font-size="8" fill="%23d97706" letter-spacing="2.5">FLAGSHIP STORE</text>
    </svg>`
  },
  {
    id: 'minimal-horizon',
    name_ar: 'الدرع التقني المينيمال',
    name_en: 'Minimal Tech Shield',
    svgDataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 48" fill="none">
      <rect width="44" height="44" x="2" y="2" rx="12" fill="%2327272a"/>
      <path d="M24 13l10 4v7c0 6-4.5 11-10 13-5.5-2-10-7-10-13v-7l10-4z" stroke="%2310b981" stroke-width="2" fill="none"/>
      <path d="M21 24l2.5 2.5 5-5" stroke="%2310b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="56" y="27" font-family="system-ui, sans-serif" font-weight="900" font-size="18" fill="%2327272a" letter-spacing="1.5">CERTIFIED</text>
      <text x="56" y="38" font-family="system-ui, sans-serif" font-weight="700" font-size="8" fill="%2310b981" letter-spacing="2.5">ORIGINAL LAB</text>
    </svg>`
  }
];
