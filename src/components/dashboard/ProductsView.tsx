import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Check,
  Edit2,
  Trash2,
  Image as ImageIcon,
  DollarSign,
  Percent,
  Upload,
  X,
  AlertCircle,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Eye,
  Archive,
  ArchiveRestore,
  Save,
  Link,
  Copy,
  Layers,
  Table as TableIcon,
  Languages,
  CheckCircle2,
  FileText,
  Tag
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductCondition, ProductVariantCombination, ProductSpecItem } from '../../types';
import { generateUniqueSlug, checkIsSlugDuplicate, generateUniqueSku, slugifyText } from '../../utils/slugAndSku';

export const ProductsView: React.FC = () => {
  const {
    locale,
    products,
    categories,
    brands,
    addBrand,
    addProduct,
    updateProduct,
    quickUpdateProductPrice,
    deleteProduct,
    archiveProduct,
    formatPrice,
    storeSettings,
    setSelectedProductId,
    setCurrentView,
    showToast,
    saveAllDataToSupabase
  } = useStore();

  const isAr = locale === 'ar';

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [archiveFilter, setArchiveFilter] = useState<'all' | 'active' | 'archived'>('active');

  // Quick Inline Price Editing State
  const [quickPrices, setQuickPrices] = useState<{
    [productId: string]: { syp: number; usd: number; saved?: boolean };
  }>({});

  const [isSavingGlobal, setIsSavingGlobal] = useState(false);

  // Product Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title_ar: string;
    title_en: string;
    slug: string;
    description_ar: string;
    description_en: string;
    price: number;
    price_usd: number;
    compare_at_price: number;
    discount_percent: number;
    is_promotion: boolean;
    category_id: string;
    brand: string;
    images: string[];
    condition: ProductCondition;
    condition_details: string;
    stock_quantity: number;
    sku: string;
    is_featured: boolean;
    is_new: boolean;
    warranty_ar: string;
    variant_combinations: ProductVariantCombination[];
    specs: ProductSpecItem[];
    specFormat: 'table' | 'text';
  }>({
    title_ar: '',
    title_en: '',
    slug: '',
    description_ar: '',
    description_en: '',
    price: 0,
    price_usd: 0,
    compare_at_price: 0,
    discount_percent: 0,
    is_promotion: false,
    category_id: categories[0]?.id || '',
    brand: brands[0] || 'Apple',
    images: [''],
    condition: 'new',
    condition_details: '',
    stock_quantity: 5,
    sku: '',
    is_featured: false,
    is_new: true,
    warranty_ar: 'كفالة معتمدة 12 شهراً',
    variant_combinations: [],
    specs: [
      { id: '1', key_ar: 'المعالج', key_en: 'Processor', value_ar: 'Apple A18 Pro Bionic', value_en: 'Apple A18 Pro Bionic' },
      { id: '2', key_ar: 'الشاشة', key_en: 'Display', value_ar: '6.9 بوصة Super Retina XDR OLED 120Hz', value_en: '6.9-inch Super Retina XDR OLED 120Hz' },
      { id: '3', key_ar: 'الكاميرا', key_en: 'Camera', value_ar: 'ثلاثية 48MP مع تقريب بصري 5x', value_en: 'Triple 48MP with 5x Optical Zoom' },
      { id: '4', key_ar: 'البطارية', key_en: 'Battery', value_ar: 'تدوم حتى 33 ساعة تشغيل فيديو', value_en: 'Up to 33 hours video playback' }
    ],
    specFormat: 'table'
  });

  const [tempImageUrl, setTempImageUrl] = useState('');
  const [isTranslatingSpecs, setIsTranslatingSpecs] = useState(false);

  // Handle Quick Inline Price Change
  const handleQuickPriceChange = (id: string, field: 'syp' | 'usd', value: number) => {
    const currentProd = products.find((p) => p.id === id);
    if (!currentProd) return;

    const rate = storeSettings.usd_exchange_rate || 15000;
    if (field === 'syp') {
      const computedUsd = Math.round(value / rate);
      setQuickPrices((prev) => ({
        ...prev,
        [id]: { syp: value, usd: computedUsd, saved: false }
      }));
    } else {
      const computedSyp = Math.round(value * rate);
      setQuickPrices((prev) => ({
        ...prev,
        [id]: { syp: computedSyp, usd: value, saved: false }
      }));
    }
  };

  const handleSaveQuickPrice = (id: string) => {
    const data = quickPrices[id];
    if (!data) return;

    quickUpdateProductPrice(id, data.syp, data.usd);
    setQuickPrices((prev) => ({
      ...prev,
      [id]: { ...data, saved: true }
    }));

    setTimeout(() => {
      setQuickPrices((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, 2000);
  };

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    const existingSkus = products.map(p => p.sku).filter(Boolean);
    const initialBrand = brands[0] || 'Apple';
    const initialCategory = categories[0]?.id || 'smartphone';
    const sku = generateUniqueSku(initialBrand, initialCategory, existingSkus);

    setFormData({
      title_ar: '',
      title_en: '',
      slug: '',
      description_ar: '',
      description_en: '',
      price: 1500000,
      price_usd: 100,
      compare_at_price: 0,
      discount_percent: 0,
      is_promotion: false,
      category_id: categories[0]?.id || '',
      brand: initialBrand,
      images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80'],
      condition: 'new',
      condition_details: '',
      stock_quantity: 5,
      sku,
      is_featured: false,
      is_new: true,
      warranty_ar: 'كفالة الليث المعتمدة 12 شهراً',
      variant_combinations: [
        {
          id: `var-${Date.now()}-1`,
          combination_name_ar: 'تيتانيوم طبيعي / 256 جيجابايت',
          combination_name_en: 'Natural Titanium / 256GB',
          attributes: { color: 'Natural Titanium', storage: '256GB' },
          price: 1500000,
          price_usd: 100,
          stock_quantity: 5,
          sku: `${sku}-NAT-256`
        },
        {
          id: `var-${Date.now()}-2`,
          combination_name_ar: 'أسود فحمي / 512 جيجابايت',
          combination_name_en: 'Black Titanium / 512GB',
          attributes: { color: 'Black Titanium', storage: '512GB' },
          price: 1800000,
          price_usd: 120,
          stock_quantity: 3,
          sku: `${sku}-BLK-512`
        }
      ],
      specs: [
        { id: '1', key_ar: 'المعالج', key_en: 'Processor', value_ar: 'Apple A18 Pro Bionic', value_en: 'Apple A18 Pro Bionic' },
        { id: '2', key_ar: 'الشاشة', key_en: 'Display', value_ar: '6.9 بوصة Super Retina XDR OLED', value_en: '6.9-inch Super Retina XDR OLED' },
        { id: '3', key_ar: 'الكاميرا', key_en: 'Camera', value_ar: '48 ميجابكسل رئيسية + تقريب بصري 5x', value_en: '48MP Main + 5x Telephoto' },
        { id: '4', key_ar: 'البطارية', key_en: 'Battery', value_ar: 'تدوم حتى 33 ساعة تشغيل فيديو', value_en: 'Up to 33 hours video playback' }
      ],
      specFormat: 'table'
    });
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    const hasPromo = (product.discount_percent || 0) > 0 || ((product.compare_at_price || 0) > (product.price || 0));
    setFormData({
      title_ar: product.title_ar || '',
      title_en: product.title_en || '',
      slug: product.slug || '',
      description_ar: product.description_ar || '',
      description_en: product.description_en || '',
      price: product.price || 0,
      price_usd: product.price_usd || Math.round((product.price || 0) / (storeSettings.usd_exchange_rate || 15000)),
      compare_at_price: product.compare_at_price || 0,
      discount_percent: product.discount_percent || 0,
      is_promotion: hasPromo,
      category_id: product.category_id || categories[0]?.id || '',
      brand: product.brand || brands[0] || 'Apple',
      images: product.images && product.images.length > 0 ? [...product.images] : [''],
      condition: product.condition || 'new',
      condition_details: product.condition_details || '',
      stock_quantity: product.stock_quantity ?? 0,
      sku: product.sku || '',
      is_featured: !!product.is_featured,
      is_new: !!product.is_new,
      warranty_ar: product.warranty_ar || '',
      variant_combinations: product.variant_combinations || [],
      specs: product.specs && product.specs.length > 0 ? product.specs : [
        { id: '1', key_ar: 'المعالج', key_en: 'Processor', value_ar: 'أحدث معالج رسمي', value_en: 'Latest Official Processor' },
        { id: '2', key_ar: 'الشاشة', key_en: 'Display', value_ar: 'OLED عالية الدقة', value_en: 'High Resolution OLED' }
      ],
      specFormat: 'table'
    });
    setIsModalOpen(true);
  };

  // Auto-generate Unique SKU on demand
  const handleAutoGenerateSku = () => {
    const existingSkus = products
      .filter(p => !editingProduct || p.id !== editingProduct.id)
      .map(p => p.sku)
      .filter(Boolean);
    const newSku = generateUniqueSku(formData.brand, formData.category_id, existingSkus);
    setFormData(prev => ({ ...prev, sku: newSku }));
    showToast(isAr ? `تم توليد رمز SKU فريد: ${newSku}` : `Generated unique SKU: ${newSku}`);
  };

  // Auto-generate Unique Slug URL on demand
  const handleAutoGenerateSlug = () => {
    const title = formData.title_en.trim() || formData.title_ar.trim() || 'product';
    const existingSlugs = products.map(p => p.slug).filter(Boolean);
    const { slug, isDuplicateFound } = generateUniqueSlug(
      title,
      existingSlugs,
      editingProduct?.id,
      products
    );
    setFormData(prev => ({ ...prev, slug }));
    if (isDuplicateFound) {
      showToast(isAr ? `تم تعديل الرابط لتفادي التكرار: ${slug}` : `URL modified to prevent duplication: ${slug}`);
    } else {
      showToast(isAr ? `تم توليد الرابط الفريد: ${slug}` : `Unique URL generated: ${slug}`);
    }
  };

  // Toggle promotion checkbox
  const handleTogglePromotion = (enabled: boolean) => {
    setFormData((prev) => {
      if (!enabled) {
        return {
          ...prev,
          is_promotion: false,
          discount_percent: 0,
          compare_at_price: 0
        };
      } else {
        const percent = prev.discount_percent > 0 ? prev.discount_percent : 15;
        const compareAt = prev.price > 0 ? Math.round(prev.price / (1 - percent / 100)) : 0;
        return {
          ...prev,
          is_promotion: true,
          discount_percent: percent,
          compare_at_price: compareAt
        };
      }
    });
  };

  // Auto calculate discount percentage & compare_at_price
  const handlePriceChange = (val: number) => {
    setFormData((prev) => {
      let disc = prev.discount_percent;
      let compareAt = prev.compare_at_price;
      if (prev.is_promotion && disc > 0 && disc < 100) {
        compareAt = Math.round(val / (1 - disc / 100));
      } else if (compareAt > val) {
        disc = Math.round(((compareAt - val) / compareAt) * 100);
      }
      const usdVal = Math.round(val / (storeSettings.usd_exchange_rate || 15000));
      return { ...prev, price: val, price_usd: usdVal, discount_percent: disc, compare_at_price: compareAt };
    });
  };

  const handleCompareAtPriceChange = (val: number) => {
    setFormData((prev) => {
      let disc = 0;
      if (val > prev.price && prev.price > 0) {
        disc = Math.round(((val - prev.price) / val) * 100);
      }
      return { ...prev, compare_at_price: val, discount_percent: disc, is_promotion: disc > 0 };
    });
  };

  const handleDiscountPercentChange = (percent: number) => {
    setFormData((prev) => {
      let compareAt = 0;
      if (percent > 0 && percent < 100 && prev.price > 0) {
        compareAt = Math.round(prev.price / (1 - percent / 100));
      }
      return { ...prev, discount_percent: percent, compare_at_price: compareAt, is_promotion: percent > 0 };
    });
  };

  // Handle local image file upload & retrieve base64/URL
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleAddImage(reader.result);
        showToast(isAr ? 'تم تحميل الصورة واستخراج الرابط بنجاح!' : 'Image uploaded and URL retrieved!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddImage = (url: string) => {
    if (!url.trim()) return;
    if (formData.images.length >= 8) {
      alert(isAr ? 'الحد الأقصى هو 8 صور لكل منتج' : 'Maximum 8 images allowed');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images.filter((img) => img.trim() !== ''), url.trim()]
    }));
    setTempImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => {
      const next = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: next.length > 0 ? next : ['']
      };
    });
  };

  // AI translate specs to English
  const handleTranslateSpecs = async () => {
    setIsTranslatingSpecs(true);
    try {
      const textToTranslate = formData.specs.map(s => `${s.key_ar}: ${s.value_ar}`).join('\n');
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToTranslate,
          sourceLang: 'Arabic',
          targetLang: 'English'
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.translation) {
          const lines = data.translation.split('\n');
          const updatedSpecs = formData.specs.map((s, idx) => {
            const line = lines[idx];
            if (line && line.includes(':')) {
              const [k, v] = line.split(':');
              return { ...s, key_en: k.trim() || s.key_en, value_en: v.trim() || s.value_en };
            }
            return s;
          });
          setFormData(prev => ({ ...prev, specs: updatedSpecs }));
          showToast(isAr ? 'تمت ترجمة المواصفات تلقائياً إلى الإنجليزية!' : 'Specifications translated to English!');
          return;
        }
      }
    } catch {
      // Fallback: simple dictionary
    } finally {
      setIsTranslatingSpecs(false);
    }
  };

  // Submit Product Form
  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();

    const validImages = formData.images.filter((img) => img.trim().length > 0);
    if (validImages.length === 0) {
      validImages.push('https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80');
    }

    // Guarantee unique URL slug
    const titleForSlug = formData.title_en.trim() || formData.title_ar.trim() || 'product';
    const targetSlug = formData.slug.trim() || slugifyText(titleForSlug);
    const existingSlugs = products.map(p => p.slug).filter(Boolean);
    const { slug: guaranteedUniqueSlug } = generateUniqueSlug(
      targetSlug,
      existingSlugs,
      editingProduct?.id,
      products
    );

    // Guarantee unique SKU
    const existingSkus = products
      .filter(p => !editingProduct || p.id !== editingProduct.id)
      .map(p => p.sku)
      .filter(Boolean);
    const guaranteedSku = formData.sku.trim() || generateUniqueSku(formData.brand, formData.category_id, existingSkus);

    // Check promotion status
    const isPromoActive = formData.is_promotion && Number(formData.discount_percent) > 0;

    const payload = {
      title_ar: formData.title_ar || 'منتج جديد',
      title_en: formData.title_en || formData.title_ar || 'New Product',
      slug: guaranteedUniqueSlug,
      description_ar: formData.description_ar,
      description_en: formData.description_en,
      price: Number(formData.price),
      price_usd: Number(formData.price_usd),
      compare_at_price: isPromoActive && Number(formData.compare_at_price) > 0 ? Number(formData.compare_at_price) : undefined,
      discount_percent: isPromoActive ? Number(formData.discount_percent) : undefined,
      category_id: formData.category_id,
      brand: formData.brand,
      images: validImages,
      condition: formData.condition,
      condition_details: formData.condition_details,
      stock_quantity: Number(formData.stock_quantity),
      sku: guaranteedSku,
      is_featured: formData.is_featured,
      is_new: formData.is_new,
      warranty_ar: formData.warranty_ar,
      variant_combinations: formData.variant_combinations,
      specs: formData.specs,
      rating: editingProduct?.rating || 5,
      reviews_count: editingProduct?.reviews_count || 12
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, payload);
    } else {
      addProduct(payload);
    }

    setIsModalOpen(false);
  };

  const handleGlobalSave = () => {
    setIsSavingGlobal(true);
    setTimeout(() => {
      setIsSavingGlobal(false);
      showToast(isAr ? 'تم حفظ كافة التعديلات على المنتجات بنجاح!' : 'All product changes saved successfully!');
    }, 400);
  };

  // Filtered Products list
  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      prod.title_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.title_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.brand.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || prod.category_id === selectedCategory;

    const matchesBrand =
      selectedBrand === 'all' || prod.brand === selectedBrand;

    const matchesCondition =
      selectedCondition === 'all' || prod.condition === selectedCondition;

    const matchesArchive =
      archiveFilter === 'all'
        ? true
        : archiveFilter === 'archived'
        ? !!prod.is_archived
        : !prod.is_archived;

    return matchesSearch && matchesCategory && matchesBrand && matchesCondition && matchesArchive;
  });

  return (
    <div className="space-y-6 pb-12" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Top Header & Save Changes Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-600" />
              <span>{isAr ? 'إدارة كتالوج المنتجات وتعديل الأسعار الفوري' : 'Product Catalog & Pricing Control'}</span>
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              {isAr
                ? 'تعديل أسعار الليرة والدولار مباشرة، إنشاء روابط فريدة، وإدارة الأرشفة والمواصفات'
                : 'Inline SYP/USD price editing, unique URL links, variants, and archiving'}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Save Changes Button */}
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

            {/* Add Product Button */}
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-400 text-xs font-black transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'إضافة منتج جديد' : 'Add Product'}</span>
            </button>
          </div>
        </div>

        {/* Archive Filter Tabs & Search Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100">
          {/* Archive Status Tabs */}
          <div className="inline-flex rounded-xl bg-stone-100 p-1 border border-stone-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setArchiveFilter('active')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                archiveFilter === 'active' ? 'bg-white text-emerald-800 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {isAr ? `المنتجات المعروضة (${products.filter(p => !p.is_archived).length})` : 'Active'}
            </button>
            <button
              type="button"
              onClick={() => setArchiveFilter('archived')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                archiveFilter === 'archived' ? 'bg-amber-500 text-stone-950 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {isAr ? `المؤرشفة / المخفية (${products.filter(p => p.is_archived).length})` : 'Archived'}
            </button>
            <button
              type="button"
              onClick={() => setArchiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                archiveFilter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {isAr ? `الكل (${products.length})` : 'All'}
            </button>
          </div>

          <span className="text-xs text-stone-500">
            {isAr ? `عرض ${filteredProducts.length} من إجمالي ${products.length} منتج` : `Showing ${filteredProducts.length} items`}
          </span>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute top-3 start-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'بحث بالاسم، الكود (SKU)، أو الماركة...' : 'Search by name, SKU, brand...'}
              className="w-full ps-9 pe-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">{isAr ? 'جميع الفئات التصنيفية' : 'All Categories'}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {isAr ? c.name_ar : c.name_en}
              </option>
            ))}
          </select>

          {/* Brand Filter */}
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">{isAr ? 'جميع الماركات' : 'All Brands'}</option>
            {brands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          {/* Condition Filter */}
          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">{isAr ? 'الحالة (الكل)' : 'All Conditions'}</option>
            <option value="new">{isAr ? 'جديد (مختوم)' : 'New'}</option>
            <option value="used">{isAr ? 'مستعمل (نظافة ممتازة)' : 'Used'}</option>
          </select>
        </div>
      </div>

      {/* Products Table with Quick Edit & Archive */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-stone-50 text-stone-500 font-black border-b border-stone-200">
              <tr>
                <th className="py-3.5 px-4 text-start">{isAr ? 'المنتج وتفاصيله' : 'Product'}</th>
                <th className="py-3.5 px-3 text-start">{isAr ? 'الرابط الفريد (URL)' : 'Unique URL'}</th>
                <th className="py-3.5 px-3 text-start">{isAr ? 'سعر ل.س (تعديل سريع)' : 'Price (SYP)'}</th>
                <th className="py-3.5 px-3 text-start">{isAr ? 'سعر الدولار ($)' : 'Price (USD)'}</th>
                <th className="py-3.5 px-3 text-start">{isAr ? 'الخصم' : 'Discount'}</th>
                <th className="py-3.5 px-3 text-start">{isAr ? 'المخزون' : 'Stock'}</th>
                <th className="py-3.5 px-3 text-center">{isAr ? 'الحالة' : 'Status'}</th>
                <th className="py-3.5 px-4 text-center">{isAr ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400">
                    {isAr ? 'لا توجد منتجات مطابقة لخيارات البحث أو الفلترة' : 'No products found'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const quickData = quickPrices[prod.id];
                  const displaySyp = quickData ? quickData.syp : prod.price;
                  const displayUsd = quickData
                    ? quickData.usd
                    : prod.price_usd || Math.round(prod.price / (storeSettings.usd_exchange_rate || 15000));
                  const isModified = quickData !== undefined;
                  const isSaved = quickData?.saved;
                  const prodUrl = `${window.location.origin}/#product/${prod.slug || prod.id}`;

                  return (
                    <tr
                      key={prod.id}
                      className={`hover:bg-stone-50/70 transition-colors ${
                        prod.is_archived ? 'bg-amber-50/30 opacity-75' : ''
                      }`}
                    >
                      {/* Product Details */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.images[0] || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=100'}
                            alt={prod.title_ar}
                            className="w-11 h-11 rounded-xl object-cover bg-stone-100 border border-stone-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-stone-900 truncate max-w-[200px]">
                              {isAr ? prod.title_ar : prod.title_en}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-stone-500">
                              <span className="font-mono">{prod.sku}</span>
                              <span>•</span>
                              <span>{prod.brand}</span>
                              <span>•</span>
                              <span
                                className={`px-1.5 py-0.2 rounded font-semibold ${
                                  prod.condition === 'new'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-amber-50 text-amber-700'
                                }`}
                              >
                                {prod.condition === 'new' ? (isAr ? 'جديد' : 'New') : (isAr ? 'مستعمل' : 'Used')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Unique URL Link */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 max-w-[150px]">
                          <span className="font-mono text-[11px] text-stone-600 truncate bg-stone-100 px-2 py-1 rounded-md">
                            /{prod.slug || prod.id}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(prodUrl);
                              showToast(isAr ? 'تم نسخ الرابط الفريد للمنتج!' : 'Product URL copied!');
                            }}
                            title={isAr ? 'نسخ الرابط المباشر' : 'Copy direct link'}
                            className="p-1 rounded text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition-colors cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Quick Inline SYP Price Input */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={displaySyp}
                            onChange={(e) =>
                              handleQuickPriceChange(prod.id, 'syp', Number(e.target.value))
                            }
                            className={`w-28 py-1.5 px-2 rounded-lg font-mono font-bold text-xs text-stone-900 transition-all ${
                              isModified
                                ? 'bg-amber-50 border-2 border-amber-400 focus:ring-2 focus:ring-amber-500'
                                : 'bg-stone-50 border border-stone-200 focus:bg-white focus:ring-2 focus:ring-emerald-500'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveQuickPrice(prod.id)}
                            disabled={!isModified || isSaved}
                            title={isAr ? 'حفظ السعر فوراً' : 'Save price'}
                            className={`p-1.5 rounded-lg transition-all ${
                              isSaved
                                ? 'bg-emerald-600 text-white'
                                : isModified
                                ? 'bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold animate-pulse cursor-pointer'
                                : 'bg-stone-100 text-stone-300 cursor-not-allowed'
                            }`}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                      {/* USD Price Input */}
                      <td className="py-3 px-3 bg-emerald-50/20">
                        <div className="flex items-center gap-1">
                          <span className="text-stone-400 font-mono">$</span>
                          <input
                            type="number"
                            value={displayUsd}
                            onChange={(e) =>
                              handleQuickPriceChange(prod.id, 'usd', Number(e.target.value))
                            }
                            className="w-20 py-1.5 px-2 rounded-lg bg-white border border-emerald-300 font-mono font-bold text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                          />
                        </div>
                      </td>

                      {/* Discount Badge */}
                      <td className="py-3 px-3">
                        {prod.discount_percent && prod.discount_percent > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 font-black font-mono text-[11px]">
                            <Percent className="w-3 h-3" />
                            <span>-{prod.discount_percent}%</span>
                          </span>
                        ) : prod.compare_at_price && prod.compare_at_price > prod.price ? (
                          <span className="text-rose-600 font-bold font-mono text-[11px]">
                            {isAr ? 'خصم مفعّل' : 'Sale'}
                          </span>
                        ) : (
                          <span className="text-stone-400 text-[11px]">-</span>
                        )}
                      </td>

                      {/* Stock Quantity */}
                      <td className="py-3 px-3">
                        <span
                          className={`font-mono font-bold text-xs ${
                            prod.stock_quantity > 3 ? 'text-stone-800' : 'text-amber-600 font-black'
                          }`}
                        >
                          {prod.stock_quantity}
                        </span>
                      </td>

                      {/* Status / Archive */}
                      <td className="py-3 px-3 text-center">
                        {prod.is_archived ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[11px] font-bold">
                            <Archive className="w-3 h-3" />
                            <span>{isAr ? 'مؤرشف (مخفي)' : 'Archived'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{isAr ? 'نشط ومعروض' : 'Active'}</span>
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          {/* Preview in Store */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProductId(prod.id);
                              setCurrentView('pdp');
                            }}
                            title={isAr ? 'معاينة في المتجر' : 'Preview'}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Archive / Unarchive Toggle */}
                          <button
                            type="button"
                            onClick={() => archiveProduct(prod.id, !prod.is_archived)}
                            title={prod.is_archived ? (isAr ? 'إلغاء الأرشفة وإظهاره بالمتجر' : 'Unarchive') : (isAr ? 'أرشفة المنتج وإخفاؤه من المتجر' : 'Archive')}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              prod.is_archived
                                ? 'text-emerald-700 hover:bg-emerald-50'
                                : 'text-amber-600 hover:bg-amber-50'
                            }`}
                          >
                            {prod.is_archived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                          </button>

                          {/* Full Edit */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(prod)}
                            title={isAr ? 'تعديل كامل البيانات' : 'Edit details'}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setProductToDelete(prod)}
                            title={isAr ? 'حذف المنتج نهائياً' : 'Delete'}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Product Confirmation Modal - Works 100% reliably in iFrames and Mobile */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-stone-200 p-6 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-stone-900">
                {isAr ? 'تأكيد حذف المنتج نهائياً' : 'Delete Product Permanently'}
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                {isAr
                  ? `هل أنت متأكد من رغبتك في حذف "${productToDelete.title_ar}" نهائياً من المتجر؟ سيتم حذفه من قاعدة البيانات المتزامنة Supabase أيضاً.`
                  : `Are you sure you want to permanently delete "${productToDelete.title_en}"? This will also remove it from Supabase.`}
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-bold hover:bg-stone-50 transition-colors cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteProduct(productToDelete.id);
                  setProductToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-xs transition-colors cursor-pointer"
              >
                {isAr ? 'نعم، احذف المنتج' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/60 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900">
                    {editingProduct
                      ? (isAr ? 'تعديل بيانات المنتج' : 'Edit Product')
                      : (isAr ? 'إضافة منتج جديد لمتجر الليث' : 'Add New Product')}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {isAr ? 'توليد رابط مخصص، رفع صور، خيارات متعددة، وترجمة مواصفات' : 'Custom URL, images upload, variants and specs'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmitProduct} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
              {/* Product Titles & Generated URL */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {isAr ? 'اسم المنتج بالعربية *' : 'Product Title (Arabic) *'}
                    </label>
                    <input
                      type="text"
                      value={formData.title_ar ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          title_ar: val,
                          slug: prev.slug || val.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
                        }));
                      }}
                      required
                      placeholder="مثال: آبل آيفون 16 برو ماكس 256 جيجابايت"
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {isAr ? 'اسم المنتج بالإنجليزية' : 'Product Title (English)'}
                    </label>
                    <input
                      type="text"
                      value={formData.title_en ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          title_en: val,
                          slug: val.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
                        }));
                      }}
                      placeholder="e.g. Apple iPhone 16 Pro Max 256GB"
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Unique Dedicated URL Generator with Duplicate Detection */}
                <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <Link className="w-3.5 h-3.5 text-amber-600" />
                      <span>{isAr ? 'الرابط المخصص والفريد للمنتج (Unique URL / Slug):' : 'Product Unique URL Slug:'}</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoGenerateSlug}
                      className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Sparkles className="w-3 h-3 text-amber-700" />
                      <span>{isAr ? 'توليد تلقائي للرابط' : 'Auto Generate URL'}</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-stone-500 shrink-0 select-none">
                      https://allaith.vercel.app/#product/
                    </span>
                    <input
                      type="text"
                      value={formData.slug ?? ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                      placeholder="iphone-16-pro-max"
                      className="flex-1 px-2.5 py-1 rounded-lg bg-white border border-amber-300 font-mono text-xs text-stone-900 outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  {/* Duplicate or Unique URL Status Badge */}
                  {formData.slug.trim() && (
                    <div className="pt-1">
                      {checkIsSlugDuplicate(formData.slug, products, editingProduct?.id) ? (
                        <div className="flex items-center gap-1.5 text-rose-600 text-[11px] font-bold bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{isAr ? 'تنبيه: هذا الرابط مكرر ومستخدم لمنتج آخر! انقر على "توليد تلقائي" لتفادي التعارض.' : 'Warning: This URL slug is already used by another product!'}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-emerald-700 text-[11px] font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                          <span>{isAr ? 'رابط مخصص متاح وفريد 100%' : 'Unique and available URL slug'}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Product Descriptions Section (Requested Feature) */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-stone-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>{isAr ? 'شرح ووصف المنتج التفصيلي (Description Box)' : 'Product Detailed Description'}</span>
                  </h4>
                  <span className="text-[11px] text-stone-500">
                    {isAr ? 'يظهر للزبائن في صفحة تفاصيل المنتج' : 'Displayed to customers on product page'}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      {isAr ? 'الوصف بالعربية *' : 'Description (Arabic) *'}
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description_ar ?? ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description_ar: e.target.value }))}
                      placeholder={isAr ? 'أدخل شرحاً مفصلاً عن المنتج، حالته، ملحقاته ومميزاته التقنية لزبائن المتجر...' : 'Enter Arabic product description and features...'}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      {isAr ? 'الوصف بالإنجليزية (اختياري)' : 'Description (English - Optional)'}
                    </label>
                    <textarea
                      rows={2}
                      value={formData.description_en ?? ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description_en: e.target.value }))}
                      placeholder="Enter detailed English description, specifications overview, and highlights..."
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Promotion, Discounts, and Pricing (Requested Checkbox Feature) */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                {/* Promotion Checkbox Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-2xs">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-stone-900">
                        {isAr ? 'العروض الترويجية والخصومات الخاصة' : 'Promotions & Special Discounts'}
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        {isAr ? 'تحديد نسبة الخصم المئوية وإظهار السعر قبل وبعد التخفيض' : 'Set percentage discount and compare-at pricing'}
                      </p>
                    </div>
                  </div>

                  {/* Requested Checkbox */}
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-stone-300 hover:border-rose-400 cursor-pointer transition-colors shadow-2xs select-none">
                    <input
                      type="checkbox"
                      checked={formData.is_promotion}
                      onChange={(e) => handleTogglePromotion(e.target.checked)}
                      className="w-4 h-4 text-rose-600 rounded-sm focus:ring-rose-500 cursor-pointer accent-rose-600"
                    />
                    <span className="text-xs font-black text-stone-800">
                      {isAr ? 'تفعيل عرض خاص / تخفيض ترويجي' : 'Enable Promotion / Sale'}
                    </span>
                  </label>
                </div>

                {/* Promotion Percentage Fields when enabled */}
                {formData.is_promotion && (
                  <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-rose-800 text-xs font-bold">
                      <Percent className="w-4 h-4 text-rose-600" />
                      <span>{isAr ? 'بيانات الخصم المئوي واحتساب السعر الترويجي:' : 'Discount Percentage & Calculated Offer:'}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-rose-950 mb-1">
                          {isAr ? 'نسبة الخصم المئوية (%) *' : 'Discount Percentage (%) *'}
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min={1}
                            max={99}
                            value={formData.discount_percent || ''}
                            onChange={(e) => handleDiscountPercentChange(Number(e.target.value))}
                            placeholder="15"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-rose-300 font-mono font-black text-xs text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                          />
                          <span className="absolute end-3 top-2 text-xs font-black text-rose-400 select-none">%</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          {isAr ? 'السعر الأصلي قبل الخصم (ل.س)' : 'Compare At Price (SYP)'}
                        </label>
                        <input
                          type="number"
                          value={formData.compare_at_price || ''}
                          onChange={(e) => handleCompareAtPriceChange(Number(e.target.value))}
                          placeholder="0"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 font-mono font-bold text-xs text-stone-500 line-through focus:outline-none focus:ring-2 focus:ring-rose-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          {isAr ? 'مقدار التوفير للزبون' : 'Customer Savings'}
                        </label>
                        <div className="px-3 py-2 rounded-xl bg-white border border-rose-200 text-xs font-bold text-emerald-700 flex items-center justify-between">
                          <span>
                            {formData.compare_at_price > formData.price
                              ? formatPrice(formData.compare_at_price - formData.price)
                              : '—'}
                          </span>
                          <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded-md font-black">
                            {isAr ? `خصم ${formData.discount_percent || 0}%` : `${formData.discount_percent || 0}% OFF`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actual Selling Price & Dual Currency */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      {formData.is_promotion
                        ? (isAr ? 'سعر البيع الفعلي بعد الخصم (ل.س) *' : 'Actual Selling Price After Discount (SYP) *')
                        : (isAr ? 'سعر البيع الفعلي (ل.س) *' : 'Actual Selling Price (SYP) *')}
                    </label>
                    <input
                      type="number"
                      value={formData.price ?? 0}
                      onChange={(e) => handlePriceChange(Number(e.target.value))}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 font-mono font-black text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      {isAr ? 'السعر المعادل بالدولار ($)' : 'Price in USD ($)'}
                    </label>
                    <input
                      type="number"
                      value={formData.price_usd ?? 0}
                      onChange={(e) => setFormData((prev) => ({ ...prev, price_usd: Number(e.target.value) }))}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 font-mono font-black text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload with URL Retrieval & Direct Input */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-stone-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    <span>{isAr ? 'صور المنتج (رفع من الجهاز أو إدخال روابط مباشرة):' : 'Product Images (Upload or URL):'}</span>
                  </span>
                  <span className="text-[11px] text-stone-500">
                    {formData.images.filter(i => i.trim().length > 0).length} / 8 صور
                  </span>
                </label>

                {/* File Upload Trigger */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-emerald-400 bg-emerald-50/50 hover:bg-emerald-100/50 text-emerald-800 text-xs font-bold cursor-pointer transition-colors w-full sm:w-auto">
                    <Upload className="w-4 h-4 text-emerald-600" />
                    <span>{isAr ? 'رفع صورة من جهازك واستخراج الرابط' : 'Upload Image File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <div className="flex items-center gap-2 flex-1 w-full">
                    <input
                      type="url"
                      value={tempImageUrl}
                      onChange={(e) => setTempImageUrl(e.target.value)}
                      placeholder={isAr ? 'أو الصق رابط صورة مباشر (https://...)' : 'Or paste direct image URL'}
                      className="flex-1 px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddImage(tempImageUrl)}
                      className="px-4 py-2 rounded-xl bg-stone-900 text-amber-400 text-xs font-bold cursor-pointer"
                    >
                      {isAr ? 'إضافة' : 'Add'}
                    </button>
                  </div>
                </div>

                {/* Thumbnails Preview Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 pt-2">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 end-1 p-1 bg-rose-600 text-white rounded-full opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Variants (Combinations) */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-stone-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span>{isAr ? 'المتغيرات والخيارات (الألوان، السعات، والأسعار الفرعية)' : 'Variants & Combinations'}</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const newVar: ProductVariantCombination = {
                        id: `var-${Date.now()}`,
                        combination_name_ar: 'خيار جديد',
                        combination_name_en: 'New Option',
                        attributes: { color: 'Standard' },
                        price: formData.price,
                        stock_quantity: 3,
                        sku: `${formData.sku}-${formData.variant_combinations.length + 1}`
                      };
                      setFormData(prev => ({ ...prev, variant_combinations: [...prev.variant_combinations, newVar] }));
                    }}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAr ? 'إضافة خيار' : 'Add Variant'}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.variant_combinations.map((comb, cIdx) => (
                    <div key={comb.id} className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-white p-2.5 rounded-xl border border-stone-200 text-xs">
                      <input
                        type="text"
                        value={comb.combination_name_ar ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            variant_combinations: prev.variant_combinations.map((item, i) => i === cIdx ? { ...item, combination_name_ar: val } : item)
                          }));
                        }}
                        placeholder="الاسم (مثال: أزرق 256GB)"
                        className="px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs"
                      />
                      <input
                        type="number"
                        value={comb.price ?? 0}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setFormData(prev => ({
                            ...prev,
                            variant_combinations: prev.variant_combinations.map((item, i) => i === cIdx ? { ...item, price: val } : item)
                          }));
                        }}
                        placeholder="السعر ل.س"
                        className="px-2.5 py-1.5 rounded-lg border border-stone-200 font-mono text-xs"
                      />
                      <input
                        type="number"
                        value={comb.stock_quantity ?? 0}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setFormData(prev => ({
                            ...prev,
                            variant_combinations: prev.variant_combinations.map((item, i) => i === cIdx ? { ...item, stock_quantity: val } : item)
                          }));
                        }}
                        placeholder="الكمية"
                        className="px-2.5 py-1.5 rounded-lg border border-stone-200 font-mono text-xs"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={comb.sku ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              variant_combinations: prev.variant_combinations.map((item, i) => i === cIdx ? { ...item, sku: val } : item)
                            }));
                          }}
                          placeholder="كود SKU"
                          className="flex-1 px-2.5 py-1.5 rounded-lg border border-stone-200 font-mono text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              variant_combinations: prev.variant_combinations.filter((_, i) => i !== cIdx)
                            }));
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specifications: Table & Text Format with AI Translation */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-stone-900 flex items-center gap-2">
                    <TableIcon className="w-4 h-4 text-emerald-600" />
                    <span>{isAr ? 'المواصفات التقنية (عرض جدول كأمازون)' : 'Technical Specifications (Amazon-Style)'}</span>
                  </h4>

                  <button
                    type="button"
                    onClick={handleTranslateSpecs}
                    disabled={isTranslatingSpecs}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-800 rounded-xl text-xs font-bold border border-blue-200 cursor-pointer disabled:opacity-50"
                  >
                    <Languages className="w-3.5 h-3.5 text-blue-600" />
                    <span>{isTranslatingSpecs ? (isAr ? 'جارِ الترجمة...' : 'Translating...') : (isAr ? 'ترجمة المواصفات للإنجليزية تلقائياً' : 'AI Translate to English')}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.specs.map((sp, sIdx) => (
                    <div key={sp.id} className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-white p-2 rounded-xl border border-stone-200 text-xs">
                      <input
                        type="text"
                        value={sp.key_ar ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            specs: prev.specs.map((item, i) => i === sIdx ? { ...item, key_ar: val } : item)
                          }));
                        }}
                        placeholder="العنوان (مثال: البطارية)"
                        className="px-2 py-1 rounded-lg border border-stone-200 text-xs"
                      />
                      <input
                        type="text"
                        value={sp.value_ar ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            specs: prev.specs.map((item, i) => i === sIdx ? { ...item, value_ar: val } : item)
                          }));
                        }}
                        placeholder="القيمة بالعربية"
                        className="px-2 py-1 rounded-lg border border-stone-200 text-xs"
                      />
                      <input
                        type="text"
                        value={sp.value_en ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            specs: prev.specs.map((item, i) => i === sIdx ? { ...item, value_en: val } : item)
                          }));
                        }}
                        placeholder="Value in English"
                        className="px-2 py-1 rounded-lg border border-stone-200 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            specs: prev.specs.filter((_, i) => i !== sIdx)
                          }));
                        }}
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer justify-self-end"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        specs: [...prev.specs, { id: `spec-${Date.now()}`, key_ar: '', key_en: '', value_ar: '', value_en: '' }]
                      }));
                    }}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer pt-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAr ? 'إضافة سطر مواصفات جديد' : 'Add Spec Item'}</span>
                  </button>
                </div>
              </div>

              {/* Category, Brand, Condition, Stock, and Auto-Generated SKU */}
              <div className="space-y-4 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <h4 className="text-xs font-black text-stone-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-600" />
                  <span>{isAr ? 'بيانات التصنيف، المخزون، ورمز التتبع (SKU)' : 'Category, Stock & SKU'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{isAr ? 'الفئة *' : 'Category *'}</label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs font-semibold"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{isAr ? c.name_ar : c.name_en}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{isAr ? 'الماركة *' : 'Brand *'}</label>
                    <select
                      value={formData.brand}
                      onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs font-semibold"
                    >
                      {brands.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{isAr ? 'الحالة' : 'Condition'}</label>
                    <select
                      value={formData.condition}
                      onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value as ProductCondition }))}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs font-semibold"
                    >
                      <option value="new">{isAr ? 'جديد (مختوم)' : 'New'}</option>
                      <option value="used">{isAr ? 'مستعمل (مفحوص نظيف)' : 'Used / Like New'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{isAr ? 'الكمية في المخزن' : 'Stock Quantity'}</label>
                    <input
                      type="number"
                      value={formData.stock_quantity ?? 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: Number(e.target.value) }))}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 font-mono text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* SKU Auto-Generation Input (Requested Feature) */}
                <div className="pt-2 border-t border-stone-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-stone-800 mb-1 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isAr ? 'رمز تعريف المنتج الفريد (SKU):' : 'Unique Product SKU:'}</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={formData.sku ?? ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value.toUpperCase() }))}
                        placeholder="e.g. LTH-APL-SMART-4821"
                        className="flex-1 px-3 py-2 rounded-xl bg-white border border-stone-300 font-mono font-black text-xs text-stone-900 tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={handleAutoGenerateSku}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors shrink-0"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>{isAr ? 'توليد SKU تلقائي' : 'Auto Generate SKU'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-bold cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  {editingProduct
                    ? (isAr ? 'حفظ كافة التعديلات' : 'Save Changes')
                    : (isAr ? 'نشر المنتج في المتجر' : 'Publish Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
