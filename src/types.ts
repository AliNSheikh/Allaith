export type Language = 'ar' | 'en';
export type ActiveCurrency = 'SYP' | 'USD';
export type LiraDisplayMode = 'both' | 'new' | 'old';

export interface SpTodayExchangeData {
  currency: string;
  source: string;
  city: string;
  city_ar: string;
  old_lira: {
    buy: number;
    sell: number;
    formatted_buy: string;
    formatted_sell: string;
    symbol: string;
    symbol_en: string;
  };
  new_lira: {
    buy: number;
    sell: number;
    formatted_buy: string;
    formatted_sell: string;
    symbol: string;
    symbol_en: string;
  };
  change_percent: number;
  updated_at: string;
  fetched_at: string;
  cities?: Record<string, {
    name_ar?: string;
    buy: number;
    sell: number;
    change: number;
    new_buy: number;
    new_sell: number;
  }>;
}

export interface Variant {
  name_ar: string;
  name_en: string;
  options: string[];
  priceModifier?: number;
}

export interface VariantCombination {
  id: string;
  combination_name_ar?: string;
  combination_name_en?: string;
  attributes: Record<string, string>; // e.g. { "Color": "Black", "Storage": "256GB" }
  price?: number;
  price_usd?: number; // e.g. 1000
  price_syp?: number;
  stock_quantity: number;
  sku?: string;
  image?: string;
}

export type ProductVariantCombination = VariantCombination;

export interface ProductSpec {
  key_ar: string;
  key_en: string;
  val_ar: string;
  val_en: string;
}

export type ProductSpecItem = ProductSpec;

export type ProductPricingType = 'syp' | 'usd' | 'inquire';
export type ProductPricingStrategy = 'auto_daily_rate' | 'usd_as_base' | 'fixed_usd' | 'manual_syp';
export type ProductCondition = 'new' | 'used';
export type DeviceType =
  | 'smartphone'
  | 'tablet'
  | 'laptop'
  | 'smartwatch'
  | 'audio'
  | 'chargers_power'
  | 'accessories'
  | 'gaming_console'
  | 'home_appliance'
  | 'other';

export interface Product {
  id: string;
  title_ar: string;
  title_en: string;
  slug: string;
  description_ar: string;
  description_en: string;
  pricing_type?: ProductPricingType;
  pricing_strategy?: ProductPricingStrategy;
  price: number; // Stored in SYP
  price_usd?: number; // Base USD price
  compare_at_price?: number; // In SYP
  compare_at_price_usd?: number; // In USD
  has_discount?: boolean;
  discount_percent?: number; // e.g. 15% off
  condition?: ProductCondition;
  condition_details?: string;
  device_type?: DeviceType | string;
  category_id: string;
  brand: string;
  images: string[];
  variants: Variant[];
  variant_combinations?: VariantCombination[];
  stock_quantity: number;
  is_featured: boolean;
  is_new?: boolean;
  is_deal_of_the_day?: boolean;
  is_archived?: boolean; // Archived = hidden from public interface
  cost_price?: number;
  rating: number;
  reviews_count: number;
  sku: string;
  specs: ProductSpec[];
  warranty_ar?: string;
  warranty_en?: string;
  tags?: string[];
  created_at: string;
}

export interface Category {
  id: string;
  name_ar: string;
  name_en: string;
  slug: string;
  image_url: string;
  sort_order: number;
  icon_name?: string;
  is_archived?: boolean; // Archived = hidden from public interface
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariants: { [variantName: string]: string };
}

export interface OrderItem {
  product_id: string;
  title: string;
  quantity: number;
  price: number; // in SYP
  variant_info?: string;
  image?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  governorate: string;
  delivery_address: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  currency: ActiveCurrency;
  status: 'new' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  google_sheets_synced?: boolean;
  synced_to_sheets?: boolean;
  sheets_sync_timestamp?: string;
  whatsapp_sent?: boolean;
}

export interface MaintenanceRequest {
  id: string;
  request_number: string;
  customer_name: string;
  phone: string;
  device_type: 'smartphone' | 'tablet' | 'home_appliance' | 'laptop' | 'other';
  device_model: string;
  issue_description: string;
  photo_url?: string;
  preferred_date: string;
  status: 'new' | 'in_progress' | 'resolved' | 'cancelled';
  created_at: string;
  notes_admin?: string;
}

export interface PhoneRequest {
  id: string;
  request_number: string;
  customer_name: string;
  phone: string;
  address: string;
  device_type: string;
  specifications: string;
  storage?: string;
  color?: string;
  condition?: string;
  status: 'new' | 'contacted' | 'fulfilled' | 'cancelled';
  created_at: string;
}

export interface HeroSlide {
  id: string;
  image: string;
  tag_ar: string;
  tag_en: string;
  title_ar: string;
  title_en: string;
  subtitle_ar: string;
  subtitle_en: string;
  button_text_ar: string;
  button_text_en: string;
  button_link: string;
}

export interface PromotionalOffer {
  id: string;
  title_ar: string;
  title_en: string;
  subtitle_ar: string;
  subtitle_en: string;
  badge_ar: string;
  badge_en: string;
  image: string;
  discount_percent: number;
  link: string;
}

export interface FooterQuickLink {
  id: string;
  title_ar: string;
  title_en: string;
  url: string;
  enabled: boolean;
}

export interface AnalyticsVisitRecord {
  id: string;
  timestamp: string; // ISO date string
  path: string;
  page_title: string;
  referrer: string;
  device: 'mobile' | 'desktop' | 'tablet';
  visitor_id: string;
  duration_seconds?: number;
}

export interface StoreSettings {
  site_name_ar: string;
  site_name_en: string;
  logo_url: string;
  custom_logo_url?: string;
  footer_logo_url?: string;
  whatsapp_number: string;
  maintenance_whatsapp: string;
  whatsapp_preset_greeting_ar: string;
  whatsapp_preset_greeting_en: string;
  delivery_fee_base: number; // in SYP
  free_delivery_threshold: number; // in SYP
  currency_ar: string; // "ل.س"
  currency_en: string; // "SYP"
  usd_exchange_rate: number; // e.g. 15000 SYP per 1 USD
  store_address_ar: string;
  store_address_en: string;
  store_phone: string;
  store_email: string;
  store_hours_ar: string;
  store_hours_en: string;
  store_lat: number;
  store_lng: number;
  google_maps_url?: string;
  announcement_ar: string;
  announcement_en: string;
  announcement_enabled: boolean;
  google_sheets_webhook_url: string;
  google_sheet_id: string;
  google_sheets_sync_enabled: boolean;
  // Google Services Suite & SEO
  site_domain?: string;
  google_analytics_id?: string;
  google_search_console_tag?: string;
  google_ads_id?: string;
  google_adsense_client?: string;
  // Supabase Database Integration
  supabase_url?: string;
  supabase_anon_key?: string;
  supabase_enabled?: boolean;
  // Footer Quick Links
  footer_quick_links?: FooterQuickLink[];
  // Main Administrator Credentials (Protected URL Access)
  admin_username?: string;
  admin_password?: string;
}

export type StaffRole = 'super_admin' | 'store_manager' | 'order_support' | 'content_editor';

export interface StaffPermissions {
  canManageProducts: boolean;
  canManageOrders: boolean;
  canManageSettings: boolean;
  canViewAnalytics: boolean;
  canManageContent: boolean;
  canManageUsers: boolean;
}

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  avatar?: string;
  active: boolean;
  permissions: StaffPermissions;
  created_at: string;
}

export interface VisitorStatDay {
  date: string;
  label: string;
  visitors: number;
  pageViews: number;
  orders: number;
  revenue_syp: number;
  revenue_usd: number;
}
