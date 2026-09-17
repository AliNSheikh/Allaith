import React, { useState } from 'react';
import {
  Palette,
  Sliders,
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  Sparkles,
  Save,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  Eye,
  Upload,
  Camera
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { HeroSlide } from '../../types';

export const HomepageContentView: React.FC = () => {
  const {
    locale,
    heroSlides,
    addHeroSlide,
    updateHeroSlide,
    deleteHeroSlide,
    storeSettings,
    updateStoreSettings,
    showToast
  } = useStore();

  const isAr = locale === 'ar';

  // Local state for store identity form
  const [settingsForm, setSettingsForm] = useState({ ...storeSettings });
  const [isSettingsSaved, setIsSettingsSaved] = useState(false);

  // Slide Modal State
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [slideToDelete, setSlideToDelete] = useState<HeroSlide | null>(null);
  const [slideForm, setSlideForm] = useState<{
    title_ar: string;
    title_en: string;
    subtitle_ar: string;
    subtitle_en: string;
    tag_ar: string;
    tag_en: string;
    button_text_ar: string;
    button_text_en: string;
    image: string;
    button_link: string;
  }>({
    title_ar: '',
    title_en: '',
    subtitle_ar: '',
    subtitle_en: '',
    tag_ar: '',
    tag_en: '',
    button_text_ar: 'تصفح الآن',
    button_text_en: 'Shop Now',
    image: '',
    button_link: '#catalog'
  });

  const handleBannerFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      showToast(isAr ? 'حجم الصورة كبير، يفضل اختيار صورة أقل من 8 ميغابايت' : 'Image too large, please select under 8MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSlideForm((prev) => ({ ...prev, image: reader.result as string }));
        showToast(isAr ? 'تم رفع وحفظ صورة البانر بنجاح!' : 'Banner photo uploaded successfully!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings(settingsForm);
    setIsSettingsSaved(true);
    setTimeout(() => setIsSettingsSaved(false), 2500);
  };

  const handleOpenAddSlide = () => {
    setEditingSlide(null);
    setSlideForm({
      title_ar: '',
      title_en: '',
      subtitle_ar: '',
      subtitle_en: '',
      tag_ar: 'عروض حصرية',
      tag_en: 'Exclusive Deals',
      button_text_ar: 'تصفح العروض',
      button_text_en: 'Explore Now',
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1600&q=85',
      button_link: '#catalog'
    });
    setIsSlideModalOpen(true);
  };

  const handleOpenEditSlide = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setSlideForm({
      title_ar: slide.title_ar || '',
      title_en: slide.title_en || '',
      subtitle_ar: slide.subtitle_ar || '',
      subtitle_en: slide.subtitle_en || '',
      tag_ar: slide.tag_ar || '',
      tag_en: slide.tag_en || '',
      button_text_ar: slide.button_text_ar || '',
      button_text_en: slide.button_text_en || '',
      image: slide.image || '',
      button_link: slide.button_link || '#catalog'
    });
    setIsSlideModalOpen(true);
  };

  const handleSaveSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideForm.title_ar.trim()) return;

    if (editingSlide) {
      updateHeroSlide(editingSlide.id, slideForm);
    } else {
      addHeroSlide(slideForm);
    }

    setIsSlideModalOpen(false);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banners Management */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-600" />
              <span>{isAr ? 'بانرات السلايدر الرئيسي في واجهة المتجر' : 'Homepage Hero Banners'}</span>
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              {isAr
                ? 'تعديل نصوص العروض، صور الخلفية، وعبارات الحث على الشراء التي تظهر في أعلى الصفحة الرئيسية'
                : 'Manage interactive hero slides, headlines, background images, and action buttons'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddSlide}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة بانر رئيسي جديد' : 'Add Hero Slide'}</span>
          </button>
        </div>

        {/* Hero Slides List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className="relative rounded-2xl border border-stone-200 overflow-hidden bg-stone-900 text-white flex flex-col group shadow-sm"
            >
              {/* Background Image Preview */}
              <div className="relative h-44 w-full bg-stone-950 overflow-hidden">
                <img
                  src={slide.image}
                  alt={slide.title_ar}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

                <span className="absolute top-3 left-3 rtl:left-auto rtl:right-3 px-2 py-0.5 rounded-full bg-emerald-500 text-stone-950 text-[10px] font-black">
                  {isAr ? slide.tag_ar : slide.tag_en}
                </span>

                <span className="absolute top-3 right-3 rtl:right-auto rtl:left-3 px-2 py-0.5 rounded-md bg-stone-900/80 text-stone-300 font-mono text-[10px]">
                  #{index + 1}
                </span>

                <div className="absolute bottom-3 right-3 left-3">
                  <h3 className="text-sm font-black text-white line-clamp-1">
                    {isAr ? slide.title_ar : slide.title_en}
                  </h3>
                  <p className="text-[11px] text-stone-300 line-clamp-1 mt-0.5">
                    {isAr ? slide.subtitle_ar : slide.subtitle_en}
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-3 bg-stone-950 flex items-center justify-between border-t border-stone-800 text-xs">
                <span className="text-[11px] text-stone-400 font-mono">
                  {slide.button_link || '#catalog'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditSlide(slide)}
                    className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors cursor-pointer"
                    title={isAr ? 'تعديل البانر' : 'Edit banner'}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (heroSlides.length <= 1) {
                        showToast(isAr ? 'يجب الإبقاء على بانر واحد على الأقل في المتجر' : 'At least one banner must remain in the store');
                        return;
                      }
                      setSlideToDelete(slide);
                    }}
                    className="p-1.5 rounded-lg bg-stone-800 hover:bg-rose-900 text-rose-400 transition-colors cursor-pointer"
                    title={isAr ? 'حذف البانر' : 'Delete'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Banner Slide Deletion Modal */}
      {slideToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-stone-200 p-6 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-stone-900">
                {isAr ? 'تأكيد حذف البانر' : 'Delete Banner?'}
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                {isAr
                  ? `هل أنت متأكد من رغبتك في حذف البانر "${slideToDelete.title_ar || slideToDelete.title_en}"؟ سيتم حذفه من واجهة المتجر وقاعدة بيانات Supabase.`
                  : `Are you sure you want to delete banner "${slideToDelete.title_en || slideToDelete.title_ar}"? This will also remove it from Supabase.`}
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSlideToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-bold hover:bg-stone-50 transition-colors cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteHeroSlide(slideToDelete.id);
                  setSlideToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-xs transition-colors cursor-pointer"
              >
                {isAr ? 'نعم، احذف البانر' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Store Information, Announcement & GPS Map Coordinates Form */}
      <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div>
            <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
              <Palette className="w-5 h-5 text-emerald-600" />
              <span>{isAr ? 'بيانات وهوية المتجر ومعلومات الموقع الجغرافي' : 'Store Identity, Location & Contacts'}</span>
            </h2>
            <p className="text-xs text-stone-500">
              {isAr
                ? 'تعديل أسماء المتجر، الشعار، أرقام الواتساب، إحداثيات خرائط جوجل، ومواعيد العمل'
                : 'Update store branding, contact info, exact Google Maps location, and working hours'}
            </p>
          </div>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-colors shadow-xs cursor-pointer"
          >
            {isSettingsSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{isSettingsSaved ? (isAr ? 'تم الحفظ!' : 'Saved!') : (isAr ? 'حفظ كافة التعديلات' : 'Save Changes')}</span>
          </button>
        </div>

        {/* Announcement Bar Settings */}
        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-amber-950 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{isAr ? 'شريط الإعلانات العلوي في المتجر (Announcement Bar)' : 'Top Announcement Bar'}</span>
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settingsForm.announcement_enabled}
                onChange={(e) => setSettingsForm({ ...settingsForm, announcement_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                {isAr ? 'نص الإعلان (عربي)' : 'Announcement Text (Arabic)'}
              </label>
              <input
                type="text"
                value={settingsForm.announcement_ar ?? ''}
                onChange={(e) => setSettingsForm({ ...settingsForm, announcement_ar: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                {isAr ? 'نص الإعلان (إنجليزي)' : 'Announcement Text (English)'}
              </label>
              <input
                type="text"
                value={settingsForm.announcement_en ?? ''}
                onChange={(e) => setSettingsForm({ ...settingsForm, announcement_en: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Store Name & Logo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {isAr ? 'اسم المتجر (عربي)' : 'Store Name (Arabic)'}
            </label>
            <input
              type="text"
              value={settingsForm.site_name_ar ?? ''}
              onChange={(e) => setSettingsForm({ ...settingsForm, site_name_ar: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {isAr ? 'اسم المتجر (إنجليزي)' : 'Store Name (English)'}
            </label>
            <input
              type="text"
              value={settingsForm.site_name_en ?? ''}
              onChange={(e) => setSettingsForm({ ...settingsForm, site_name_en: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {isAr ? 'نطاق الموقع الرسمي (Domain)' : 'Store Domain URL'}
            </label>
            <input
              type="text"
              value={settingsForm.site_domain || 'https://allaith.vercel.app'}
              onChange={(e) => setSettingsForm({ ...settingsForm, site_domain: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Logos Management (Header & Footer) with Upload and URL */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
          <h3 className="text-xs font-black text-stone-900 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-emerald-600" />
            <span>{isAr ? 'تخصيص شعار المتجر (Header & Footer Logos)' : 'Header & Footer Logos Customization'}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Header Logo */}
            <div className="bg-white p-3.5 rounded-xl border border-stone-200 space-y-2.5">
              <label className="block text-xs font-bold text-stone-800">
                {isAr ? 'شعار الترويسة العلوية (Header Logo)' : 'Header Logo'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={settingsForm.custom_logo_url || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, custom_logo_url: e.target.value })}
                  placeholder="https://... (رابط الشعار أو ارفعه أدناه)"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs"
                />
                <label className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer transition-colors" title={isAr ? 'رفع ملف صورة' : 'Upload file'}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === 'string') {
                          setSettingsForm(prev => ({ ...prev, custom_logo_url: reader.result as string }));
                          showToast(isAr ? 'تم تحميل شعار الترويسة بنجاح!' : 'Header logo uploaded!');
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="hidden"
                  />
                  <ImageIcon className="w-4 h-4" />
                </label>
              </div>
              {settingsForm.custom_logo_url && (
                <div className="p-2 bg-stone-100 rounded-lg flex items-center gap-3">
                  <img src={settingsForm.custom_logo_url} alt="Header Preview" className="h-8 w-auto max-w-[140px] object-contain" />
                  <span className="text-[10px] text-stone-500 font-mono">{isAr ? 'معاينة شعار الترويسة' : 'Header Preview'}</span>
                </div>
              )}
            </div>

            {/* Footer Logo */}
            <div className="bg-white p-3.5 rounded-xl border border-stone-200 space-y-2.5">
              <label className="block text-xs font-bold text-stone-800">
                {isAr ? 'شعار التذييل السفلي (Footer Logo)' : 'Footer Logo'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={settingsForm.footer_logo_url || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, footer_logo_url: e.target.value })}
                  placeholder="https://... (رابط شعار الفوتر أو ارفعه أدناه)"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs"
                />
                <label className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer transition-colors" title={isAr ? 'رفع ملف صورة' : 'Upload file'}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === 'string') {
                          setSettingsForm(prev => ({ ...prev, footer_logo_url: reader.result as string }));
                          showToast(isAr ? 'تم تحميل شعار الفوتر بنجاح!' : 'Footer logo uploaded!');
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="hidden"
                  />
                  <ImageIcon className="w-4 h-4" />
                </label>
              </div>
              {settingsForm.footer_logo_url && (
                <div className="p-2 bg-stone-900 rounded-lg flex items-center gap-3">
                  <img src={settingsForm.footer_logo_url} alt="Footer Preview" className="h-8 w-auto max-w-[140px] object-contain" />
                  <span className="text-[10px] text-stone-400 font-mono">{isAr ? 'معاينة شعار الفوتر (خلفية داكنة)' : 'Footer Preview'}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Exact Location & Google Maps GPS Coordinates */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-stone-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>{isAr ? 'موقع المتجر الجغرافي وخريطة جوجل المعتمدة' : 'Verified Google Maps Location & GPS'}</span>
            </h3>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
              35°31'29.7"N 35°51'09.2"E
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {isAr ? 'العنوان الفعلي (عربي)' : 'Physical Address (Arabic)'}
              </label>
              <input
                type="text"
                value={settingsForm.store_address_ar ?? ''}
                onChange={(e) => setSettingsForm({ ...settingsForm, store_address_ar: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {isAr ? 'العنوان الفعلي (إنجليزي)' : 'Physical Address (English)'}
              </label>
              <input
                type="text"
                value={settingsForm.store_address_en ?? ''}
                onChange={(e) => setSettingsForm({ ...settingsForm, store_address_en: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {isAr ? 'خط العرض (Latitude)' : 'Latitude'}
              </label>
              <input
                type="number"
                step="any"
                value={settingsForm.store_lat ?? 35.524917}
                onChange={(e) => setSettingsForm({ ...settingsForm, store_lat: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {isAr ? 'خط الطول (Longitude)' : 'Longitude'}
              </label>
              <input
                type="number"
                step="any"
                value={settingsForm.store_lng ?? 35.852556}
                onChange={(e) => setSettingsForm({ ...settingsForm, store_lng: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {isAr ? 'رابط خريطة جوجل المباشر' : 'Google Maps Link'}
              </label>
              <input
                type="url"
                value={settingsForm.google_maps_url || ''}
                onChange={(e) => setSettingsForm({ ...settingsForm, google_maps_url: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              />
            </div>
          </div>
        </div>

        {/* Contact Numbers & Working Hours */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {isAr ? 'رقم الواتساب للمبيعات والطلبات' : 'Sales WhatsApp Number'}
            </label>
            <input
              type="text"
              value={settingsForm.whatsapp_number ?? ''}
              onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp_number: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {isAr ? 'رقم واتساب قسم الصيانة المعتمدة' : 'Maintenance WhatsApp'}
            </label>
            <input
              type="text"
              value={settingsForm.maintenance_whatsapp ?? ''}
              onChange={(e) => setSettingsForm({ ...settingsForm, maintenance_whatsapp: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {isAr ? 'ساعات الدوام (عربي)' : 'Working Hours (Arabic)'}
            </label>
            <input
              type="text"
              value={settingsForm.store_hours_ar ?? ''}
              onChange={(e) => setSettingsForm({ ...settingsForm, store_hours_ar: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </form>

      {/* Slide Add/Edit Modal */}
      {isSlideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <h3 className="text-sm font-black text-stone-900">
                {editingSlide
                  ? isAr ? 'تعديل البانر الرئيسي' : 'Edit Hero Slide'
                  : isAr ? 'إضافة بانر جديد للواجهة' : 'Add Hero Slide'}
              </h3>
              <button
                type="button"
                onClick={() => setIsSlideModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSlide} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isAr ? 'العنوان الرئيسي (عربي) *' : 'Headline (Arabic) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={slideForm.title_ar ?? ''}
                    onChange={(e) => setSlideForm({ ...slideForm, title_ar: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isAr ? 'العنوان الرئيسي (إنجليزي)' : 'Headline (English)'}
                  </label>
                  <input
                    type="text"
                    value={slideForm.title_en ?? ''}
                    onChange={(e) => setSlideForm({ ...slideForm, title_en: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isAr ? 'النص التوضيحي (عربي)' : 'Subtitle (Arabic)'}
                  </label>
                  <input
                    type="text"
                    value={slideForm.subtitle_ar ?? ''}
                    onChange={(e) => setSlideForm({ ...slideForm, subtitle_ar: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isAr ? 'النص التوضيحي (إنجليزي)' : 'Subtitle (English)'}
                  </label>
                  <input
                    type="text"
                    value={slideForm.subtitle_en ?? ''}
                    onChange={(e) => setSlideForm({ ...slideForm, subtitle_en: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Banner Image Upload & URL */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-700">
                  {isAr ? 'صورة البانر الرئيسية *' : 'Main Banner Image *'}
                </label>

                {/* Upload Button + File Input */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer shrink-0">
                    <Upload className="w-4 h-4 text-emerald-600" />
                    <span>{isAr ? 'رفع صورة من جهازك' : 'Upload Banner Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerFileUpload}
                      className="hidden"
                    />
                  </label>

                  <div className="flex-1 text-[11px] text-stone-500 flex items-center">
                    <span>{isAr ? 'أو أدخل رابط صورة خارجي (Unsplash / CDN):' : 'Or enter external image URL:'}</span>
                  </div>
                </div>

                <input
                  type="text"
                  required
                  value={slideForm.image ?? ''}
                  onChange={(e) => setSlideForm({ ...slideForm, image: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="https://... أو اختر رفع صورة من جهازك"
                />

                {/* Image Preview */}
                {slideForm.image && (
                  <div className="relative rounded-xl overflow-hidden border border-stone-200 bg-stone-100 aspect-21/9 max-h-40 group">
                    <img
                      src={slideForm.image}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setSlideForm({ ...slideForm, image: '' })}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-rose-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{isAr ? 'حذف الصورة' : 'Remove Image'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isAr ? 'وسم البانر (عربي)' : 'Badge Tag (Arabic)'}
                  </label>
                  <input
                    type="text"
                    value={slideForm.tag_ar ?? ''}
                    onChange={(e) => setSlideForm({ ...slideForm, tag_ar: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="خصومات موسمية"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isAr ? 'رابط الزر (Target Link)' : 'CTA Link'}
                  </label>
                  <input
                    type="text"
                    value={slideForm.button_link ?? ''}
                    onChange={(e) => setSlideForm({ ...slideForm, button_link: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="#catalog"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsSlideModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs"
                >
                  {isAr ? 'حفظ البانر' : 'Save Slide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
