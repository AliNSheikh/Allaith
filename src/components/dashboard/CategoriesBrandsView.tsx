import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Tag,
  Check,
  X,
  Smartphone,
  Tablet,
  Laptop,
  Headphones,
  Watch,
  FolderPlus,
  Archive,
  ArchiveRestore,
  Save,
  Link,
  Copy,
  Upload,
  Image as ImageIcon,
  Eye,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Category } from '../../types';
import { slugifyText } from '../../utils/slugAndSku';

export const CategoriesBrandsView: React.FC = () => {
  const {
    locale,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    archiveCategory,
    brands,
    addBrand,
    deleteBrand,
    products,
    showToast
  } = useStore();

  const isAr = locale === 'ar';

  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSavingGlobal, setIsSavingGlobal] = useState(false);
  const [archiveFilter, setArchiveFilter] = useState<'all' | 'active' | 'archived'>('active');

  const [catForm, setCatForm] = useState<{
    name_ar: string;
    name_en: string;
    slug: string;
    image_url: string;
    icon_name: string;
  }>({
    name_ar: '',
    name_en: '',
    slug: '',
    image_url: '',
    icon_name: 'smartphone'
  });

  const [newBrandName, setNewBrandName] = useState('');

  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCatForm({
      name_ar: '',
      name_en: '',
      slug: '',
      image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80',
      icon_name: 'smartphone'
    });
    setIsCatModalOpen(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCatForm({
      name_ar: cat.name_ar,
      name_en: cat.name_en,
      slug: cat.slug,
      image_url: cat.image_url || '',
      icon_name: cat.icon_name || 'smartphone'
    });
    setIsCatModalOpen(true);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCatForm(prev => ({ ...prev, image_url: reader.result as string }));
        showToast(isAr ? 'تم تحميل صورة الفئة بنجاح!' : 'Category image uploaded!');
      }
    };
    reader.readAsDataURL(file);
  };

  const isCatSlugDuplicate = (targetSlug: string) => {
    if (!targetSlug.trim()) return false;
    const clean = targetSlug.trim().toLowerCase();
    return categories.some(c => (!editingCategory || c.id !== editingCategory.id) && c.slug?.toLowerCase() === clean);
  };

  const handleAutoGenerateCatSlug = () => {
    const raw = catForm.name_en.trim() || catForm.name_ar.trim() || 'category';
    let base = slugifyText(raw);
    let candidate = base;
    let counter = 1;
    while (categories.some(c => (!editingCategory || c.id !== editingCategory.id) && c.slug?.toLowerCase() === candidate.toLowerCase())) {
      candidate = `${base}-${counter}`;
      counter++;
    }
    setCatForm(prev => ({ ...prev, slug: candidate }));
    showToast(isAr ? `تم توليد رابط الفئة الفريد: ${candidate}` : `Generated unique category URL: ${candidate}`);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name_ar.trim()) return;

    const raw = catForm.slug.trim() || catForm.name_en.trim() || catForm.name_ar.trim() || 'category';
    let cleanSlug = slugifyText(raw);
    let candidate = cleanSlug;
    let counter = 1;
    while (categories.some(c => (!editingCategory || c.id !== editingCategory.id) && c.slug?.toLowerCase() === candidate.toLowerCase())) {
      candidate = `${cleanSlug}-${counter}`;
      counter++;
    }

    const payload = {
      name_ar: catForm.name_ar.trim(),
      name_en: catForm.name_en.trim() || catForm.name_ar.trim(),
      slug: candidate,
      image_url: catForm.image_url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80',
      icon_name: catForm.icon_name,
      sort_order: editingCategory ? editingCategory.sort_order : categories.length + 1
    };

    if (editingCategory) {
      updateCategory(editingCategory.id, payload);
    } else {
      addCategory(payload);
    }

    setIsCatModalOpen(false);
  };

  const handleAddBrandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    addBrand(newBrandName.trim());
    setNewBrandName('');
  };

  const handleGlobalSave = () => {
    setIsSavingGlobal(true);
    setTimeout(() => {
      setIsSavingGlobal(false);
      showToast(isAr ? 'تم حفظ كافة بيانات الفئات والماركات بنجاح!' : 'Categories & brands saved successfully!');
    }, 400);
  };

  const filteredCategories = categories.filter((c) => {
    if (archiveFilter === 'all') return true;
    if (archiveFilter === 'archived') return !!c.is_archived;
    return !c.is_archived;
  });

  return (
    <div className="space-y-6 pb-12" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Top Header & Save Changes Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <span>{isAr ? 'إدارة الفئات التصنيفية والماركات والروابط' : 'Categories, Brands & Slugs'}</span>
          </h2>
          <p className="text-xs text-stone-500 font-medium">
            {isAr
              ? 'إنشاء فئات بروابط مخصصة، رفع صور الفئات، والأرشفة الفورية'
              : 'Custom URL slugs, category images, brand management, and archiving'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleGlobalSave}
            disabled={isSavingGlobal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
          >
            {isSavingGlobal ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isAr ? 'حفظ التعديلات' : 'Save Changes'}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddCategory}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-400 text-xs font-black transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة فئة جديدة' : 'Add Category'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-xl bg-stone-100 p-1 border border-stone-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setArchiveFilter('active')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              archiveFilter === 'active' ? 'bg-white text-emerald-800 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {isAr ? `الفئات المعروضة (${categories.filter(c => !c.is_archived).length})` : 'Active'}
          </button>
          <button
            type="button"
            onClick={() => setArchiveFilter('archived')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              archiveFilter === 'archived' ? 'bg-amber-500 text-stone-950 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {isAr ? `المؤرشفة (${categories.filter(c => c.is_archived).length})` : 'Archived'}
          </button>
          <button
            type="button"
            onClick={() => setArchiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              archiveFilter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {isAr ? `الكل (${categories.length})` : 'All'}
          </button>
        </div>
      </div>

      {/* Categories Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((cat) => {
          const productCount = products.filter((p) => p.category_id === cat.id).length;
          const catUrl = `${window.location.origin}/#catalog?category=${cat.slug}`;

          return (
            <div
              key={cat.id}
              className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs transition-all relative overflow-hidden ${
                cat.is_archived ? 'border-amber-300 bg-amber-50/20' : 'border-stone-200/90'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={cat.image_url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100'}
                    alt={cat.name_ar}
                    className="w-12 h-12 rounded-xl object-cover border border-stone-200 bg-stone-50 shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm">
                      {isAr ? cat.name_ar : cat.name_en}
                    </h3>
                    <p className="text-xs text-stone-400 font-mono mt-0.5">
                      {cat.name_en}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                {cat.is_archived ? (
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                    {isAr ? 'مؤرشفة' : 'Archived'}
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {isAr ? 'معروضة' : 'Active'}
                  </span>
                )}
              </div>

              {/* Dedicated Slug / URL */}
              <div className="mt-3 p-2 bg-stone-50 rounded-xl border border-stone-200/80 flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-stone-600 truncate max-w-[200px]">
                  #{cat.slug}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(catUrl);
                    showToast(isAr ? 'تم نسخ الرابط الفريد للفئة!' : 'Category URL copied!');
                  }}
                  title={isAr ? 'نسخ الرابط المباشر' : 'Copy direct link'}
                  className="p-1 rounded text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs text-stone-500 font-semibold">
                  {productCount} {isAr ? 'منتج مرتبط' : 'Products'}
                </span>

                <div className="flex items-center gap-1">
                  {/* Archive / Unarchive */}
                  <button
                    type="button"
                    onClick={() => archiveCategory(cat.id, !cat.is_archived)}
                    title={cat.is_archived ? (isAr ? 'إلغاء الأرشفة' : 'Unarchive') : (isAr ? 'أرشفة الفئة' : 'Archive')}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      cat.is_archived ? 'text-emerald-700 hover:bg-emerald-50' : 'text-amber-600 hover:bg-amber-50'
                    }`}
                  >
                    {cat.is_archived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEditCategory(cat)}
                    className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                    title={isAr ? 'تعديل' : 'Edit'}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(isAr ? `حذف فئة ${cat.name_ar}؟` : `Delete ${cat.name_en}?`)) {
                        deleteCategory(cat.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title={isAr ? 'حذف' : 'Delete'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Brands Section */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-500" />
              <span>{isAr ? 'الماركات والعلامات التجارية المعتمدة' : 'Brands & Manufacturers'}</span>
            </h3>
            <p className="text-xs text-stone-500">
              {isAr ? 'الماركات المعتمدة في متجر الليث (آبل، سامسونغ، شاومي، وغيرها)' : 'Brands available in catalog'}
            </p>
          </div>

          <form onSubmit={handleAddBrandSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              placeholder={isAr ? 'اسم ماركة جديدة...' : 'Brand name...'}
              className="px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-stone-900 text-amber-400 text-xs font-bold transition-colors cursor-pointer"
            >
              {isAr ? 'إضافة' : 'Add'}
            </button>
          </form>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {brands.map((brand) => (
            <div
              key={brand}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100 text-stone-800 text-xs font-bold border border-stone-200/80"
            >
              <span>{brand}</span>
              <button
                type="button"
                onClick={() => deleteBrand(brand)}
                className="text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/60">
              <h3 className="text-sm font-black text-stone-900">
                {editingCategory ? (isAr ? 'تعديل الفئة' : 'Edit Category') : (isAr ? 'إضافة فئة جديدة' : 'Add Category')}
              </h3>
              <button
                type="button"
                onClick={() => setIsCatModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">{isAr ? 'اسم الفئة بالعربية *' : 'Name (Arabic) *'}</label>
                <input
                  type="text"
                  value={catForm.name_ar}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCatForm(prev => ({
                      ...prev,
                      name_ar: val,
                      slug: prev.slug || val.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
                    }));
                  }}
                  required
                  placeholder="مثال: الهواتف الذكية"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">{isAr ? 'اسم الفئة بالإنجليزية' : 'Name (English)'}</label>
                <input
                  type="text"
                  value={catForm.name_en}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCatForm(prev => ({
                      ...prev,
                      name_en: val,
                      slug: val.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
                    }));
                  }}
                  placeholder="e.g. Smartphones"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Dedicated Category Slug with Auto-generate & Duplicate check */}
              <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-amber-950 flex items-center gap-1">
                    <Link className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isAr ? 'الرابط المخصص للفئة (Category URL / Slug):' : 'Category URL Slug:'}</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoGenerateCatSlug}
                    className="px-2 py-0.5 bg-amber-200 hover:bg-amber-300 text-amber-950 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-amber-700" />
                    <span>{isAr ? 'توليد تلقائي' : 'Auto Generate'}</span>
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-stone-500 shrink-0 select-none">
                    #category/
                  </span>
                  <input
                    type="text"
                    value={catForm.slug}
                    onChange={(e) => setCatForm(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                    placeholder="smartphones"
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 font-mono text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                {catForm.slug.trim() && (
                  <div>
                    {isCatSlugDuplicate(catForm.slug) ? (
                      <div className="flex items-center gap-1 text-rose-600 text-[10px] font-bold bg-rose-50 px-2 py-1 rounded-md border border-rose-200">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{isAr ? 'هذا الرابط مكرر ومستخدم لفئة أخرى! اضغط توليد تلقائي لتفاديه.' : 'This URL is already taken! Click Auto Generate.'}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-emerald-700 text-[10px] font-bold bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 shrink-0 text-emerald-600" />
                        <span>{isAr ? 'رابط فريد ومتاح للفئة' : 'Unique category URL'}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Category Image Upload & URL */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center justify-between">
                  <span>{isAr ? 'صورة الفئة' : 'Category Image'}</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-emerald-400 bg-emerald-50/50 text-emerald-800 text-xs font-bold cursor-pointer hover:bg-emerald-100/50 transition-colors">
                    <Upload className="w-4 h-4 text-emerald-600" />
                    <span>{isAr ? 'رفع صورة من جهازك' : 'Upload Image File'}</span>
                    <input type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" />
                  </label>
                  <input
                    type="url"
                    value={catForm.image_url}
                    onChange={(e) => setCatForm(prev => ({ ...prev, image_url: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs"
                  />
                  {catForm.image_url && (
                    <img src={catForm.image_url} alt="" className="w-16 h-16 rounded-xl object-cover border border-stone-200" />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 text-xs font-bold"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-xs cursor-pointer"
                >
                  {editingCategory ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : (isAr ? 'إنشاء الفئة' : 'Create Category')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
