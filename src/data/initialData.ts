import { Product, Category, HeroSlide, PromotionalOffer, StoreSettings, MaintenanceRequest, Order, PhoneRequest } from '../types';
import { defaultStoreLogoSvg } from './logoPresets';

export const initialBrands: string[] = [
  'Apple',
  'Samsung',
  'Xiaomi',
  'Huawei',
  'Google',
  'Honor',
  'Realme',
  'Infinix',
  'Tecno',
  'Sony',
  'Anker',
  'Baseus',
  'OnePlus',
  'Nothing',
  'Dyson',
  'Lenovo',
  'Asus'
];

export const initialCategories: Category[] = [
  {
    id: 'cat-smartphones',
    name_ar: 'الهواتف الذكية',
    name_en: 'Smartphones',
    slug: 'smartphones',
    image_url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&h=800&q=80',
    sort_order: 1,
    icon_name: 'Smartphone'
  },
  {
    id: 'cat-appliances',
    name_ar: 'الأجهزة والأجهزة المنزلية',
    name_en: 'Home Appliances',
    slug: 'home-appliances',
    image_url: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&h=800&q=80',
    sort_order: 2,
    icon_name: 'Home'
  },
  {
    id: 'cat-audio-accessories',
    name_ar: 'الصوتيات والإكسسوارات',
    name_en: 'Audio & Accessories',
    slug: 'audio-accessories',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&h=800&q=80',
    sort_order: 3,
    icon_name: 'Headphones'
  },
  {
    id: 'cat-laptops-tablets',
    name_ar: 'الحواسيب واللوحيات',
    name_en: 'Laptops & Tablets',
    slug: 'laptops-tablets',
    image_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&h=800&q=80',
    sort_order: 4,
    icon_name: 'Tablet'
  }
];

export const initialProducts: Product[] = [
  {
    id: 'prod-iphone-16-pro-max',
    title_ar: 'آبل آيفون 16 برو ماكس (تيتانيوم صحراوي) - جديد',
    title_en: 'Apple iPhone 16 Pro Max (Desert Titanium) - New',
    slug: 'apple-iphone-16-pro-max',
    description_ar: 'أقوى هواتف آبل مزود بشريحة A18 Pro المتطورة، وهيكل من التيتانيوم المصقول، وزر التحكم في الكاميرا، ونظام كاميرات احترافي 48 ميجابكسل مع تقريب بصري 5x.',
    description_en: 'Apple flagship powered by A18 Pro chip, Grade 5 titanium frame, Camera Control button, and pro 48MP triple-lens optical system with 5x zoom.',
    pricing_type: 'usd',
    price_usd: 1250,
    compare_at_price_usd: 1320,
    price: 18750000, // ~1,250 USD in SYP
    compare_at_price: 19800000,
    cost_price: 17500000,
    condition: 'new',
    device_type: 'smartphone',
    category_id: 'cat-smartphones',
    brand: 'Apple',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&h=800&q=80',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&h=800&q=80'
    ],
    variants: [
      {
        name_ar: 'سعة التخزين',
        name_en: 'Storage Capacity',
        options: ['256GB', '512GB', '1TB']
      },
      {
        name_ar: 'اللون',
        name_en: 'Color',
        options: ['Desert Titanium', 'Natural Titanium', 'Black Titanium', 'White Titanium']
      }
    ],
    stock_quantity: 12,
    is_featured: true,
    is_new: true,
    is_deal_of_the_day: true,
    rating: 4.9,
    reviews_count: 84,
    tags: ['bestseller', 'warranty'],
    sku: 'APL-IPH16PM-256',
    specs: [
      { key_ar: 'الشاشة', key_en: 'Display', val_ar: 'Super Retina XDR OLED بحجم 6.9 بوصة 120Hz', val_en: '6.9-inch Super Retina XDR OLED 120Hz' },
      { key_ar: 'المعالج', key_en: 'Processor', val_ar: 'Apple A18 Pro سداسي النواة (3nm)', val_en: 'Apple A18 Pro (3nm)' },
      { key_ar: 'الكاميرا الرئيسية', key_en: 'Main Camera', val_ar: '48MP عريضة + 48MP فائقة الاتساع + 12MP بيريسكوب 5x', val_en: '48MP Wide + 48MP Ultra-wide + 12MP 5x Telephoto' },
      { key_ar: 'الشبكة والشرائح', key_en: 'SIM & Network', val_ar: 'شريحة فعلية Nano-SIM + شريحة إلكترونية eSIM مع دعم 5G', val_en: 'Nano-SIM + eSIM with 5G' }
    ],
    warranty_ar: 'كفالة الليث المعتمدة لمدة سنة كاملة مع فحص وصيانة مجانية',
    warranty_en: '1-Year Al-Laith Authorized Warranty with free diagnostics',
    created_at: '2026-02-01T10:00:00Z'
  },
  {
    id: 'prod-iphone-14-pro-used',
    title_ar: 'آبل آيفون 14 برو ماكس 256GB (مستعمل بحالة الوكالة 98%)',
    title_en: 'Apple iPhone 14 Pro Max 256GB (Used - Like New 98%)',
    slug: 'apple-iphone-14-pro-max-used',
    description_ar: 'جهاز مستعمل نظيف جداً مفحوص بالكامل في مخبر صيانة الليث. نسبة صحة البطارية 92%، بدون أي خدوش، مع العلبة وكابل الشحن الأصلي.',
    description_en: 'Pre-owned in pristine cosmetic and operational condition. 92% battery health, fully tested by Al-Laith technicians, includes original box and cable.',
    pricing_type: 'usd',
    price_usd: 780,
    compare_at_price_usd: 850,
    price: 11700000,
    compare_at_price: 12750000,
    cost_price: 10500000,
    condition: 'used',
    condition_details: 'نظافة 98% • نسبة بطارية 92% • فحص فني شامل في مخبر الليث',
    device_type: 'smartphone',
    category_id: 'cat-smartphones',
    brand: 'Apple',
    images: [
      'https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?auto=format&fit=crop&w=800&h=800&q=80',
      'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?auto=format&fit=crop&w=800&h=800&q=80'
    ],
    variants: [
      {
        name_ar: 'اللون',
        name_en: 'Color',
        options: ['Deep Purple', 'Space Black', 'Gold']
      }
    ],
    stock_quantity: 3,
    is_featured: true,
    is_new: false,
    rating: 4.8,
    reviews_count: 29,
    tags: ['lab_certified', 'limited_stock'],
    sku: 'APL-IPH14PM-USED',
    specs: [
      { key_ar: 'الحالة الفنية', key_en: 'Condition', val_ar: 'مستعمل ممتاز فحص مخبري 100%', val_en: 'Grade A+ Certified' },
      { key_ar: 'صحة البطارية', key_en: 'Battery Health', val_ar: '92% أصلية وكالة', val_en: '92% Original' },
      { key_ar: 'التخزين والرام', key_en: 'Storage & RAM', val_ar: '256GB + 6GB RAM', val_en: '256GB + 6GB RAM' }
    ],
    warranty_ar: 'كفالة تجربة وفحص لمدة شهر كامل من مخبر الليث للاتصالات',
    warranty_en: '1-Month Testing & Inspection Warranty from Al-Laith Lab',
    created_at: '2026-02-15T11:00:00Z'
  },
  {
    id: 'prod-samsung-s25-ultra',
    title_ar: 'سامسونج جالكسي S25 ألترا 5G المدعوم بـ Galaxy AI',
    title_en: 'Samsung Galaxy S25 Ultra 5G with Galaxy AI',
    slug: 'samsung-galaxy-s25-ultra',
    description_ar: 'قمة ابتكارات سامسونج مع قلم S Pen مدمج، معالج Snapdragon 8 Elite مخصص، كاميرا 200 ميجابكسل خارقة، وشاشة Dynamic AMOLED 2X مسطحة مضادة للانعكاس.',
    description_en: 'The pinnacle of mobile engineering featuring integrated S Pen, Snapdragon 8 Elite Galaxy Edition, 200MP camera, and flat AMOLED 2X display.',
    pricing_type: 'syp',
    price: 17250000, // ~1,150 USD in SYP
    compare_at_price: 18500000,
    cost_price: 16000000,
    condition: 'new',
    device_type: 'smartphone',
    category_id: 'cat-smartphones',
    brand: 'Samsung',
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&h=800&q=80',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&h=800&q=80'
    ],
    variants: [
      {
        name_ar: 'سعة التخزين',
        name_en: 'Storage',
        options: ['256GB', '512GB']
      },
      {
        name_ar: 'اللون',
        name_en: 'Color',
        options: ['Titanium Gray', 'Titanium Black', 'Titanium Silver']
      }
    ],
    stock_quantity: 8,
    is_featured: true,
    is_new: true,
    rating: 4.8,
    reviews_count: 62,
    sku: 'SAM-S25U-256',
    specs: [
      { key_ar: 'الشاشة', key_en: 'Display', val_ar: 'Dynamic AMOLED 2X بحجم 6.8 بوصة QHD+ 120Hz', val_en: '6.8-inch Dynamic AMOLED 2X QHD+ 120Hz' },
      { key_ar: 'المعالج', key_en: 'Processor', val_ar: 'Snapdragon 8 Elite ثماني النواة', val_en: 'Snapdragon 8 Elite Octa-core' },
      { key_ar: 'الكاميرا', key_en: 'Camera', val_ar: '200MP رئيسية + 50MP تقريب 5x + 10MP تقريب 3x', val_en: '200MP Main + 50MP 5x + 10MP 3x Telephoto' }
    ],
    warranty_ar: 'كفالة سنة شاملة الهاردوير والسوفتوير في مركز صيانة الليث',
    warranty_en: '1-Year Full Warranty at Al-Laith Maintenance Center',
    created_at: '2026-02-05T12:00:00Z'
  },
  {
    id: 'prod-macbook-pro-m3-max-special',
    title_ar: 'آبل ماك بوك برو 16 بوصة M3 Max (السعر عند الطلب)',
    title_en: 'Apple MacBook Pro 16-inch M3 Max (Price on Request)',
    slug: 'apple-macbook-pro-16-m3-max',
    description_ar: 'الوحش الحسابي الأقوى من آبل لمونتاج 8K والبرمجة ثلاثية الأبعاد. 64GB رام موحدة، 2TB SSD، شاشة Liquid Retina XDR. متوفر بالطلب المباشر وتحديث السعر اليومي.',
    description_en: 'Apple flagship workstation with M3 Max 16-core CPU, 40-core GPU, 64GB unified memory, and 2TB SSD. Available for custom order with real-time quote.',
    pricing_type: 'inquire',
    price: 0,
    condition: 'new',
    device_type: 'laptop',
    category_id: 'cat-laptops-tablets',
    brand: 'Apple',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&h=800&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&h=800&q=80'
    ],
    variants: [
      {
        name_ar: 'اللون',
        name_en: 'Color',
        options: ['Space Black', 'Silver']
      }
    ],
    stock_quantity: 2,
    is_featured: true,
    is_new: true,
    rating: 5.0,
    reviews_count: 14,
    sku: 'APL-MBP16-M3MAX',
    specs: [
      { key_ar: 'المعالج الخارق', key_en: 'Chip', val_ar: 'M3 Max 16-core CPU / 40-core GPU', val_en: 'M3 Max 16-core / 40-core GPU' },
      { key_ar: 'الذاكرة والمساحة', key_en: 'Memory', val_ar: '64GB RAM + 2TB PCIe SSD', val_en: '64GB RAM + 2TB SSD' }
    ],
    warranty_ar: 'كفالة دولية ومحلية سنة كاملة من متجر ومخبر الليث',
    warranty_en: '1-Year International & Local Warranty from Al-Laith',
    created_at: '2026-02-18T09:00:00Z'
  },
  {
    id: 'prod-xiaomi-redmi-note13pro',
    title_ar: 'شاومي ريدمي نوت 13 برو بلس 5G (نسخة الشرق الأوسط)',
    title_en: 'Xiaomi Redmi Note 13 Pro+ 5G (200MP / 120W)',
    slug: 'xiaomi-redmi-note-13-pro-plus',
    description_ar: 'أفضل قيمة مقابل السعر مع كاميرا خارقة بدقة 200 ميجابكسل، شحن فائق السرعة HyperCharge بقدرة 120 واط، ومقاومة الماء والغبار بمعيار IP68.',
    description_en: 'Top value mid-ranger with 200MP camera with OIS, blazing fast 120W HyperCharge, curved 1.5K 120Hz AMOLED display, and IP68 water resistance.',
    price: 4800000, // ~320 USD in SYP
    compare_at_price: 5200000,
    cost_price: 4300000,
    category_id: 'cat-smartphones',
    brand: 'Xiaomi',
    images: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&h=800&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&h=800&q=80'
    ],
    variants: [
      {
        name_ar: 'اللون',
        name_en: 'Color',
        options: ['Midnight Black', 'Aurora Purple', 'Moonlight White']
      }
    ],
    stock_quantity: 20,
    is_featured: true,
    is_deal_of_the_day: true,
    rating: 4.7,
    reviews_count: 110,
    sku: 'XIA-RN13P-512',
    specs: [
      { key_ar: 'الكاميرا', key_en: 'Camera', val_ar: '200 ميجابكسل مع تثبيت بصري OIS', val_en: '200MP with OIS' },
      { key_ar: 'سرعة الشحن', key_en: 'Charging', val_ar: '120W HyperCharge (100% في 19 دقيقة)', val_en: '120W HyperCharge (100% in 19 mins)' },
      { key_ar: 'الذاكرة', key_en: 'Memory', val_ar: '512GB مساحة + 12GB رام', val_en: '512GB ROM + 12GB RAM' }
    ],
    warranty_ar: 'كفالة رسمية سنة كاملة من الليث للاتصالات',
    warranty_en: '1-Year Official Warranty from Al-Laith',
    created_at: '2026-02-10T14:00:00Z'
  },
  {
    id: 'prod-macbook-pro-m3',
    title_ar: 'آبل ماك بوك برو 14 بوصة مع شريحة M3 Pro',
    title_en: 'Apple MacBook Pro 14-inch (M3 Pro Chip)',
    slug: 'apple-macbook-pro-14-m3',
    description_ar: 'أداء احترافي للمصممين والمبرمجين مع شاشة Liquid Retina XDR الخلابة، وعمر بطارية مذهل يصل إلى 22 ساعة، ومنافذ متكاملة تشمل HDMI و MagSafe و SDXC.',
    description_en: 'Pro-grade laptop with M3 Pro chip, stunning Liquid Retina XDR display, up to 22 hours battery life, and complete ports ecosystem.',
    price: 28500000, // ~1,900 USD in SYP
    compare_at_price: 30000000,
    cost_price: 26500000,
    category_id: 'cat-laptops-tablets',
    brand: 'Apple',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&h=800&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&h=800&q=80'
    ],
    variants: [
      {
        name_ar: 'اللون',
        name_en: 'Color',
        options: ['Space Black', 'Silver']
      }
    ],
    stock_quantity: 5,
    is_featured: true,
    rating: 4.9,
    reviews_count: 42,
    sku: 'APL-MBP14-M3P',
    specs: [
      { key_ar: 'المعالج', key_en: 'Processor', val_ar: 'Apple M3 Pro 11-core CPU / 14-core GPU', val_en: 'Apple M3 Pro 11-core CPU / 14-core GPU' },
      { key_ar: 'الذاكرة', key_en: 'RAM / SSD', val_ar: '18GB رام موحدة + 512GB SSD فائق السرعة', val_en: '18GB Unified RAM + 512GB NVMe SSD' },
      { key_ar: 'الشاشة', key_en: 'Screen', val_ar: '14.2 بوصة Liquid Retina XDR 120Hz ProMotion', val_en: '14.2" Liquid Retina XDR 120Hz ProMotion' }
    ],
    warranty_ar: 'كفالة صيانة سنة كاملة مع دعم تثبيت البرامج الأساسية',
    warranty_en: '1-Year Hardware Warranty with OS Setup Support',
    created_at: '2026-01-20T08:00:00Z'
  },
  {
    id: 'prod-ipad-air-m2',
    title_ar: 'آبل آيباد إير 11 بوصة بشريحة M2 الجديدة',
    title_en: 'Apple iPad Air 11-inch (M2 Chip)',
    slug: 'apple-ipad-air-11-m2',
    description_ar: 'جهاز لوحي فائق النحافة والقوة يدعم قلم Apple Pencil Pro ولوحة مفاتيح Magic Keyboard، شاشة Liquid Retina مريحة للعين، وسماعات ستيريو محيطية.',
    description_en: 'Redesigned iPad Air with M2 chip, Apple Pencil Pro support, landscape front camera, and all-day battery life.',
    price: 9750000, // ~650 USD in SYP
    compare_at_price: 10500000,
    cost_price: 9000000,
    category_id: 'cat-laptops-tablets',
    brand: 'Apple',
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&h=800&q=80',
      'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=800&h=800&q=80'
    ],
    variants: [
      {
        name_ar: 'اللون',
        name_en: 'Color',
        options: ['Space Gray', 'Starlight', 'Blue', 'Purple']
      },
      {
        name_ar: 'السعة',
        name_en: 'Storage',
        options: ['128GB', '256GB']
      }
    ],
    stock_quantity: 11,
    is_featured: false,
    rating: 4.8,
    reviews_count: 53,
    sku: 'APL-IPADAIR-M2-128',
    specs: [
      { key_ar: 'المعالج', key_en: 'Processor', val_ar: 'Apple M2 ثماني النواة', val_en: 'Apple M2 Octa-core' },
      { key_ar: 'الشاشة', key_en: 'Display', val_ar: '11 بوصة Liquid Retina بدقة 2360x1640', val_en: '11-inch Liquid Retina 2360x1640' }
    ],
    warranty_ar: 'كفالة الليث لمدة سنة مع فحص واستبدال فوري عند العيوب المصنعية',
    warranty_en: '1-Year Warranty with immediate exchange for factory defects',
    created_at: '2026-02-08T11:00:00Z'
  },
  {
    id: 'prod-airpods-pro-2',
    title_ar: 'سماعات آبل إيربودز برو الجيل الثاني بمنفذ Type-C',
    title_en: 'Apple AirPods Pro 2 (USB-C MagSafe Case)',
    slug: 'apple-airpods-pro-2-usbc',
    description_ar: 'أفضل عزل ضوضاء نشط في فئتها مع وضع الصوت الشفاف المتكيف، ميزة تتبع الرأس ثلاثية الأبعاد، ومقاومة الغبار والماء بمعيار IP54.',
    description_en: 'Up to 2x more Active Noise Cancellation, Adaptive Audio, Spatial Audio, and USB-C charging case with Find My speaker.',
    price: 3450000, // ~230 USD in SYP
    compare_at_price: 3750000,
    cost_price: 3100000,
    category_id: 'cat-audio-accessories',
    brand: 'Apple',
    images: [
      'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&h=800&q=80',
      'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=800&h=800&q=80'
    ],
    variants: [
      {
        name_ar: 'النوع',
        name_en: 'Edition',
        options: ['USB-C MagSafe Edition']
      }
    ],
    stock_quantity: 25,
    is_featured: true,
    is_deal_of_the_day: true,
    rating: 4.9,
    reviews_count: 140,
    sku: 'APL-APP2-USBC',
    specs: [
      { key_ar: 'الشريحة', key_en: 'Chip', val_ar: 'شريحة Apple H2 المخصصة للصوت النقي', val_en: 'Apple H2 Audio Chip' },
      { key_ar: 'البطارية', key_en: 'Battery', val_ar: 'تصل حتى 30 ساعة مع علبة الشحن', val_en: 'Up to 30 hrs with charging case' }
    ],
    warranty_ar: 'كفالة الليث الأصلية 100% مع ضمان سيريال معتمد',
    warranty_en: '100% Genuine with Official Serial Check',
    created_at: '2026-02-12T09:00:00Z'
  },
  {
    id: 'prod-anker-prime-powerbank',
    title_ar: 'بنك طاقة أنكر برايم بقوة 200W وسعة 20,000mAh',
    title_en: 'Anker Prime 20,000mAh Power Bank (200W Output)',
    slug: 'anker-prime-200w-power-bank',
    description_ar: 'بنك طاقة متطور مزود بشاشة رقمية ذكية تعرض طاقة الشحن لحظياً، قادر على شحن لابتوبين وهاتف في نفس الوقت بأمان فائق.',
    description_en: 'Ultra-compact power bank equipped with smart digital display, 200W total output capable of fast charging two laptops simultaneously.',
    price: 1350000, // ~90 USD in SYP
    compare_at_price: 1550000,
    cost_price: 1150000,
    category_id: 'cat-audio-accessories',
    brand: 'Anker',
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&h=800&q=80',
      'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&h=800&q=80'
    ],
    variants: [
      {
        name_ar: 'اللون',
        name_en: 'Color',
        options: ['Dark Gray Metallic']
      }
    ],
    stock_quantity: 18,
    is_featured: false,
    rating: 4.8,
    reviews_count: 38,
    sku: 'ANK-PRIME-20K',
    specs: [
      { key_ar: 'السعة', key_en: 'Capacity', val_ar: '20,000 مللي أمبير عالية الكثافة', val_en: '20,000mAh High-Density' },
      { key_ar: 'أقصى طاقة خرج', key_en: 'Max Output', val_ar: '200 واط موزعة عبر منفذي Type-C ومنفذ USB-A', val_en: '200W via 2x USB-C + 1x USB-A' }
    ],
    warranty_ar: 'كفالة استبدال 18 شهراً ضد أي عطل مصنعي',
    warranty_en: '18-Month Replacement Warranty against factory defects',
    created_at: '2026-02-14T10:00:00Z'
  },
  {
    id: 'prod-dyson-v15-detect',
    title_ar: 'مكنسة دايسون V15 ديتكت اللاسلكية الذكية مع ليزر كشف الأتربة',
    title_en: 'Dyson V15 Detect Cordless Vacuum (Laser Fluffy)',
    slug: 'dyson-v15-detect-vacuum',
    description_ar: 'أقوى مكنسة لاسلكية ذكية تكشف الأتربة غير المرئية بالليزر الأخضر، وتعدل قوة الشفط تلقائياً حسب نوع الأرضية، مع شاشة LCD تفاعلية.',
    description_en: 'Smart cordless vacuum with green laser illumination for microscopic dust, auto suction adjustment, and real-time LCD dust report.',
    price: 11250000, // ~750 USD in SYP
    compare_at_price: 12200000,
    cost_price: 10200000,
    category_id: 'cat-appliances',
    brand: 'Dyson',
    images: [
      'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&h=800&q=80',
      'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&h=800&q=80'
    ],
    variants: [
      {
        name_ar: 'الإصدار',
        name_en: 'Edition',
        options: ['V15 Detect Absolute (Nickel/Yellow)']
      }
    ],
    stock_quantity: 6,
    is_featured: true,
    rating: 4.9,
    reviews_count: 51,
    sku: 'DYS-V15-ABS',
    specs: [
      { key_ar: 'قوة الشفط', key_en: 'Suction Power', val_ar: '240 Air Watts بمحرك Hyperdymium', val_en: '240 Air Watts with Hyperdymium motor' },
      { key_ar: 'مدة العمل', key_en: 'Run Time', val_ar: 'حتى 60 دقيقة من التنظيف المتواصل', val_en: 'Up to 60 minutes continuous runtime' }
    ],
    warranty_ar: 'كفالة سنتين مع توفر قطع الغيار والصيانة الفورية بمركز الليث',
    warranty_en: '2-Year Warranty with certified spares at Al-Laith Lab',
    created_at: '2026-02-15T15:00:00Z'
  },
  {
    id: 'prod-philips-airfryer-xxl',
    title_ar: 'قلاية فيليبس الذكية بدون زيت XXL بتقنية إزالة الدهون',
    title_en: 'Philips Premium Smart Airfryer XXL (Fat Removal)',
    slug: 'philips-premium-airfryer-xxl',
    description_ar: 'سعة عائلية 1.4 كغ تتيح طهي وجبات مقرمشة وصحية بنسبة دهون أقل 90%، مع تقنية Smart Sensing للضبط التلقائي لدرجة الحرارة والوقت.',
    description_en: 'Family XXL capacity with Smart Sensing technology that automatically adjusts time and temperature for healthy crispy meals.',
    price: 2250000, // ~150 USD in SYP
    compare_at_price: 2600000,
    cost_price: 1950000,
    category_id: 'cat-appliances',
    brand: 'Philips',
    images: [
      'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&h=800&q=80',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&h=800&q=80'
    ],
    variants: [
      {
        name_ar: 'اللون',
        name_en: 'Color',
        options: ['Black / Rose Gold Accent']
      }
    ],
    stock_quantity: 14,
    is_featured: true,
    is_deal_of_the_day: true,
    rating: 4.8,
    reviews_count: 73,
    sku: 'PHI-AF-XXL9650',
    specs: [
      { key_ar: 'السعة', key_en: 'Capacity', val_ar: '1.4 كغ / 7.3 لتر (وجبة عائلية متكاملة)', val_en: '1.4 kg / 7.3 L' },
      { key_ar: 'القدرة الكهربائية', key_en: 'Power', val_ar: '2225 واط مع تسخين فوري سريع', val_en: '2225W Rapid Combi' }
    ],
    warranty_ar: 'كفالة الوكيل سنتين مع توفير ملحقات السلة الأصلية',
    warranty_en: '2-Year Warranty with genuine basket accessories',
    created_at: '2026-02-16T12:00:00Z'
  },
  {
    id: 'prod-delonghi-dedica',
    title_ar: 'ماكينة تحضير قهوة الإسبريسو ديلونجي ديديكا الأصلية',
    title_en: 'DeLonghi Dedica Deluxe Espresso & Cappuccino Machine',
    slug: 'delonghi-dedica-espresso-deluxe',
    description_ar: 'تصميم إيطالي رفيع بعرض 15 سم فقط، ضغط مضخة 15 بار احترافي، عصا تبخير حليب قابلة للتعديل للحصول على رغوة كابتشينو غنية وكريمية.',
    description_en: 'Slim 15cm Italian design, professional 15-bar pump, and adjustable milk frother for rich cappuccino microfoam.',
    price: 3750000, // ~250 USD in SYP
    compare_at_price: 4100000,
    cost_price: 3300000,
    category_id: 'cat-appliances',
    brand: 'DeLonghi',
    images: [
      'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&h=800&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&h=800&q=80'
    ],
    variants: [
      {
        name_ar: 'اللون',
        name_en: 'Color',
        options: ['Stainless Steel Silver', 'Matte Black', 'Classic Red']
      }
    ],
    stock_quantity: 10,
    is_featured: false,
    rating: 4.8,
    reviews_count: 67,
    sku: 'DL-DED-EC685',
    specs: [
      { key_ar: 'ضغط المضخة', key_en: 'Pump Pressure', val_ar: '15 بار بنظام تسخين Thermoblock سريع', val_en: '15 Bar Thermoblock heating system' },
      { key_ar: 'خزان المياه', key_en: 'Water Tank', val_ar: '1.1 لتر قابل للفك والتعبئة السهلة', val_en: '1.1L removable water reservoir' }
    ],
    warranty_ar: 'كفالة سنتين مع صيانة دورية وتنظيف كلس في مركز الليث',
    warranty_en: '2-Year Warranty with periodic descaling maintenance at Al-Laith Lab',
    created_at: '2026-02-18T10:00:00Z'
  },
  {
    id: 'prod-samsung-s23-ultra-used',
    title_ar: 'سامسونج جالكسي S23 ألترا 256GB (مستعمل ومفحوص 97%)',
    title_en: 'Samsung Galaxy S23 Ultra 256GB (Used - Like New 97%)',
    slug: 'samsung-galaxy-s23-ultra-used',
    description_ar: 'جهاز مستعمل بحالة استثنائية 97%، كاميرا 200 ميجابكسل، بطارية أصلية 94%، قلم S Pen مدمج، مع شاحن سريع 45W وعلبة أصلية.',
    description_en: 'Pre-owned in mint condition. 94% original battery, 200MP camera, S Pen, includes 45W fast charger and original box.',
    pricing_type: 'usd',
    price_usd: 590,
    compare_at_price_usd: 650,
    price: 8850000,
    compare_at_price: 9750000,
    cost_price: 7900000,
    condition: 'used',
    condition_details: 'نظافة 97% • نسبة بطارية 94% • شاحن 45W أصلي هدية',
    device_type: 'smartphone',
    category_id: 'cat-smartphones',
    brand: 'Samsung',
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&h=800&q=80',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&h=800&q=80'
    ],
    variants: [
      {
        name_ar: 'اللون',
        name_en: 'Color',
        options: ['Phantom Black', 'Green', 'Cream']
      }
    ],
    stock_quantity: 4,
    is_featured: true,
    is_new: false,
    rating: 4.8,
    reviews_count: 45,
    tags: ['lab_certified', 'limited_stock'],
    sku: 'SAM-S23U-USED',
    specs: [
      { key_ar: 'الحالة', key_en: 'Condition', val_ar: 'مستعمل ممتاز فحص مخبري 97%', val_en: 'Grade A+ 97%' },
      { key_ar: 'صحة البطارية', key_en: 'Battery Health', val_ar: '94% أصلية 5000mAh', val_en: '94% Original 5000mAh' },
      { key_ar: 'الذاكرة', key_en: 'RAM / ROM', val_ar: '256GB + 12GB RAM', val_en: '256GB + 12GB RAM' }
    ],
    warranty_ar: 'كفالة فحص واستبدال لمدة شهر من مخبر صيانة الليث',
    warranty_en: '1-Month Testing Warranty from Al-Laith Lab',
    created_at: '2026-02-17T11:00:00Z'
  },
  {
    id: 'prod-ipad-pro-11-used',
    title_ar: 'آبل آيباد برو 11 بوصة M1 (مستعمل فحص مخبري 98%)',
    title_en: 'Apple iPad Pro 11-inch M1 (Used - Lab Certified 98%)',
    slug: 'apple-ipad-pro-11-m1-used',
    description_ar: 'تابلت آبل الاحترافي بشريحة M1 الخارقة، شاشة ProMotion 120Hz، صوت رباعي محيطي، حالة ممتازة خالية من الخدوش وصحة بطارية 95%.',
    description_en: 'Pro tablet with M1 processor, 120Hz ProMotion screen, quad speakers, 95% battery health, completely scratch-free.',
    pricing_type: 'usd',
    price_usd: 520,
    compare_at_price_usd: 580,
    price: 7800000,
    compare_at_price: 8700000,
    cost_price: 7000000,
    condition: 'used',
    condition_details: 'نظافة 98% • بطارية 95% • شاشة 120Hz نقية تماماً',
    device_type: 'tablet',
    category_id: 'cat-laptops-tablets',
    brand: 'Apple',
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&h=800&q=80',
      'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=800&h=800&q=80'
    ],
    variants: [
      {
        name_ar: 'اللون',
        name_en: 'Color',
        options: ['Space Gray', 'Silver']
      }
    ],
    stock_quantity: 2,
    is_featured: false,
    is_new: false,
    rating: 4.9,
    reviews_count: 18,
    tags: ['lab_certified', 'limited_stock'],
    sku: 'APL-IPADPRO11-USED',
    specs: [
      { key_ar: 'المعالج', key_en: 'Processor', val_ar: 'Apple M1 ثماني النواة', val_en: 'Apple M1 8-Core' },
      { key_ar: 'البطارية', key_en: 'Battery', val_ar: '95% أصلية وكالة', val_en: '95% Original' }
    ],
    warranty_ar: 'كفالة تجربة شهر كامل مع فحص مجاني لأي ملحق',
    warranty_en: '1-Month Testing Warranty with accessory check',
    created_at: '2026-02-16T14:00:00Z'
  },
  {
    id: 'prod-apple-watch-ultra-used',
    title_ar: 'ساعة آبل ووتش ألترا 49mm تيتانيوم (مستعملة نظافة 99%)',
    title_en: 'Apple Watch Ultra 49mm Titanium (Used - 99% Mint)',
    slug: 'apple-watch-ultra-49mm-used',
    description_ar: 'ساعة المغامرات والرياضات الاحترافية من التيتانيوم المقاوم، شاشة مسطحة كريستال ياقوتي، بطارية تدوم حتى 36 ساعة، صحة بطارية 98%.',
    description_en: 'Rugged titanium adventure smartwatch with flat sapphire crystal, dual-frequency GPS, and 98% battery health with original trail loop.',
    pricing_type: 'usd',
    price_usd: 480,
    compare_at_price_usd: 540,
    price: 7200000,
    compare_at_price: 8100000,
    cost_price: 6400000,
    condition: 'used',
    condition_details: 'نظافة 99% • صحة بطارية 98% • سوار أصلي وكابل مغناطيسي سريع',
    device_type: 'smartwatch',
    category_id: 'cat-audio-accessories',
    brand: 'Apple',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&h=800&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&h=800&q=80'
    ],
    variants: [
      {
        name_ar: 'السوار',
        name_en: 'Band',
        options: ['Orange Alpine Loop', 'Midnight Ocean Band', 'Trail Loop']
      }
    ],
    stock_quantity: 3,
    is_featured: true,
    is_new: false,
    rating: 4.9,
    reviews_count: 22,
    tags: ['deal_of_the_day', 'lab_certified'],
    sku: 'APL-WATCH-ULTRA-USED',
    specs: [
      { key_ar: 'الهيكل', key_en: 'Case', val_ar: 'تيتانيوم مصمت بحجم 49 مم مقاوم للماء 100م', val_en: '49mm Titanium 100m Water Resistant' },
      { key_ar: 'صحة البطارية', key_en: 'Battery Health', val_ar: '98% وكالة', val_en: '98% Original' }
    ],
    warranty_ar: 'كفالة تجربة وفحص لمدة شهر كامل من مخبر الليث',
    warranty_en: '1-Month Testing Warranty from Al-Laith Lab',
    created_at: '2026-02-18T16:00:00Z'
  }
];

export const initialHeroSlides: HeroSlide[] = [
  {
    id: 'slide-1',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1600&h=750&q=85',
    tag_ar: 'جديد صالة العرض في دمشق',
    tag_en: 'New Damascus Flagship Arrival',
    title_ar: 'عالم الهواتف الذكية والأجهزة المتطورة',
    title_en: 'Smartphones & Next-Gen Electronics',
    subtitle_ar: 'أقوى الأجهزة مع كفالة الليث المعتمدة، إمكانية الدفع بالليرة السورية أو بالدولار، وتوصيل سريع لكافة المحافظات السورية.',
    subtitle_en: 'Top flagships backed by Al-Laith authorized warranty, dual currency support in SYP and USD, with express delivery across Syria.',
    button_text_ar: 'تصفح أحدث الأجهزة',
    button_text_en: 'Explore Collection',
    button_link: 'catalog'
  },
  {
    id: 'slide-2',
    image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=1600&h=750&q=85',
    tag_ar: 'مركز الصيانة المعتمد',
    tag_en: 'Certified Technical Lab',
    title_ar: 'صيانة فورية وقطع غيار أصلية 100%',
    title_en: 'Certified Repairs & 100% Genuine Spares',
    subtitle_ar: 'مهندسون وفنيون مختصون بصيانة الهواتف، اللوحيات، والأجهزة المنزلية الذكية. احجز موعدك بسهولة عبر وتساب.',
    subtitle_en: 'Professional certified diagnostics and repair for smartphones and smart home appliances with quick turnaround.',
    button_text_ar: 'طلب صيانة جهاز',
    button_text_en: 'Book Repair',
    button_link: 'maintenance'
  }
];

// Note: No countdown timers on promotional offers as explicitly requested!
export const initialPromotionalOffers: PromotionalOffer[] = [
  {
    id: 'offer-1',
    title_ar: 'آبل آيفون 16 برو ماكس',
    title_en: 'Apple iPhone 16 Pro Max',
    subtitle_ar: 'وفر أكثر من 1,000,000 ل.س مع كفالة الليث المعتمدة لمدة سنة كاملة وهدايا إضافية تشمل حماية الشاشة والشاحن الأصلي.',
    subtitle_en: 'Save over 1,000,000 SYP with Al-Laith 1-year warranty and bundled screen protector & genuine charger.',
    badge_ar: 'صفقة الأسبوع الكبرى',
    badge_en: 'Mega Weekly Deal',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&h=800&q=80',
    discount_percent: 6,
    link: 'prod-iphone-16-pro-max'
  },
  {
    id: 'offer-2',
    title_ar: 'شاومي نوت 13 برو بلس 5G',
    title_en: 'Xiaomi Note 13 Pro+ 5G',
    subtitle_ar: 'كاميرا 200 ميجابكسل خارقة مع شاحن 120W السريع وغلاف حماية فاخر بسعر لا ينافس بالليرة السورية.',
    subtitle_en: 'Flagship 200MP camera with blazing 120W fast charger and premium case at unbeatable Syrian market price.',
    badge_ar: 'أفضل قيمة مقابل السعر',
    badge_en: 'Best Value Pick',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&h=800&q=80',
    discount_percent: 8,
    link: 'prod-xiaomi-redmi-note13pro'
  },
  {
    id: 'offer-3',
    title_ar: 'سماعات إيربودز برو 2 (Type-C)',
    title_en: 'AirPods Pro 2 (Type-C MagSafe)',
    subtitle_ar: 'عزل ضوضاء فائق وصوت ثلاثي الأبعاد مكفول 100% مع جراب سيليكون أصلي مجاني.',
    subtitle_en: 'True active noise cancellation and spatial audio with free silicone shockproof case.',
    badge_ar: 'عرض الإكسسوارات',
    badge_en: 'Audio Special',
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&h=800&q=80',
    discount_percent: 9,
    link: 'prod-airpods-pro-2'
  }
];

export const initialStoreSettings: StoreSettings = {
  site_name_ar: 'الليث للاتصالات',
  site_name_en: 'Al-Laith for Telecommunications',
  logo_url: '/al-laith-logo-horizontal.svg',
  whatsapp_number: '+963936097667',
  maintenance_whatsapp: '+963936097667',
  whatsapp_preset_greeting_ar: 'مرحباً، أود تأكيد هذا الطلب من متجر الليث للاتصالات:',
  whatsapp_preset_greeting_en: 'Hello, I would like to confirm my order from Al-Laith for Telecommunications:',
  delivery_fee_base: 25000, // 25,000 SYP local shipping
  free_delivery_threshold: 1500000, // Free over 1,500,000 SYP
  currency_ar: 'ل.س',
  currency_en: 'SYP',
  usd_exchange_rate: 15000, // 1 USD = 15,000 SYP
  store_address_ar: 'اللاذقية قرية الشير طريق الحفة بجانب الاشارة الصفراء',
  store_address_en: 'Al-Shir, Al-Haffah Road, Next to the Yellow Traffic Light, Latakia, Syria',
  store_phone: '+963 936 097 667',
  store_email: 'info@allaith-telecom.sy',
  store_hours_ar: 'السبت - الخميس: 9:30 صباحاً - 9:30 مساءً | الجمعة: 4:00 عصراً - 9:30 مساءً',
  store_hours_en: 'Sat - Thu: 9:30 AM - 9:30 PM | Fri: 4:00 PM - 9:30 PM',
  store_lat: 35.524917,
  store_lng: 35.852556,
  google_maps_url: 'https://www.google.com/maps?q=35.524917,35.852556',
  announcement_ar: '⚡ أهلاً بكم في متجر الليث للاتصالات - اللاذقية | كفالة معتمدة وتوصيل لكافة المحافظات السورية | أسعارنا بالليرة السورية والدولار',
  announcement_en: '⚡ Welcome to Al-Laith for Telecommunications - Latakia | Official Warranty & Syrian Nationwide Delivery | Prices in SYP & USD',
  announcement_enabled: true,
  google_sheets_webhook_url: 'https://script.google.com/macros/s/AKfycbx_DEMO_ALLAITH_SHEETS_WEBHOOK/exec',
  google_sheet_id: '1aBcDeFgHiJkLmNoPqRsTuVwXyZ_ALLAITH_ORDERS',
  google_sheets_sync_enabled: true
};

export const initialOrders: Order[] = [
  {
    id: 'ord-101',
    order_number: 'LTH-9201',
    customer_name: 'طارق الأحمد',
    customer_phone: '+963944112233',
    governorate: 'دمشق',
    delivery_address: 'المزة - أوتوستراد، جانب برج تالا، بناء الأمل طابق 3',
    notes: 'التسليم مساءً والدفع عند الاستلام بالليرة السورية',
    items: [
      {
        product_id: 'prod-iphone-16-pro-max',
        title: 'آبل آيفون 16 برو ماكس (تيتانيوم صحراوي)',
        quantity: 1,
        price: 18750000,
        variant_info: '256GB / Desert Titanium',
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&h=800&q=80'
      }
    ],
    subtotal: 18750000,
    delivery_fee: 0,
    total: 18750000,
    currency: 'SYP',
    status: 'confirmed',
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    google_sheets_synced: true,
    synced_to_sheets: true,
    sheets_sync_timestamp: new Date(Date.now() - 24 * 3600 * 1000 + 4000).toISOString(),
    whatsapp_sent: true
  },
  {
    id: 'ord-102',
    order_number: 'LTH-9202',
    customer_name: 'مايا الحلبي',
    customer_phone: '+963955667788',
    governorate: 'حلب',
    delivery_address: 'حلب - حي الفرقان، شارع الصفا، مقابل كلية الاقتصاد',
    notes: 'يرجى التأكد من وجود فاتورة كفالة الليث المختومة',
    items: [
      {
        product_id: 'prod-xiaomi-redmi-note13pro',
        title: 'شاومي ريدمي نوت 13 برو بلس 5G',
        quantity: 1,
        price: 4800000,
        variant_info: 'Midnight Black',
        image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&h=800&q=80'
      },
      {
        product_id: 'prod-airpods-pro-2',
        title: 'سماعات آبل إيربودز برو الجيل الثاني',
        quantity: 1,
        price: 3450000,
        variant_info: 'Type-C Edition',
        image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&h=800&q=80'
      }
    ],
    subtotal: 8250000,
    delivery_fee: 0,
    total: 8250000,
    currency: 'SYP',
    status: 'shipped',
    created_at: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
    google_sheets_synced: true,
    synced_to_sheets: true,
    sheets_sync_timestamp: new Date(Date.now() - 10 * 3600 * 1000 + 3500).toISOString(),
    whatsapp_sent: true
  }
];

export const initialMaintenanceRequests: MaintenanceRequest[] = [
  {
    id: 'maint-1',
    request_number: 'MNT-701',
    customer_name: 'وسيم القادري',
    phone: '+963933887766',
    device_type: 'smartphone',
    device_model: 'iPhone 15 Pro Max',
    issue_description: 'كسر في الشاشة الخارجية وتوقف استجابة اللمس في النصف السفلي بعد السقوط.',
    preferred_date: '2026-09-18',
    status: 'in_progress',
    created_at: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    notes_admin: 'تم استلام الهاتف وتركيب شاشة أصلية وجاري فحص ميزة True Tone'
  },
  {
    id: 'maint-2',
    request_number: 'MNT-702',
    customer_name: 'لانا الخوري',
    phone: '+963966554433',
    device_type: 'home_appliance',
    device_model: 'Dyson V11 Absolute',
    issue_description: 'المكنسة تتوقف فجأة ويومض مؤشر الفلتر مع بطء في قوة الشفط.',
    preferred_date: '2026-09-19',
    status: 'new',
    created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
  }
];

export const initialPhoneRequests: PhoneRequest[] = [
  {
    id: 'req-1',
    request_number: 'REQ-4012',
    customer_name: 'سامر قاسم',
    phone: '0944887766',
    address: 'دمشق - المالكي، شارع عبد المنعم رياض، بناء الزهور طابق 2',
    device_type: 'Samsung Galaxy S24 Ultra',
    specifications: 'اللون: Titanium Violet، سعة التخزين: 512GB، جديد ومختوم بكرتونته مع شاحن 45W أصلي وكفالة معتمدة.',
    storage: '512GB',
    color: 'Titanium Violet',
    condition: 'new',
    status: 'new',
    created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
  }
];

