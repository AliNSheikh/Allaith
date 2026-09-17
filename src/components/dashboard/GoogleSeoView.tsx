import React, { useState } from 'react';
import {
  Search,
  FileCode,
  Copy,
  Download,
  Check,
  ExternalLink,
  ShieldCheck,
  Globe,
  Radio,
  Sparkles,
  BarChart,
  Megaphone,
  Link as LinkIcon,
  CheckCircle2
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const GoogleSeoView: React.FC = () => {
  const {
    locale,
    storeSettings,
    updateStoreSettings,
    generateSitemapXml,
    generateRobotsTxt,
    showToast,
    products,
    categories
  } = useStore();

  const isAr = locale === 'ar';

  const [formSettings, setFormSettings] = useState({
    site_domain: storeSettings.site_domain || 'https://allaith.vercel.app',
    google_analytics_id: storeSettings.google_analytics_id || 'G-L8THSYRIA26',
    google_search_console_tag: storeSettings.google_search_console_tag || 'google-site-verification=allaith_telecom_syria_verified',
    google_ads_id: storeSettings.google_ads_id || 'AW-987654321',
    google_adsense_client: storeSettings.google_adsense_client || 'ca-pub-9988776655443322'
  });

  const [isCopiedSitemap, setIsCopiedSitemap] = useState(false);
  const [isCopiedSitemapUrl, setIsCopiedSitemapUrl] = useState(false);
  const [isCopiedRobots, setIsCopiedRobots] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const effectiveDomain = (formSettings.site_domain || (typeof window !== 'undefined' ? window.location.origin : 'https://allaith.vercel.app')).replace(/\/+$/, '');
  const sitemapLiveUrl = `${effectiveDomain}/sitemap.xml`;

  const xmlSitemap = generateSitemapXml();
  const robotsTxt = generateRobotsTxt();

  const handleSaveGoogleSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings(formSettings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleCopySitemap = () => {
    navigator.clipboard.writeText(xmlSitemap);
    setIsCopiedSitemap(true);
    showToast(isAr ? 'تم نسخ محتوى خريطة الموقع XML!' : 'Sitemap XML copied to clipboard!');
    setTimeout(() => setIsCopiedSitemap(false), 2000);
  };

  const handleCopySitemapUrl = () => {
    navigator.clipboard.writeText(sitemapLiveUrl);
    setIsCopiedSitemapUrl(true);
    showToast(isAr ? 'تم نسخ رابط sitemap.xml المباشر!' : 'Sitemap URL copied to clipboard!');
    setTimeout(() => setIsCopiedSitemapUrl(false), 2000);
  };

  const handleDownloadSitemap = () => {
    const blob = new Blob([xmlSitemap], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', 'sitemap.xml');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(isAr ? 'تم تنزيل ملف sitemap.xml بنجاح' : 'sitemap.xml downloaded');
  };

  const handleCopyRobots = () => {
    navigator.clipboard.writeText(robotsTxt);
    setIsCopiedRobots(true);
    showToast(isAr ? 'تم نسخ محتوى robots.txt' : 'robots.txt copied');
    setTimeout(() => setIsCopiedRobots(false), 2000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Description */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
              <Search className="w-5 h-5 text-emerald-600" />
              <span>{isAr ? 'حزمة خدمات Google الشاملة وخريطة الموقع Sitemap' : 'Google Suite Integration & XML Sitemap'}</span>
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              {isAr
                ? 'ربط أدوات مشرفي المواقع، تتبع الزيارات والتحويلات، وأرشفة صفحات المنتجات في محرك بحث Google'
                : 'Connect Google Analytics, Search Console, Ads, AdSense, and generate dynamic sitemaps'}
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200">
            <Radio className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span>Google Ecosystem Ready</span>
          </span>
        </div>
      </div>

      {/* Dedicated Live Sitemap Link Box (Requested by User) */}
      <div className="bg-emerald-900 text-white p-5 sm:p-6 rounded-2xl border border-emerald-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-800 text-emerald-300">
              <LinkIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">
                {isAr ? 'رابط ملف خريطة الموقع المباشر (Google XML Sitemap Link)' : 'Direct Live XML Sitemap Link'}
              </h3>
              <p className="text-xs text-emerald-200">
                {isAr ? 'انسخ هذا الرابط وأدخله مباشرة في Google Search Console لأرشفة المتجر' : 'Submit this exact link to Google Search Console to index the store'}
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-700 text-xs font-bold text-emerald-200 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isAr ? 'رابط نشط ومتوافق مع Google' : 'Active & Google-compliant'}</span>
          </span>
        </div>

        {/* URL Bar & Copy / Open Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
          <div className="flex-1 flex items-center px-3.5 py-2.5 bg-stone-950/90 rounded-xl border border-emerald-700/60 font-mono text-xs text-emerald-300 font-bold overflow-x-auto select-all shadow-inner">
            <Globe className="w-4 h-4 text-emerald-400 mr-2 rtl:ml-2 rtl:mr-0 shrink-0" />
            <span className="truncate">{sitemapLiveUrl}</span>
          </div>

          <button
            type="button"
            onClick={handleCopySitemapUrl}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-sm"
          >
            {isCopiedSitemapUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{isCopiedSitemapUrl ? (isAr ? 'تم نسخ الرابط!' : 'Copied Link!') : (isAr ? 'نسخ رابط Sitemap' : 'Copy Sitemap URL')}</span>
          </button>

          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 border border-white/15"
          >
            <ExternalLink className="w-4 h-4" />
            <span>{isAr ? 'فتح في نافذة جديدة' : 'Open XML in New Tab'}</span>
          </a>
        </div>
      </div>

      {/* Google Suite Configuration Form */}
      <form onSubmit={handleSaveGoogleSettings} className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h3 className="text-sm font-black text-stone-900">
            {isAr ? 'معرّفات ورموز التحقق لخدمات Google' : 'Google Services Credentials & Tracking IDs'}
          </h3>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-colors shadow-xs cursor-pointer"
          >
            {isSaved ? <Check className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            <span>{isSaved ? (isAr ? 'تم الحفظ!' : 'Saved!') : (isAr ? 'حفظ إعدادات Google' : 'Save Google Config')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Google Analytics 4 */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-xs">
              <BarChart className="w-4 h-4 text-amber-500" />
              <span>Google Analytics 4 (GA4)</span>
            </div>
            <label className="block text-[11px] text-stone-500 font-medium">
              {isAr ? 'معرّف القياس Measurement ID (يبدأ بـ G-)' : 'Measurement ID (e.g. G-XXXXX)'}
            </label>
            <input
              type="text"
              value={formSettings.google_analytics_id ?? ''}
              onChange={(e) => setFormSettings({ ...formSettings, google_analytics_id: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="G-L8THSYRIA26"
            />
          </div>

          {/* Google Search Console */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-xs">
              <Search className="w-4 h-4 text-blue-600" />
              <span>Google Search Console (مشرفي المواقع)</span>
            </div>
            <label className="block text-[11px] text-stone-500 font-medium">
              {isAr ? 'رمز التحقق Verification Meta Tag' : 'HTML Verification Tag or Token'}
            </label>
            <input
              type="text"
              value={formSettings.google_search_console_tag ?? ''}
              onChange={(e) => setFormSettings({ ...formSettings, google_search_console_tag: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="google-site-verification=..."
            />
          </div>

          {/* Google Ads */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-xs">
              <Megaphone className="w-4 h-4 text-emerald-600" />
              <span>Google Ads (إعلانات جوجل وتتبع التحويل)</span>
            </div>
            <label className="block text-[11px] text-stone-500 font-medium">
              {isAr ? 'معرّف تتبع الحملات Conversion ID (يبدأ بـ AW-)' : 'Conversion ID (e.g. AW-XXXXX)'}
            </label>
            <input
              type="text"
              value={formSettings.google_ads_id ?? ''}
              onChange={(e) => setFormSettings({ ...formSettings, google_ads_id: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="AW-987654321"
            />
          </div>

          {/* Google AdSense */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-xs">
              <Globe className="w-4 h-4 text-indigo-600" />
              <span>Google AdSense (برنامج الناشرين)</span>
            </div>
            <label className="block text-[11px] text-stone-500 font-medium">
              {isAr ? 'معرّف الناشر Publisher ID (يبدأ بـ ca-pub-)' : 'Publisher ID (e.g. ca-pub-XXXXX)'}
            </label>
            <input
              type="text"
              value={formSettings.google_adsense_client ?? ''}
              onChange={(e) => setFormSettings({ ...formSettings, google_adsense_client: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="ca-pub-9988776655443322"
            />
          </div>
        </div>
      </form>

      {/* Dynamic XML Sitemap Generator */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
              <FileCode className="w-5 h-5 text-emerald-600" />
              <span>{isAr ? 'خريطة الموقع التفاعلية (XML Sitemap)' : 'Dynamic XML Sitemap Generator'}</span>
            </h3>
            <p className="text-xs text-stone-500 font-medium">
              {isAr
                ? `تتضمن تلقائياً ${products.length} منتجاً و ${categories.length} أقسام تصنيفية متجددة يومياً`
                : `Automatically indexes all ${products.length} products and ${categories.length} categories`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySitemap}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
            >
              {isCopiedSitemap ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopiedSitemap ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ كود XML' : 'Copy XML')}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadSitemap}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isAr ? 'تحميل sitemap.xml' : 'Download sitemap.xml'}</span>
            </button>
          </div>
        </div>

        {/* XML Viewer Box */}
        <div className="relative rounded-xl bg-stone-950 p-4 font-mono text-xs text-stone-300 overflow-x-auto max-h-60 border border-stone-800">
          <pre>{xmlSitemap}</pre>
        </div>

        {/* Submission Guide */}
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-2 text-emerald-950">
          <span className="font-black block">
            {isAr ? '📌 خطوات تقديم الخريطة إلى Google Search Console:' : '📌 How to Submit to Google Search Console:'}
          </span>
          <ol className="list-decimal list-inside space-y-1 font-medium text-stone-700">
            <li>{isAr ? 'توجه إلى لوحة تحكم Google Search Console لموقعك.' : 'Open Google Search Console dashboard.'}</li>
            <li>{isAr ? 'من القائمة الجانبية، اختر "ملفات السايت ماب" (Sitemaps).' : 'Click "Sitemaps" in the left sidebar.'}</li>
            <li>{isAr ? 'أدخل الرابط: sitemap.xml واضغط "إرسال" (Submit).' : 'Enter "sitemap.xml" and hit Submit.'}</li>
          </ol>
        </div>
      </div>

      {/* Robots.txt Section */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-stone-900">
              {isAr ? 'ملف تعليمات محركات البحث (robots.txt)' : 'Robots.txt Generator'}
            </h3>
            <p className="text-xs text-stone-500">
              {isAr ? 'توجيه عناكب الفهرسة وتأمين روابط لوحة التحكم الخاصة' : 'Instructs web crawlers and protects private admin routes'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopyRobots}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
          >
            {isCopiedRobots ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isAr ? 'نسخ الملف' : 'Copy'}</span>
          </button>
        </div>

        <div className="rounded-xl bg-stone-950 p-4 font-mono text-xs text-stone-300 border border-stone-800">
          <pre>{robotsTxt}</pre>
        </div>
      </div>
    </div>
  );
};
