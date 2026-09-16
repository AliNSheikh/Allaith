import { Product, Category, HeroSlide, PromotionalOffer, StoreSettings, MaintenanceRequest, Order, PhoneRequest, StaffUser, VisitorStatDay } from '../types';
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
    title_ar: 'سامسونج جالكسي S25 ألترا 5G',
    title_en: 'Samsung Galaxy S25 Ultra 5G',
    subtitle_ar: 'قمة الذكاء الاصطناعي Galaxy AI مع قلم S Pen مدمج وكاميرا 200 ميجابكسل خارقة وكفالة سنة كاملة.',
    subtitle_en: 'Flagship Galaxy AI powerhouse with integrated S Pen, 200MP pro camera, and 1-year warranty.',
    badge_ar: 'أفضل قيمة وأداء',
    badge_en: 'Top Performance',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&h=800&q=80',
    discount_percent: 7,
    link: 'prod-samsung-s25-ultra'
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
  google_sheets_sync_enabled: true,
  site_domain: 'https://allaith.vercel.app',
  google_analytics_id: 'G-L8THSYRIA26',
  google_search_console_tag: 'google-site-verification=allaith_telecom_syria_verified',
  google_ads_id: 'AW-987654321',
  google_adsense_client: 'ca-pub-9988776655443322',
  supabase_url: 'https://gvulciiuobldobtixlyl.supabase.co',
  supabase_anon_key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2dWxjaWl1b2JsZG9idGl4bHlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1NTI4NTYsImV4cCI6MjEwNTEyODg1Nn0.SNeN-JPJH1_qd2yVltll3voPAnXieq0qes7KU3bVFsI',
  supabase_enabled: true
};

export const initialOrders: Order[] = [];

export const initialMaintenanceRequests: MaintenanceRequest[] = [];

export const initialPhoneRequests: PhoneRequest[] = [];

export const initialStaffUsers: StaffUser[] = [
  {
    id: 'staff-1',
    name: 'علي الشيخ (المالك والمدير العام)',
    email: 'alinsheikh1998@gmail.com',
    role: 'super_admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    active: true,
    permissions: {
      canManageProducts: true,
      canManageOrders: true,
      canManageSettings: true,
      canViewAnalytics: true,
      canManageContent: true,
      canManageUsers: true
    },
    created_at: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'staff-2',
    name: 'سامر قاسم (مدير المبيعات والشحن)',
    email: 'sales@allaith-telecom.sy',
    role: 'store_manager',
    active: true,
    permissions: {
      canManageProducts: true,
      canManageOrders: true,
      canManageSettings: false,
      canViewAnalytics: true,
      canManageContent: false,
      canManageUsers: false
    },
    created_at: '2026-02-10T00:00:00.000Z'
  },
  {
    id: 'staff-3',
    name: 'نور الهدى (خدمة الزبائن والطلبيات)',
    email: 'orders@allaith-telecom.sy',
    role: 'order_support',
    active: true,
    permissions: {
      canManageProducts: false,
      canManageOrders: true,
      canManageSettings: false,
      canViewAnalytics: false,
      canManageContent: false,
      canManageUsers: false
    },
    created_at: '2026-03-01T00:00:00.000Z'
  },
  {
    id: 'staff-4',
    name: 'محرر البانرات والعروض',
    email: 'content@allaith-telecom.sy',
    role: 'content_editor',
    active: true,
    permissions: {
      canManageProducts: false,
      canManageOrders: false,
      canManageSettings: false,
      canViewAnalytics: false,
      canManageContent: true,
      canManageUsers: false
    },
    created_at: '2026-03-15T00:00:00.000Z'
  }
];

export const initialVisitorStats: VisitorStatDay[] = [];

