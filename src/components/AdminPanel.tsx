import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, Order, MaintenanceRequest, StoreSettings } from '../types';
import {
  Package,
  ShoppingBag,
  Wrench,
  Settings,
  Plus,
  Trash2,
  Edit2,
  FileSpreadsheet,
  Printer,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  MessageCircle,
  Save,
  DollarSign,
  AlertCircle,
  Eye,
  Check,
  X,
  Copy,
  Lock,
  ArrowUpRight,
  TrendingUp,
  Percent,
  Upload,
  Image as ImageIcon,
  Smartphone
} from 'lucide-react';
import { logoPresets, defaultStoreLogoSvg } from '../data/logoPresets';

export const AdminPanel: React.FC = () => {
  const {
    locale,
    t,
    products,
    categories,
    orders,
    maintenanceRequests,
    phoneRequests,
    storeSettings,
    updateStoreSettings,
    addProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatus,
    updateMaintenanceStatus,
    resyncOrderToSheets,
    formatPrice,
    formatDualPrice,
    convertSYPtoUSD,
    showToast,
    exitAdminPortal,
    getPrivateAdminLink,
    sheetsSyncLogs,
    testGoogleSheetsWebhook,
    brands,
    addBrand,
    deleteBrand
  } = useStore();

  const isAr = locale === 'ar';

  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'maintenance' | 'requests' | 'settings'>('orders');

  // Product modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Quick brand addition state
  const [quickBrandName, setQuickBrandName] = useState('');
  const [showQuickBrandInput, setShowQuickBrandInput] = useState(false);

  // Filter & Search states
  const [orderSearch, setOrderSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<StoreSettings>({ ...storeSettings });
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyAdminLink = () => {
    const link = getPrivateAdminLink();
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    showToast(isAr ? 'تم نسخ الرابط الخاص بلوحة التحكم!' : 'Private Admin Link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setSettingsForm((prev) => ({ ...prev, logo_url: dataUrl }));
      showToast(isAr ? 'تم تحميل صورة الشعار بنجاح!' : 'Logo image loaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings(settingsForm);
  };

  const handleTestWebhook = async () => {
    setIsTestingWebhook(true);
    await testGoogleSheetsWebhook(settingsForm.google_sheets_webhook_url);
    setIsTestingWebhook(false);
  };

  const handleAddQuickBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickBrandName.trim()) return;
    const success = addBrand(quickBrandName);
    if (success) {
      if (editingProduct) {
        setEditingProduct({ ...editingProduct, brand: quickBrandName.trim() });
      }
      setQuickBrandName('');
      setShowQuickBrandInput(false);
    }
  };

  // Open product editor
  const handleOpenNewProduct = () => {
    setEditingProduct({
      id: `prod-${Date.now()}`,
      title_ar: '',
      title_en: '',
      slug: `product-${Date.now()}`,
      category_id: categories[0]?.id || 'smartphones',
      device_type: 'phone',
      condition: 'new',
      condition_details: '',
      pricing_type: 'syp',
      pricing_strategy: 'auto_daily_rate',
      price: 5000000,
      price_usd: 335,
      compare_at_price: 5500000,
      compare_at_price_usd: 370,
      cost_price: 4200000,
      stock_quantity: 10,
      sku: `LTH-${Math.floor(1000 + Math.random() * 9000)}`,
      brand: brands[0] || 'Apple',
      images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80'],
      description_ar: '',
      description_en: '',
      warranty_ar: 'كفالة سنة كاملة من مركز الليث للاتصالات في دمشق',
      warranty_en: '1 Year Full Warranty from Al-Laith Lab in Damascus',
      is_featured: true,
      is_deal_of_the_day: false,
      tags: ['lab_certified'],
      rating: 4.9,
      reviews_count: 1,
      created_at: new Date().toISOString()
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct({
      ...prod,
      device_type: prod.device_type || 'phone',
      condition: prod.condition || 'new',
      condition_details: prod.condition_details || '',
      pricing_type: prod.pricing_type || 'syp',
      pricing_strategy: prod.pricing_strategy || (prod.pricing_type === 'usd' ? 'fixed_usd' : 'auto_daily_rate'),
      price_usd: prod.price_usd || convertSYPtoUSD(prod.price),
      tags: prod.tags || []
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const exists = products.some((p) => p.id === editingProduct.id);
    if (exists) {
      updateProduct(editingProduct.id, editingProduct);
    } else {
      addProduct(editingProduct);
    }
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  // Print invoice for Syrian orders
  const handlePrintOrder = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const dualTotal = formatDualPrice(order.total);

    printWindow.document.write(`
      <html dir="${isAr ? 'rtl' : 'ltr'}">
        <head>
          <title>فاتورة طلب #${order.order_number} - متجر الليث للاتصالات</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1c1917; line-height: 1.5; }
            .header { border-bottom: 2px solid #e7e5e4; padding-bottom: 20px; margin-bottom: 20px; display: flex; justify-content: space-between; }
            .badge { display: inline-block; background: #059669; color: white; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #e7e5e4; padding: 12px; text-align: ${isAr ? 'right' : 'left'}; }
            th { background: #f5f5f4; font-size: 13px; }
            .total-box { margin-top: 25px; border-top: 2px solid #1c1917; padding-top: 15px; text-align: ${isAr ? 'left' : 'right'}; font-size: 16px; }
            .grand-total { font-size: 20px; font-weight: 900; color: #1c1917; }
            .footer { margin-top: 40px; font-size: 11px; text-align: center; color: #78716c; border-top: 1px dashed #d6d3d1; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 style="margin:0 0 5px 0; font-size: 22px;">${isAr ? storeSettings.site_name_ar : storeSettings.site_name_en}</h1>
              <p style="margin:0; font-size: 13px; color: #57534e;">مبيعات الهواتف الذكية • صيانة معتمدة • دمشق، سوريا</p>
              <p style="margin:5px 0 0 0; font-weight: bold; font-size: 14px;">فاتورة مبيعات رقم #${order.order_number}</p>
            </div>
            <div style="text-align: ${isAr ? 'left' : 'right'};">
              <span class="badge">طلب معتمد</span>
              <p style="margin:8px 0 2px 0; font-size: 12px;">التاريخ: ${new Date(order.created_at).toLocaleDateString('ar-SY')}</p>
              <p style="margin:0; font-size: 12px; font-weight: bold;">الزبون: ${order.customer_name}</p>
              <p style="margin:2px 0; font-size: 12px;" dir="ltr">هاتف: ${order.customer_phone}</p>
              <p style="margin:0; font-size: 12px;">المحافظة: ${order.governorate} - ${order.delivery_address}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>الجهاز / المنتج</th>
                <th>المواصفات / اللون</th>
                <th>الكمية</th>
                <th>السعر الفردي (ل.س)</th>
                <th>الإجمالي (ل.س)</th>
              </tr>
            </thead>
            <tbody>
              ${order.items
                .map(
                  (i, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td><strong>${i.title}</strong></td>
                  <td>${i.variant_info || 'النسخة القياسية'}</td>
                  <td>${i.quantity}</td>
                  <td>${i.price.toLocaleString()} ل.س</td>
                  <td>${(i.price * i.quantity).toLocaleString()} ل.س</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>

          <div class="total-box">
            <p style="margin:3px 0;">المجموع الفرعي: <strong>${order.subtotal.toLocaleString()} ل.س</strong></p>
            <p style="margin:3px 0;">أجور التوصيل: <strong>${order.delivery_fee === 0 ? 'مجاناً' : `${order.delivery_fee.toLocaleString()} ل.س`}</strong></p>
            <p class="grand-total" style="margin:8px 0 0 0;">المبلغ الإجمالي المطلوب: ${dualTotal.primary}</p>
            <p style="margin:4px 0 0 0; font-size: 13px; color: #57534e;">المعادل التقريبي بالدولار: ${dualTotal.secondary}</p>
          </div>

          <div class="footer">
            <p>شكراً لتعاملكم مع متجر الليث للاتصالات | هاتف وتساب: ${storeSettings.whatsapp_number} | دمشق، سوريا</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const filteredOrders = orders.filter((o) => {
    const q = orderSearch.toLowerCase();
    return (
      o.order_number.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_phone.toLowerCase().includes(q) ||
      o.governorate.toLowerCase().includes(q)
    );
  });

  const filteredProducts = products.filter((p) => {
    const q = productSearch.toLowerCase();
    return (
      p.title_ar.toLowerCase().includes(q) ||
      p.title_en.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q)
    );
  });

  return (
    <div className="py-8 bg-stone-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Dedicated Private Link Security Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-200/80 text-amber-800 flex items-center justify-center flex-shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold block text-sm">
                {isAr ? 'لوحة تحكم خاصة ومحمية - رابط مخصص للمالك' : 'Dedicated Private Admin Link'}
              </span>
              <span className="text-stone-600 font-medium">
                {isAr
                  ? 'لوحة التحكم مفصولة تماماً عن واجهة الزبائن، ويمكنك الدخول إليها دوماً عبر هذا الرابط المباشر:'
                  : 'Separated from the public store. Access this portal directly via your private link:'}
              </span>
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-amber-300 ml-1 rtl:mr-1 text-stone-800 font-bold select-all">
                {getPrivateAdminLink()}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopyAdminLink}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-900 text-white font-bold hover:bg-amber-800 transition-colors shadow-xs flex-shrink-0"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ الرابط الخاص' : 'Copy Private Link')}</span>
          </button>
        </div>

        {/* Admin Header */}
        <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center font-black text-xl shadow-md border border-emerald-500/30">
              ل
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  {isAr ? 'لوحة تحكم متجر الليث للاتصالات' : 'Al-Laith Telecom Control Panel'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {isAr ? 'سوريا • ل.س / USD' : 'Syria • SYP / USD'}
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                {isAr
                  ? 'إدارة المنتجات، أرباح التكلفة، فواتير وتساب، طلبات الصيانة ومزامنة Google Sheets'
                  : 'Manage products, cost margins, WhatsApp orders, repair tickets, and Google Sheets'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={exitAdminPortal}
              className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-colors flex items-center gap-1.5 border border-stone-700 active:scale-95"
            >
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? 'خروج لواجهة المتجر' : 'Exit to Storefront'}</span>
            </button>
          </div>
        </div>

        {/* Dashboard Nav Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {[
            { id: 'orders', label: t('manage_orders'), icon: ShoppingBag, count: orders.length },
            { id: 'products', label: t('manage_products'), icon: Package, count: products.length },
            { id: 'maintenance', label: t('maintenance_tickets'), icon: Wrench, count: maintenanceRequests.length },
            { id: 'requests', label: isAr ? 'طلبات الأجهزة' : 'Phone Requests', icon: Smartphone, count: phoneRequests?.length || 0 },
            { id: 'settings', label: t('store_settings_tab'), icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shadow-xs ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-md'
                    : 'bg-white text-stone-700 hover:bg-stone-50 border border-stone-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-stone-500'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                      isActive ? 'bg-stone-800 text-emerald-400' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Orders Management */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Orders Metrics in Syrian Context */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
                <span className="text-xs text-stone-400 block font-medium">{t('total_orders')}</span>
                <span className="text-2xl font-black text-stone-900">{orders.length}</span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
                <span className="text-xs text-stone-400 block font-medium">{t('order_status_new')}</span>
                <span className="text-2xl font-black text-amber-600">
                  {orders.filter((o) => o.status === 'new').length}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
                <span className="text-xs text-stone-400 block font-medium">{t('order_status_shipped')}</span>
                <span className="text-2xl font-black text-blue-600">
                  {orders.filter((o) => o.status === 'shipped').length}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
                <span className="text-xs text-stone-400 block font-medium">{t('order_status_delivered')}</span>
                <span className="text-2xl font-black text-emerald-600">
                  {orders.filter((o) => o.status === 'delivered').length}
                </span>
              </div>
            </div>

            {/* Orders Table Container */}
            <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 sm:max-w-xs">
                  <Search className="w-4 h-4 text-stone-400 absolute top-3 left-3 rtl:left-auto rtl:right-3" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder={isAr ? 'بحث برقم الطلب، الهاتف، العميل أو المحافظة...' : 'Search order, phone, customer...'}
                    className="w-full pl-9 pr-3 rtl:pl-3 rtl:pr-9 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 text-stone-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left rtl:text-right">
                  <thead className="bg-stone-50 border-b border-stone-100 text-stone-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-4">{t('order_number')}</th>
                      <th className="p-4">{t('customer_name')}</th>
                      <th className="p-4">{t('governorate')}</th>
                      <th className="p-4">{t('total')}</th>
                      <th className="p-4">Google Sheets</th>
                      <th className="p-4">{t('status')}</th>
                      <th className="p-4 text-center">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-stone-400">
                          {t('no_orders_found')}
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => {
                        const dualTotal = formatDualPrice(order.total);
                        const cleanPhone = order.customer_phone.replace(/\D/g, '');
                        const waCustomerUrl = `https://wa.me/${cleanPhone}`;

                        return (
                          <tr key={order.id} className="hover:bg-stone-50/80 transition-colors">
                            <td className="p-4 font-mono font-bold text-stone-900">
                              #{order.order_number}
                              <span className="block text-[10px] text-stone-400 font-normal">
                                {new Date(order.created_at).toLocaleDateString('ar-SY')}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="font-bold text-stone-900 block">{order.customer_name}</span>
                              <a
                                href={waCustomerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-mono hover:underline"
                                dir="ltr"
                              >
                                <MessageCircle className="w-3 h-3" />
                                <span>{order.customer_phone}</span>
                              </a>
                            </td>
                            <td className="p-4">
                              <span className="font-medium text-stone-800">{order.governorate}</span>
                              <span className="block text-[10px] text-stone-400 truncate max-w-xs">{order.delivery_address}</span>
                            </td>
                            <td className="p-4 font-bold text-stone-900">
                              <div>{dualTotal.primary}</div>
                              <div className="text-[10px] text-stone-400 font-medium">≈ {dualTotal.secondary}</div>
                            </td>
                            <td className="p-4">
                              {order.synced_to_sheets || order.google_sheets_synced ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-[10px] font-bold">
                                  <FileSpreadsheet className="w-3 h-3" />
                                  <span>{isAr ? 'تمت المزامنة' : 'Synced'}</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => resyncOrderToSheets(order.id)}
                                  className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-full text-[10px] font-bold"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>{isAr ? 'مزامنة الآن' : 'Sync Now'}</span>
                                </button>
                              )}
                            </td>
                            <td className="p-4">
                              <select
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                                  order.status === 'delivered'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : order.status === 'shipped'
                                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                                    : order.status === 'cancelled'
                                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}
                              >
                                <option value="new">{t('order_status_new')}</option>
                                <option value="pending">{t('order_status_pending')}</option>
                                <option value="processing">{t('order_status_processing')}</option>
                                <option value="shipped">{t('order_status_shipped')}</option>
                                <option value="delivered">{t('order_status_delivered')}</option>
                                <option value="cancelled">{t('order_status_cancelled')}</option>
                              </select>
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handlePrintOrder(order)}
                                  className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                                  title="Print Invoice"
                                >
                                  <Printer className="w-4 h-4" />
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
          </div>
        )}

        {/* Tab 2: Products Catalog, Device Conditions & Brands Management */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Brands Management Card */}
            <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-stone-900 flex items-center gap-2">
                    <span>{t('manage_brands')}</span>
                    <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-xs font-mono">
                      {brands.length}
                    </span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {isAr
                      ? 'إضافة وحذف الماركات التجارية المعتمدة للأجهزة في متجر الليث للاتصالات'
                      : 'Configure device brands available in the catalog and product editor'}
                  </p>
                </div>

                {/* Add Brand Inline Form */}
                <form onSubmit={handleAddQuickBrand} className="flex gap-2">
                  <input
                    type="text"
                    value={quickBrandName}
                    onChange={(e) => setQuickBrandName(e.target.value)}
                    placeholder={t('new_brand_placeholder')}
                    className="px-3.5 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-xs font-semibold focus:bg-white focus:outline-none w-44 sm:w-56"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('add_brand_btn')}</span>
                  </button>
                </form>
              </div>

              {/* Brand Chips */}
              <div className="flex flex-wrap gap-2 pt-4">
                {brands.map((b) => {
                  const productCount = products.filter((p) => p.brand?.toLowerCase() === b.toLowerCase()).length;
                  return (
                    <div
                      key={b}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 transition-colors text-xs font-bold text-stone-800"
                    >
                      <span>{b}</span>
                      <span className="text-[10px] text-stone-600 bg-white px-1.5 py-0.5 rounded-md border border-stone-200">
                        {productCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteBrand(b)}
                        title={isAr ? `حذف ماركة ${b}` : `Delete ${b}`}
                        className="text-stone-600 hover:text-rose-600 p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Products Table Card */}
            <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 sm:max-w-xs">
                  <Search className="w-4 h-4 text-stone-400 absolute top-3 left-3 rtl:left-auto rtl:right-3" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder={isAr ? 'بحث بالاسم، الماركة أو رمز SKU...' : 'Search products, brand, SKU...'}
                    className="w-full pl-9 pr-3 rtl:pl-3 rtl:pr-9 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 text-stone-900 focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleOpenNewProduct}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('add_new_product')}</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left rtl:text-right">
                  <thead className="bg-stone-50 border-b border-stone-100 text-stone-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-4">{isAr ? 'الصورة (1:1)' : 'Image (1:1)'}</th>
                      <th className="p-4">{t('product')}</th>
                      <th className="p-4">{t('condition_label')}</th>
                      <th className="p-4">{t('price')}</th>
                      <th className="p-4">{isAr ? 'التكلفة والهامش' : 'Cost & Margin'}</th>
                      <th className="p-4">{t('stock')}</th>
                      <th className="p-4 text-center">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {filteredProducts.map((p) => {
                      const cost = p.cost_price || 0;
                      const profit = p.price - cost;
                      const marginPercent = cost > 0 && p.price > 0 ? Math.round((profit / p.price) * 100) : null;
                      const isUsed = p.condition === 'used';
                      const isInquire = p.pricing_type === 'inquire';
                      const isUSD = p.pricing_type === 'usd';

                      return (
                        <tr key={p.id} className="hover:bg-stone-50/80 transition-colors">
                          <td className="p-4">
                            <img
                              src={p.images[0]}
                              alt={p.title_ar}
                              className="w-12 h-12 rounded-xl object-cover aspect-square border border-stone-200 bg-stone-50"
                            />
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-stone-900 block max-w-xs truncate">
                              {isAr ? p.title_ar : p.title_en}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-stone-600 font-mono">
                              <span className="bg-stone-100 px-1.5 py-0.5 rounded font-sans font-bold text-stone-700">
                                {p.brand}
                              </span>
                              {p.device_type && (
                                <span className="text-stone-600 font-medium">
                                  • {t(`dev_${p.device_type}`) || p.device_type}
                                </span>
                              )}
                              <span>• SKU: {p.sku}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            {isUsed ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[11px] border border-amber-300/60">
                                {t('badge_used')}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-900 text-white font-bold text-[11px]">
                                {t('badge_new')}
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            {isInquire ? (
                              <span className="inline-flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg text-[11px]">
                                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{t('price_on_request')}</span>
                              </span>
                            ) : (
                              <div>
                                <div className="font-bold text-stone-900 text-sm">
                                  {p.price.toLocaleString()} ل.س
                                </div>
                                <div className="text-[10px] text-stone-500 font-mono flex items-center gap-1 mt-0.5">
                                  <span>≈ ${(p.price_usd || convertSYPtoUSD(p.price)).toLocaleString()} USD</span>
                                  {p.pricing_strategy === 'fixed_usd' && (
                                    <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-sans">ثابت $</span>
                                  )}
                                  {p.pricing_strategy === 'auto_daily_rate' && (
                                    <span className="text-[9px] bg-blue-100 text-blue-800 px-1 py-0.2 rounded font-sans">يومي $</span>
                                  )}
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            {cost > 0 ? (
                              <div>
                                <div className="text-stone-600 font-mono text-[11px]">
                                  {cost.toLocaleString()} ل.س
                                </div>
                                {!isInquire && profit > 0 && (
                                  <span className="inline-flex items-center gap-0.5 text-emerald-700 font-bold text-[10px]">
                                    <TrendingUp className="w-2.5 h-2.5" />
                                    <span>+{profit.toLocaleString()} ({marginPercent}%)</span>
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-stone-400">—</span>
                            )}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                                p.stock_quantity > 5
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : p.stock_quantity > 0
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {p.stock_quantity}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenEditProduct(p)}
                                className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                                title={isAr ? 'تعديل الجهاز' : 'Edit product'}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteProduct(p.id)}
                                className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                                title={isAr ? 'حذف الجهاز' : 'Delete product'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Maintenance Tickets */}
        {activeTab === 'maintenance' && (
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-stone-100">
              <h3 className="text-base font-extrabold text-stone-900">
                {isAr ? 'تذاكر صيانة الأجهزة ومتابعة الورشة' : 'Hardware Maintenance Inquiries'}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                {isAr
                  ? 'طلبات الصيانة الواردة عبر الموقع ومخبر الصيانة المعتمد لمتجر الليث'
                  : 'Customer appliance maintenance requests and diagnostic appointments'}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left rtl:text-right">
                <thead className="bg-stone-50 border-b border-stone-100 text-stone-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">{t('ticket_number')}</th>
                    <th className="p-4">{t('customer_name')}</th>
                    <th className="p-4">{isAr ? 'الجهاز والموديل' : 'Device & Model'}</th>
                    <th className="p-4">{isAr ? 'وصف العطل' : 'Problem'}</th>
                    <th className="p-4">{t('status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {maintenanceRequests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-stone-400">
                        {isAr ? 'لا توجد طلبات صيانة حالياً' : 'No maintenance requests recorded'}
                      </td>
                    </tr>
                  ) : (
                    maintenanceRequests.map((m) => (
                      <tr key={m.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="p-4 font-mono font-bold text-stone-900">
                          #{m.request_number}
                          <span className="block text-[10px] text-stone-400 font-normal">
                            {new Date(m.created_at).toLocaleDateString('ar-SY')}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-stone-900 block">{m.customer_name}</span>
                          <span className="text-[11px] text-stone-500 font-mono" dir="ltr">{m.phone}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-stone-900">{m.device_type}</span>
                          <span className="block text-stone-500 text-[11px]">{m.device_model}</span>
                        </td>
                        <td className="p-4 max-w-xs">
                          <p className="line-clamp-2 text-stone-700">{m.issue_description}</p>
                          {m.photo_url && (
                            <a
                              href={m.photo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-700 font-bold text-[10px] hover:underline inline-block mt-1"
                            >
                              {isAr ? 'معاينة الصورة المرفقة' : 'View attachment'}
                            </a>
                          )}
                        </td>
                        <td className="p-4">
                          <select
                            value={m.status}
                            onChange={(e) => updateMaintenanceStatus(m.id, e.target.value as MaintenanceRequest['status'])}
                            className="px-2.5 py-1 rounded-full text-[11px] font-bold border border-stone-200 bg-stone-50 text-stone-900"
                          >
                            <option value="new">{t('order_status_new')}</option>
                            <option value="in_progress">{isAr ? 'قيد الفحص والصيانة' : 'In Progress'}</option>
                            <option value="completed">{isAr ? 'تم الإصلاح والتسليم' : 'Completed'}</option>
                            <option value="cancelled">{isAr ? 'ملغى' : 'Cancelled'}</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Custom Phone Requests */}
        {activeTab === 'requests' && (
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-amber-600" />
                  <span>{isAr ? 'طلبات الأجهزة والهواتف بالاسم' : 'Customer Phone Requests'}</span>
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  {isAr
                    ? 'الطلبات المرسلة من الزبائن لتأمين أجهزة ومواصفات خاصة عبر وتساب'
                    : 'Requests submitted by customers for custom device sourcing'}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                {phoneRequests?.length || 0} {isAr ? 'طلب مسجل' : 'Requests'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right rtl:text-right ltr:text-left text-xs">
                <thead className="bg-stone-50 text-stone-400 font-semibold border-b border-stone-200">
                  <tr>
                    <th className="p-4">رقم الطلب</th>
                    <th className="p-4">العميل والمحافظة</th>
                    <th className="p-4">الجهاز المطلوب</th>
                    <th className="p-4">المواصفات واللون والتخزين</th>
                    <th className="p-4">الحالة</th>
                    <th className="p-4">التاريخ</th>
                    <th className="p-4">وتساب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {!phoneRequests || phoneRequests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-stone-400">
                        {isAr ? 'لا توجد طلبات أجهزة مسجلة حالياً' : 'No phone requests logged yet'}
                      </td>
                    </tr>
                  ) : (
                    phoneRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-stone-50/50">
                        <td className="p-4 font-mono font-bold text-stone-900">#{req.request_number}</td>
                        <td className="p-4">
                          <p className="font-bold text-stone-900">{req.customer_name}</p>
                          <p className="text-stone-500 font-mono text-[11px]" dir="ltr">{req.phone}</p>
                          <p className="text-stone-400 text-[10px] mt-0.5 truncate max-w-[150px]">{req.address}</p>
                        </td>
                        <td className="p-4 font-black text-emerald-800">{req.device_type}</td>
                        <td className="p-4 max-w-xs text-stone-600">
                          <div className="flex flex-wrap gap-1 mb-1">
                            {req.storage && (
                              <span className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 text-[10px] font-bold">
                                {req.storage}
                              </span>
                            )}
                            {req.color && (
                              <span className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 text-[10px]">
                                {req.color}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] truncate" title={req.specifications}>
                            {req.specifications}
                          </p>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            req.condition === 'used'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {req.condition === 'used' ? (isAr ? 'مستعمل' : 'Used') : (isAr ? 'جديد' : 'New')}
                          </span>
                        </td>
                        <td className="p-4 text-stone-400 text-[11px]">
                          {new Date(req.created_at).toLocaleDateString(isAr ? 'ar-SY' : 'en-US')}
                        </td>
                        <td className="p-4">
                          <a
                            href={`https://wa.me/${req.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                              `مرحباً ${req.customer_name}، بخصوص طلبك لجهاز ${req.device_type} (#${req.request_number}): يسعدنا إعلامك بالتوافر والأسعار الحالية...`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors shadow-2xs"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{isAr ? 'رد وتساب' : 'Reply'}</span>
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Store Settings & Syrian Market Configurations */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 sm:p-8">
              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-stone-900 mb-1">
                    {t('store_settings_tab')}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {isAr
                      ? 'إعدادات المتجر في سوريا، شعار المتجر، أسعار الصرف، ومسارات وتساب وGoogle Sheets'
                      : 'Configure store logo, Syrian market currencies, exchange rates, and WhatsApp routing'}
                  </p>
                </div>

                {/* Store Logo Customization */}
                <div className="space-y-4 pt-4 border-t border-stone-100">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-emerald-600" />
                      <span>{t('store_logo')}</span>
                    </h4>
                    <span className="text-[11px] text-stone-400">
                      {isAr ? 'يتم عرضه في أعلى القائمة الرئيسية بدلاً من النص' : 'Displayed at top of main menu'}
                    </span>
                  </div>

                  {/* Current Logo Preview Card */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-white rounded-xl border border-stone-200 shadow-xs flex items-center justify-center min-w-[150px] h-14">
                        <img
                          src={settingsForm.logo_url || defaultStoreLogoSvg}
                          alt="Logo Preview"
                          className="max-h-11 max-w-[160px] object-contain"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-900">
                          {isAr ? 'معاينة الشعار المعتمد' : 'Active Logo Preview'}
                        </p>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {settingsForm.logo_url?.startsWith('data:')
                            ? (isAr ? 'صورة مرفوعة من جهازك' : 'Uploaded file')
                            : settingsForm.logo_url
                            ? (isAr ? 'رابط ويب خارجي' : 'External Web URL')
                            : (isAr ? 'الشعار الافتراضي للمتجر' : 'Default Store Logo')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="admin-upload-logo-file"
                        className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{t('upload_logo')}</span>
                        <input
                          id="admin-upload-logo-file"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                      {settingsForm.logo_url && (
                        <button
                          type="button"
                          onClick={() => setSettingsForm((prev) => ({ ...prev, logo_url: '' }))}
                          className="px-3 py-2 rounded-xl border border-stone-300 hover:bg-stone-200 text-stone-600 text-xs font-bold transition-colors"
                        >
                          {isAr ? 'استعادة الافتراضي' : 'Reset Default'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Direct URL Input */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {isAr ? 'أو أدخل رابط صورة الشعار مباشرة (URL)' : 'Or enter logo image URL directly'}
                    </label>
                    <input
                      type="text"
                      value={settingsForm.logo_url}
                      onChange={(e) => setSettingsForm({ ...settingsForm, logo_url: e.target.value })}
                      placeholder="https://example.com/logo.png"
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-mono"
                      dir="ltr"
                    />
                  </div>

                  {/* Preset Logos */}
                  <div>
                    <label className="block text-[11px] font-bold text-stone-500 mb-2">
                      {isAr ? 'نماذج شعارات عصرية جاهزة (اضغط للاختيار فوراً):' : 'Modern logo presets (click to apply):'}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {logoPresets.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setSettingsForm((prev) => ({ ...prev, logo_url: preset.svgDataUrl }));
                            showToast(isAr ? `تم اختيار: ${preset.name_ar}` : `Selected: ${preset.name_en}`);
                          }}
                          className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                            settingsForm.logo_url === preset.svgDataUrl
                              ? 'border-emerald-500 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-500'
                              : 'border-stone-200 hover:border-stone-300 bg-white'
                          }`}
                        >
                          <div className="h-9 w-full flex items-center justify-center p-1 bg-stone-50 rounded-lg">
                            <img src={preset.svgDataUrl} alt={preset.name_en} className="max-h-7 max-w-full object-contain" />
                          </div>
                          <span className="text-[10px] font-bold text-stone-700 truncate w-full">
                            {isAr ? preset.name_ar : preset.name_en}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Currency & Exchange Rate in Syria */}
                <div className="space-y-4 pt-4 border-t border-stone-100">
                  <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>{isAr ? 'العملة وسعر الصرف في السوق السوري' : 'Currencies & Exchange Rate'}</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {isAr ? 'العملة الأساسية' : 'Primary Currency'}
                      </label>
                      <input
                        type="text"
                        disabled
                        value="الليرة السورية (ل.س / SYP)"
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-100 text-stone-600 text-xs font-bold cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {isAr ? 'سعر صرف الدولار (ل.س لكل 1 دولار)' : 'USD Exchange Rate (SYP per 1 USD)'} *
                      </label>
                      <input
                        type="number"
                        required
                        value={settingsForm.usd_exchange_rate}
                        onChange={(e) => setSettingsForm({ ...settingsForm, usd_exchange_rate: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm font-mono font-bold text-stone-900"
                      />
                      <p className="text-[11px] text-stone-500 mt-1">
                        {isAr ? 'يستخدم لتحويل الأسعار تلقائياً عند اختيار الزبون لعرض الأسعار بالدولار الأمريكي.' : 'Used for dual conversion when switching to USD.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Numbers */}
                <div className="space-y-4 pt-4 border-t border-stone-100">
                  <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>{isAr ? 'أرقام وتساب لمتجر الليث' : 'WhatsApp Routing Numbers'}</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {isAr ? 'رقم وتساب المبيعات واستلام الفواتير' : 'Sales WhatsApp Number'} *
                      </label>
                      <input
                        type="text"
                        value={settingsForm.whatsapp_number}
                        onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp_number: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm font-mono"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {isAr ? 'رقم وتساب مخبر الصيانة' : 'Maintenance Lab WhatsApp'}
                      </label>
                      <input
                        type="text"
                        value={settingsForm.maintenance_whatsapp}
                        onChange={(e) => setSettingsForm({ ...settingsForm, maintenance_whatsapp: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm font-mono"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Fees in Syrian Lira */}
                <div className="space-y-4 pt-4 border-t border-stone-100">
                  <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-stone-600" />
                    <span>{isAr ? 'أجور التوصيل بين المحافظات (ل.س)' : 'Delivery Fees (SYP)'}</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {isAr ? 'أجور التوصيل القياسية (ل.س)' : 'Base Delivery Fee (SYP)'}
                      </label>
                      <input
                        type="number"
                        value={settingsForm.delivery_fee_base}
                        onChange={(e) => setSettingsForm({ ...settingsForm, delivery_fee_base: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {isAr ? 'الحد الأدنى للتوصيل المجاني (ل.س)' : 'Free Delivery Threshold (SYP)'}
                      </label>
                      <input
                        type="number"
                        value={settingsForm.free_delivery_threshold}
                        onChange={(e) => setSettingsForm({ ...settingsForm, free_delivery_threshold: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Google Sheets Webhook Integration */}
                <div className="space-y-4 pt-4 border-t border-stone-100">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span>{t('google_sheets_webhook')}</span>
                    </h4>
                    <button
                      type="button"
                      onClick={handleTestWebhook}
                      disabled={isTestingWebhook}
                      className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1"
                    >
                      {isTestingWebhook ? (
                        <span>{isAr ? 'جاري الاختبار...' : 'Testing...'}</span>
                      ) : (
                        <>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>{t('test_webhook')}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Google Apps Script Webhook URL (POST)
                    </label>
                    <input
                      type="url"
                      value={settingsForm.google_sheets_webhook_url}
                      onChange={(e) => setSettingsForm({ ...settingsForm, google_sheets_webhook_url: e.target.value })}
                      placeholder="https://script.google.com/macros/s/.../exec"
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-mono"
                      dir="ltr"
                    />
                    <p className="text-[11px] text-stone-400 mt-1">
                      {isAr
                        ? 'يتم تدوين كل طلب جديد آلياً في جدول Google Sheets الخاص بمتجر الليث.'
                        : 'Every new order is automatically posted as a new row in your connected Google Sheet.'}
                    </p>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t border-stone-100">
                  <button
                    id="admin-save-settings-btn"
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm transition-colors shadow-md active:scale-95"
                  >
                    <Save className="w-4 h-4 text-emerald-400" />
                    <span>{t('save_settings')}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Google Sheets Sync Activity Logs */}
            {sheetsSyncLogs.length > 0 && (
              <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-5">
                <h4 className="text-xs font-bold text-stone-900 mb-3 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>{isAr ? 'سجل عمليات المزامنة مع Google Sheets' : 'Google Sheets Sync Activity Logs'}</span>
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto font-mono text-xs">
                  {sheetsSyncLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                        log.status === 'success'
                          ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                          : 'bg-rose-50/50 border-rose-200 text-rose-900'
                      }`}
                    >
                      <span className="font-semibold">{log.message}</span>
                      <span className="text-[10px] text-stone-500 flex-shrink-0">{log.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal: Add/Edit Product with 1:1 square photo guarantee and cost margin */}
        {isProductModalOpen && editingProduct && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div
              className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="font-extrabold text-stone-900 text-base">
                  {editingProduct.title_ar ? editingProduct.title_ar : t('add_new_product')}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {isAr ? 'اسم الجهاز بالعربية' : 'Title (Arabic)'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProduct.title_ar}
                      onChange={(e) => setEditingProduct({ ...editingProduct, title_ar: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {isAr ? 'اسم الجهاز بالإنجليزية' : 'Title (English)'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProduct.title_en}
                      onChange={(e) => setEditingProduct({ ...editingProduct, title_en: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                {/* Section: Device Classification, Brand & Condition */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                  <h4 className="text-xs font-black text-stone-900 flex items-center justify-between">
                    <span>{isAr ? 'تصنيف الجهاز وحالة الاستخدام' : 'Device Type, Brand & Condition'}</span>
                    <span className="text-[10px] text-stone-600 font-bold">{isAr ? 'مخصص للهواتف والإلكترونيات' : 'Electronics & Mobiles'}</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Device Type */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {t('device_type_label')} *
                      </label>
                      <select
                        value={editingProduct.device_type || 'phone'}
                        onChange={(e) => setEditingProduct({ ...editingProduct, device_type: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-bold text-stone-800"
                      >
                        <option value="phone">{isAr ? '📱 هاتف ذكي (Phone)' : '📱 Smartphone'}</option>
                        <option value="tablet">{isAr ? '💻 جهاز لوحي / آيباد (Tablet)' : '💻 Tablet / iPad'}</option>
                        <option value="laptop">{isAr ? '💻 كمبيوتر محمول / لابتوب' : '💻 Laptop'}</option>
                        <option value="smartwatch">{isAr ? '⌚ ساعة ذكية (Smartwatch)' : '⌚ Smartwatch'}</option>
                        <option value="accessories">{isAr ? '🎧 إكسسوارات وملحقات' : '🎧 Accessories'}</option>
                        <option value="network_router">{isAr ? '📡 راوتر وشبكات (Router)' : '📡 Network / Router'}</option>
                        <option value="other">{isAr ? '🔌 جهاز إلكتروني آخر' : '🔌 Other Electronic'}</option>
                      </select>
                    </div>

                    {/* Brand with Quick Add Inline */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-stone-700">
                          {isAr ? 'الماركة / الشركة' : 'Brand'} *
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowQuickBrandInput(!showQuickBrandInput)}
                          className="text-[11px] text-stone-600 hover:text-stone-900 font-bold underline"
                        >
                          {showQuickBrandInput ? (isAr ? 'إلغاء' : 'Cancel') : (isAr ? '+ ماركة جديدة' : '+ New Brand')}
                        </button>
                      </div>

                      {showQuickBrandInput ? (
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={quickBrandName}
                            onChange={(e) => setQuickBrandName(e.target.value)}
                            placeholder={isAr ? 'اسم الماركة' : 'Brand name'}
                            className="flex-1 px-2.5 py-1.5 rounded-xl border border-stone-300 bg-white text-xs"
                          />
                          <button
                            type="button"
                            onClick={(e) => handleAddQuickBrand(e)}
                            className="px-2.5 py-1.5 bg-stone-900 text-white rounded-xl text-xs font-bold"
                          >
                            {isAr ? 'حفظ' : 'Add'}
                          </button>
                        </div>
                      ) : (
                        <select
                          value={editingProduct.brand}
                          onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-bold text-stone-800"
                        >
                          {brands.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {isAr ? 'فئة المتجر' : 'Category'} *
                      </label>
                      <select
                        value={editingProduct.category_id}
                        onChange={(e) => setEditingProduct({ ...editingProduct, category_id: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs text-stone-800"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {isAr ? c.name_ar : c.name_en}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Condition Selector (Used vs New) */}
                  <div className="pt-2 border-t border-stone-200/60">
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      {t('condition_label')} *
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setEditingProduct({ ...editingProduct, condition: 'new' })}
                        className={`p-3 rounded-xl border text-right rtl:text-right ltr:text-left transition-all ${
                          editingProduct.condition === 'new'
                            ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        <div className="font-extrabold text-xs flex items-center justify-between">
                          <span>✨ {t('condition_new')}</span>
                          {editingProduct.condition === 'new' && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          )}
                        </div>
                        <p className={`text-[10px] mt-0.5 ${editingProduct.condition === 'new' ? 'text-stone-300' : 'text-stone-400'}`}>
                          {isAr ? 'جهاز جديد كلياً غير مستعمل بختم الوكالة' : 'Brand new sealed in original packaging'}
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingProduct({ ...editingProduct, condition: 'used' })}
                        className={`p-3 rounded-xl border text-right rtl:text-right ltr:text-left transition-all ${
                          editingProduct.condition === 'used'
                            ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-xs font-bold'
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        <div className="font-extrabold text-xs flex items-center justify-between">
                          <span>🔄 {t('condition_used')}</span>
                          {editingProduct.condition === 'used' && (
                            <span className="w-2 h-2 rounded-full bg-stone-950"></span>
                          )}
                        </div>
                        <p className={`text-[10px] mt-0.5 ${editingProduct.condition === 'used' ? 'text-amber-950' : 'text-stone-400'}`}>
                          {isAr ? 'جهاز مستعمل خاضع لفحص شامل في مخبر الليث' : 'Pre-owned certified & inspected in lab'}
                        </p>
                      </button>
                    </div>

                    {/* Condition Details input (especially for used devices) */}
                    {editingProduct.condition === 'used' && (
                      <div className="mt-2.5 animate-in fade-in duration-150">
                        <label className="block text-[11px] font-bold text-amber-900 mb-1">
                          {t('condition_details_label')}
                        </label>
                        <input
                          type="text"
                          value={editingProduct.condition_details || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, condition_details: e.target.value })}
                          placeholder={t('condition_details_placeholder')}
                          className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-amber-50/70 text-xs text-amber-950 font-medium focus:bg-white focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Section: Dynamic Pricing System (SYP Base, Secondary USD, and 3 Admin Calculation Modes) */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <label className="text-xs font-black text-stone-900 block">
                        {isAr ? 'نظام التسعير والعملات (الأساس: ليرة سورية | الثانوي: دولار)' : 'Pricing System (Base: SYP | Secondary: USD)'} *
                      </label>
                      <span className="text-[11px] text-stone-500">
                        {isAr
                          ? 'العملة الأساسية في المتجر هي الليرة السورية، ويظهر الدولار كعملة ثانوية.'
                          : 'Store base price is Syrian Lira (SYP), with US Dollar ($) as secondary price.'}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 shrink-0">
                      1$ = {storeSettings.usd_exchange_rate_syp.toLocaleString()} ل.س
                    </span>
                  </div>

                  {/* Main Mode Toggle: Standard Price vs Inquire on WhatsApp */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingProduct({
                        ...editingProduct,
                        pricing_type: 'syp',
                        pricing_strategy: editingProduct.pricing_strategy || 'auto_daily_rate'
                      })}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border text-center ${
                        editingProduct.pricing_type !== 'inquire'
                          ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {isAr ? 'تسعير مالي معروض (ليرة سورية + دولار)' : 'Visible Price (SYP & USD)'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingProduct({ ...editingProduct, pricing_type: 'inquire' })}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border text-center ${
                        editingProduct.pricing_type === 'inquire'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {t('pricing_type_inquire')}
                    </button>
                  </div>

                  {/* When Not Inquire: The 3 Requested Admin Pricing Calculation Modes */}
                  {editingProduct.pricing_type !== 'inquire' && (
                    <div className="space-y-3 pt-1 animate-in fade-in duration-150">
                      <div>
                        <label className="block text-[11px] font-extrabold text-stone-800 mb-1.5">
                          {isAr ? 'طريقة تحديد واحتساب السعر في لوحة التحكم:' : 'Admin Calculation Strategy:'}
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {/* Option 1: Auto calculate based on daily exchange rate */}
                          <button
                            type="button"
                            onClick={() => {
                              const usd = editingProduct.price_usd || convertSYPtoUSD(editingProduct.price);
                              const syp = Math.round(usd * storeSettings.usd_exchange_rate_syp);
                              setEditingProduct({
                                ...editingProduct,
                                pricing_strategy: 'auto_daily_rate',
                                price_usd: usd,
                                price: syp
                              });
                            }}
                            className={`p-2.5 rounded-xl border text-right rtl:text-right ltr:text-left transition-all ${
                              (editingProduct.pricing_strategy === 'auto_daily_rate' || !editingProduct.pricing_strategy)
                                ? 'bg-amber-50 border-amber-400 text-stone-900 shadow-xs'
                                : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                            }`}
                          >
                            <div className="text-xs font-black flex items-center justify-between">
                              <span>🔄 {isAr ? 'حساب تلقائي يومي' : 'Auto Daily Rate'}</span>
                              {(editingProduct.pricing_strategy === 'auto_daily_rate' || !editingProduct.pricing_strategy) && (
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                              )}
                            </div>
                            <p className="text-[10px] text-stone-500 mt-1 leading-tight">
                              {isAr ? 'حساب السعر تلقائياً بناءً على سعر صرف الدولار اليومي (sp-today)' : 'Auto-calculated based on daily live exchange rate'}
                            </p>
                          </button>

                          {/* Option 2: Treat USD as the base price */}
                          <button
                            type="button"
                            onClick={() => {
                              const usd = editingProduct.price_usd || convertSYPtoUSD(editingProduct.price);
                              const syp = Math.round(usd * storeSettings.usd_exchange_rate_syp);
                              setEditingProduct({
                                ...editingProduct,
                                pricing_strategy: 'usd_as_base',
                                price_usd: usd,
                                price: syp
                              });
                            }}
                            className={`p-2.5 rounded-xl border text-right rtl:text-right ltr:text-left transition-all ${
                              editingProduct.pricing_strategy === 'usd_as_base'
                                ? 'bg-amber-50 border-amber-400 text-stone-900 shadow-xs'
                                : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                            }`}
                          >
                            <div className="text-xs font-black flex items-center justify-between">
                              <span>💵 {isAr ? 'الدولار كأساس' : 'USD as Base Price'}</span>
                              {editingProduct.pricing_strategy === 'usd_as_base' && (
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                              )}
                            </div>
                            <p className="text-[10px] text-stone-500 mt-1 leading-tight">
                              {isAr ? 'اعتماد الدولار كسعر أساسي وتحويله لليرة السورية مع إظهار الدولار' : 'Treat USD as internal base; site presents SYP as primary'}
                            </p>
                          </button>

                          {/* Option 3: Set a fixed price in dollars */}
                          <button
                            type="button"
                            onClick={() => {
                              const usd = editingProduct.price_usd || convertSYPtoUSD(editingProduct.price);
                              const syp = Math.round(usd * storeSettings.usd_exchange_rate_syp);
                              setEditingProduct({
                                ...editingProduct,
                                pricing_strategy: 'fixed_usd',
                                price_usd: usd,
                                price: syp
                              });
                            }}
                            className={`p-2.5 rounded-xl border text-right rtl:text-right ltr:text-left transition-all ${
                              editingProduct.pricing_strategy === 'fixed_usd'
                                ? 'bg-amber-50 border-amber-400 text-stone-900 shadow-xs'
                                : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                            }`}
                          >
                            <div className="text-xs font-black flex items-center justify-between">
                              <span>🔒 {isAr ? 'سعر ثابت بالدولار' : 'Fixed USD Price'}</span>
                              {editingProduct.pricing_strategy === 'fixed_usd' && (
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                              )}
                            </div>
                            <p className="text-[10px] text-stone-500 mt-1 leading-tight">
                              {isAr ? 'تحديد سعر ثابت غير متغير بالدولار، وتُحسب الليرة بالصرف الجاري' : 'Fixed dollar price converted to SYP at active exchange rate'}
                            </p>
                          </button>
                        </div>
                      </div>

                      {/* Inputs depending on the strategy */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        {/* Cost Price */}
                        <div>
                          <label className="block text-[11px] font-bold text-stone-700 mb-1">
                            {isAr ? 'سعر التكلفة (ل.س)' : 'Cost Price (SYP)'}
                          </label>
                          <input
                            type="number"
                            value={editingProduct.cost_price || ''}
                            onChange={(e) => setEditingProduct({ ...editingProduct, cost_price: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-mono font-bold"
                            placeholder="ليرة سورية"
                          />
                        </div>

                        {/* USD Input: Primary input when auto, usd_as_base, or fixed_usd */}
                        {(editingProduct.pricing_strategy === 'auto_daily_rate' ||
                          editingProduct.pricing_strategy === 'usd_as_base' ||
                          editingProduct.pricing_strategy === 'fixed_usd' ||
                          !editingProduct.pricing_strategy) ? (
                          <>
                            <div>
                              <label className="block text-[11px] font-bold text-stone-900 mb-1">
                                {editingProduct.pricing_strategy === 'fixed_usd'
                                  ? (isAr ? 'السعر الثابت بالدولار ($ USD) *' : 'Fixed USD Price ($ USD) *')
                                  : editingProduct.pricing_strategy === 'usd_as_base'
                                  ? (isAr ? 'سعر الأساس بالدولار ($ USD) *' : 'Base Price in USD ($ USD) *')
                                  : (isAr ? 'سعر الدولار اليومي ($ USD) *' : 'Daily Dollar Price ($ USD) *')}
                              </label>
                              <input
                                type="number"
                                required
                                step="any"
                                value={editingProduct.price_usd || ''}
                                onChange={(e) => {
                                  const usd = Number(e.target.value);
                                  const syp = Math.round(usd * storeSettings.usd_exchange_rate_syp);
                                  setEditingProduct({
                                    ...editingProduct,
                                    price_usd: usd,
                                    price: syp
                                  });
                                }}
                                className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-amber-50/40 text-xs font-mono font-black text-stone-900 focus:bg-white"
                              />
                              <span className="text-[10px] text-emerald-700 font-bold mt-1 block">
                                {isAr
                                  ? `يعادل للمشتري: ${editingProduct.price.toLocaleString()} ل.س`
                                  : `Customer Base: ${editingProduct.price.toLocaleString()} SYP`}
                              </span>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                                {isAr ? 'السعر قبل الخصم ($ USD)' : 'Compare at Price ($ USD)'}
                              </label>
                              <input
                                type="number"
                                step="any"
                                value={editingProduct.compare_at_price_usd || ''}
                                onChange={(e) => {
                                  const compUsd = Number(e.target.value) || undefined;
                                  setEditingProduct({
                                    ...editingProduct,
                                    compare_at_price_usd: compUsd,
                                    compare_at_price: compUsd ? Math.round(compUsd * storeSettings.usd_exchange_rate_syp) : undefined
                                  });
                                }}
                                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-mono"
                                placeholder="اختياري"
                              />
                            </div>
                          </>
                        ) : (
                          // Manual SYP fallback
                          <>
                            <div>
                              <label className="block text-[11px] font-bold text-stone-900 mb-1">
                                {isAr ? 'سعر البيع الأساسي (ل.س) *' : 'Selling Price (SYP) *'}
                              </label>
                              <input
                                type="number"
                                required
                                value={editingProduct.price}
                                onChange={(e) => {
                                  const syp = Number(e.target.value);
                                  setEditingProduct({
                                    ...editingProduct,
                                    price: syp,
                                    price_usd: convertSYPtoUSD(syp)
                                  });
                                }}
                                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-mono font-black text-stone-900"
                              />
                              <span className="text-[10px] text-stone-400 font-mono mt-1 block">
                                ≈ ${convertSYPtoUSD(editingProduct.price)} USD
                              </span>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                                {isAr ? 'السعر قبل الخصم (ل.س)' : 'Compare at Price (SYP)'}
                              </label>
                              <input
                                type="number"
                                value={editingProduct.compare_at_price || ''}
                                onChange={(e) => setEditingProduct({ ...editingProduct, compare_at_price: Number(e.target.value) || undefined })}
                                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-mono"
                                placeholder="اختياري"
                              />
                            </div>
                          </>
                        )}
                      </div>

                      {/* Display Preview pill */}
                      <div className="p-3 bg-white rounded-xl border border-stone-200/90 flex items-center justify-between text-xs">
                        <span className="text-stone-600 font-medium">
                          {isAr ? 'معاينة ظهور السعر للزبون في الموقع:' : 'Storefront Price Appearance:'}
                        </span>
                        <div className="text-right rtl:text-left">
                          <span className="font-black text-stone-900 text-sm">
                            {editingProduct.price.toLocaleString()} ل.س
                          </span>
                          <span className="text-stone-400 font-mono text-[11px] mx-1.5">•</span>
                          <span className="text-stone-500 font-mono text-xs">
                            ${(editingProduct.price_usd || convertSYPtoUSD(editingProduct.price)).toLocaleString()} USD
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Case 3: Inquire on WhatsApp */}
                  {editingProduct.pricing_type === 'inquire' && (
                    <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 space-y-2 animate-in fade-in duration-150">
                      <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                        <MessageCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>{isAr ? 'نظام "استفسر عن السعر" عبر واتساب مفعّل' : 'WhatsApp Price Inquiry Active'}</span>
                      </div>
                      <p className="text-[11px] text-emerald-800 leading-relaxed">
                        {isAr
                          ? 'لن يظهر أي سعر محدد على الموقع. سيتم استبدال زر الشراء بزر واتساب مباشر يفتح محادثة مجهزة باسم ومواصفات الجهاز للاستفسار من المبيعات فوراً.'
                          : 'No fixed price is displayed. The add-to-cart button will be replaced with a WhatsApp button redirecting customers directly to your sales team with product details pre-filled.'}
                      </p>
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          {isAr ? 'سعر التكلفة التقديري الداخلي (اختياري - للمستودع فقط)' : 'Internal Cost Reference (Optional)'}
                        </label>
                        <input
                          type="number"
                          value={editingProduct.cost_price || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, cost_price: Number(e.target.value) })}
                          placeholder="ليرة سورية"
                          className="w-48 px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-xs font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {/* Profit Margin Preview for SYP and USD */}
                  {editingProduct.pricing_type !== 'inquire' && editingProduct.cost_price && editingProduct.price > editingProduct.cost_price && (
                    <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-800 text-xs font-semibold flex items-center justify-between">
                      <span>{isAr ? 'صافي الربح المتوقع لكل قطعة:' : 'Expected Net Profit:'}</span>
                      <span className="font-mono font-black">
                        +{(editingProduct.price - editingProduct.cost_price).toLocaleString()} ل.س 
                        ({Math.round(((editingProduct.price - editingProduct.cost_price) / editingProduct.price) * 100)}%)
                      </span>
                    </div>
                  )}
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isAr ? 'الكمية المتوفرة في المستودع' : 'Stock Quantity'} *
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.stock_quantity}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock_quantity: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm font-mono font-bold"
                  />
                </div>

                {/* Primary Image URL & 1:1 Aspect Ratio Preview */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isAr ? 'رابط صورة المنتج (مربعة 1:1)' : 'Product Image URL (Square 1:1 Aspect Ratio)'} *
                  </label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="url"
                      required
                      value={editingProduct.images[0] || ''}
                      onChange={(e) => {
                        const newImgs = [...editingProduct.images];
                        newImgs[0] = e.target.value;
                        setEditingProduct({ ...editingProduct, images: newImgs });
                      }}
                      className="flex-1 px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-mono"
                      dir="ltr"
                    />
                    {editingProduct.images[0] && (
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 flex-shrink-0 aspect-square">
                        <img
                          src={editingProduct.images[0]}
                          alt="preview"
                          className="w-full h-full object-cover aspect-square"
                        />
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1">
                    {isAr ? 'ملاحظة: لضمان تناسق العرض، تظهر كافة الصور بنسبة أبعاد مربعة 1:1.' : 'All product images strictly render in 1:1 square aspect ratio.'}
                  </p>
                </div>

                {/* Description AR */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isAr ? 'الوصف ومواصفات الجهاز (بالعربية)' : 'Description (Arabic)'}
                  </label>
                  <textarea
                    rows={2}
                    value={editingProduct.description_ar}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description_ar: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs"
                  />
                </div>

                {/* Product Alert Tags */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    {isAr ? 'علامات التنبيه الترويجية والتحذيرية (Tags)' : 'Product Alert Tags'}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { key: 'deal_of_the_day', label: isAr ? '⚡ عرض اليوم' : 'Deal of Day' },
                      { key: 'lab_certified', label: isAr ? '🔬 فحص مخبري 100%' : 'Lab Tested' },
                      { key: 'bestseller', label: isAr ? '⭐ الأكثر طلباً' : 'Bestseller' },
                      { key: 'sale', label: isAr ? '🔥 تخفيض خاص' : 'Special Sale' },
                      { key: 'limited_stock', label: isAr ? '⏳ كمية محدودة' : 'Limited Stock' },
                      { key: 'free_shipping', label: isAr ? '🚚 شحن مجاني' : 'Free Shipping' },
                      { key: 'warranty', label: isAr ? '🛡️ كفالة معتمدة' : 'Warranty' }
                    ].map((tItem) => {
                      const isSelected = (editingProduct.tags || []).includes(tItem.key);
                      return (
                        <button
                          key={tItem.key}
                          type="button"
                          onClick={() => {
                            const cur = editingProduct.tags || [];
                            const next = isSelected ? cur.filter((k) => k !== tItem.key) : [...cur, tItem.key];
                            setEditingProduct({ ...editingProduct, tags: next });
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                            isSelected
                              ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                              : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {tItem.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="flex gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProduct.is_featured}
                      onChange={(e) => setEditingProduct({ ...editingProduct, is_featured: e.target.checked })}
                      className="w-4 h-4 accent-stone-900 rounded"
                    />
                    <span className="text-xs font-bold text-stone-800">
                      {isAr ? 'منتج مميز بالصفحة الرئيسية' : 'Featured on Homepage'}
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProduct.is_deal_of_the_day}
                      onChange={(e) => setEditingProduct({ ...editingProduct, is_deal_of_the_day: e.target.checked })}
                      className="w-4 h-4 accent-stone-900 rounded"
                    />
                    <span className="text-xs font-bold text-stone-800">
                      {isAr ? 'عرض اليوم الحصري' : 'Deal of the Day'}
                    </span>
                  </label>
                </div>

                <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 text-xs font-bold"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    id="admin-save-product-submit"
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800"
                  >
                    {isAr ? 'حفظ الجهاز في الكتالوج' : 'Save Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
