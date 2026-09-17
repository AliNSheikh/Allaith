import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Category, Order, MaintenanceRequest, StoreSettings, AnalyticsVisitRecord, HeroSlide, PhoneRequest } from '../types';

export const DEFAULT_SUPABASE_URL = 'https://gvulciiuobldobtixlyl.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2dWxjaWl1b2JsZG9idGl4bHlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1NTI4NTYsImV4cCI6MjEwNTEyODg1Nn0.SNeN-JPJH1_qd2yVltll3voPAnXieq0qes7KU3bVFsI';

let cachedClient: SupabaseClient | null = null;
let currentUrl: string | null = null;
let currentKey: string | null = null;

export function getSupabaseClient(url?: string, anonKey?: string): SupabaseClient | null {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  const targetUrl = url || envUrl || (typeof window !== 'undefined' ? localStorage.getItem('laith_supabase_url') : null) || DEFAULT_SUPABASE_URL;
  const targetKey = anonKey || envKey || (typeof window !== 'undefined' ? localStorage.getItem('laith_supabase_key') : null) || DEFAULT_SUPABASE_ANON_KEY;

  if (!targetUrl || !targetKey) {
    return null;
  }

  if (cachedClient && currentUrl === targetUrl && currentKey === targetKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(targetUrl, targetKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
    currentUrl = targetUrl;
    currentKey = targetKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export function isSupabaseConfigured(url?: string, anonKey?: string): boolean {
  return !!getSupabaseClient(url, anonKey);
}

export interface SupabaseAuthResult {
  success: boolean;
  user?: any;
  error?: string;
  source: 'supabase_auth' | 'supabase_table' | 'local_fallback';
}

/**
 * Ensures the administrator user exists in the Supabase database store_admins table
 */
export async function ensureDefaultDatabaseAdmin(clientParam?: SupabaseClient | null): Promise<void> {
  const client = clientParam || getSupabaseClient();
  if (!client) return;

  try {
    const { data, error } = await client
      .from('store_admins')
      .select('id')
      .or('email.eq.alinsheikh1998@gmail.com,username.eq.admin')
      .limit(1);

    if (!error && (!data || data.length === 0)) {
      await client.from('store_admins').upsert([
        {
          id: 'adm_master',
          username: 'admin',
          email: 'admin@allaith.sy',
          password: 'laith2026',
          full_name: 'المدير العام',
          role: 'super_admin'
        },
        {
          id: 'adm_owner',
          username: 'ali',
          email: 'alinsheikh1998@gmail.com',
          password: 'laith2026',
          full_name: 'علي الشيخ - المدير العام',
          role: 'super_admin'
        }
      ], { onConflict: 'username' });
    }
  } catch {
    // Non-blocking if table not yet migrated
  }
}

/**
 * Authenticates admin via Supabase (Supabase Auth and database store_admins table).
 */
export async function authenticateAdminWithSupabase(
  identifier: string,
  passwordInput: string,
  options?: {
    customUrl?: string;
    customKey?: string;
    fallbackUsername?: string;
    fallbackPassword?: string;
  }
): Promise<SupabaseAuthResult> {
  const client = getSupabaseClient(options?.customUrl, options?.customKey);
  const trimmedId = identifier.trim();
  const trimmedPass = passwordInput.trim();

  if (client) {
    try {
      // 1. If identifier is an email, attempt Supabase Auth first
      if (trimmedId.includes('@')) {
        const { data: authData, error: authError } = await client.auth.signInWithPassword({
          email: trimmedId,
          password: trimmedPass
        });

        if (!authError && authData?.user) {
          return {
            success: true,
            user: authData.user,
            source: 'supabase_auth'
          };
        }
      }

      // 2. Query store_admins table in the Supabase database
      const { data: tableUser, error: tableError } = await client
        .from('store_admins')
        .select('*')
        .or(`email.eq.${trimmedId},username.eq.${trimmedId}`)
        .limit(1)
        .maybeSingle();

      if (!tableError && tableUser) {
        if (tableUser.password === trimmedPass || tableUser.password_hash === trimmedPass) {
          // Update last_login in Supabase database
          await client.from('store_admins').update({ last_login: new Date().toISOString() }).eq('id', tableUser.id);
          return {
            success: true,
            user: tableUser,
            source: 'supabase_table'
          };
        } else {
          return {
            success: false,
            error: 'كلمة المرور غير صحيحة لحساب الإدارة في Supabase',
            source: 'supabase_table'
          };
        }
      }

      // 3. Fallback check for designated admin credentials with auto-upsert to DB
      if (
        (trimmedId === 'alinsheikh1998@gmail.com' || trimmedId === 'admin' || trimmedId === 'ali') &&
        (trimmedPass === 'laith2026' || trimmedPass === (options?.fallbackPassword || 'laith2026'))
      ) {
        try {
          await client.from('store_admins').upsert([
            {
              id: 'adm_owner',
              username: trimmedId === 'admin' ? 'admin' : 'ali',
              email: 'alinsheikh1998@gmail.com',
              password: trimmedPass,
              full_name: 'علي الشيخ - المدير العام',
              role: 'super_admin'
            }
          ], { onConflict: 'username' });
        } catch {
          // Non-blocking
        }

        return {
          success: true,
          user: { email: 'alinsheikh1998@gmail.com', username: trimmedId, role: 'super_admin' },
          source: 'supabase_table'
        };
      }
    } catch (err: any) {
      console.warn('Supabase authentication check warning:', err);
    }
  }

  // Local fallback
  const validUser = (options?.fallbackUsername || 'admin').trim();
  const validPass = (options?.fallbackPassword || 'laith2026').trim();

  if ((trimmedId === validUser || trimmedId === 'alinsheikh1998@gmail.com') && trimmedPass === validPass) {
    return {
      success: true,
      user: { username: validUser, email: 'alinsheikh1998@gmail.com', role: 'super_admin' },
      source: 'local_fallback'
    };
  }

  return {
    success: false,
    error: 'بيانات تسجيل الدخول غير صحيحة في قاعدة البيانات Supabase',
    source: client ? 'supabase_table' : 'local_fallback'
  };
}


// ========================================================
// SYNCHRONIZATION HELPERS: PRODUCTS
// ========================================================

export async function fetchProductsFromSupabase(): Promise<Product[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Could not fetch products from Supabase:', error.message);
      return null;
    }
    return ((data || []) as any[]).map((p) => ({
      ...p,
      title_ar: p.title_ar ?? '',
      title_en: p.title_en ?? p.title_ar ?? '',
      slug: p.slug ?? p.id,
      description_ar: p.description_ar ?? '',
      description_en: p.description_en ?? '',
      category_id: p.category_id ?? 'cat-smartphones',
      brand: p.brand ?? 'Al-Laith',
      price: Number(p.price) || 0,
      price_usd: Number(p.price_usd) || 0,
      compare_at_price: p.compare_at_price != null ? Number(p.compare_at_price) : 0,
      compare_at_price_usd: p.compare_at_price_usd != null ? Number(p.compare_at_price_usd) : 0,
      has_discount: Boolean(p.has_discount),
      discount_percent: Number(p.discount_percent) || 0,
      condition: p.condition ?? 'new',
      condition_details: p.condition_details ?? '',
      device_type: p.device_type ?? 'smartphone',
      images: Array.isArray(p.images) && p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab'],
      variants: Array.isArray(p.variants) ? p.variants : [],
      specs: Array.isArray(p.specs) ? p.specs : [],
      stock_quantity: p.stock_quantity != null ? Number(p.stock_quantity) : 0,
      is_featured: Boolean(p.is_featured),
      is_archived: Boolean(p.is_archived),
      rating: p.rating != null ? Number(p.rating) : 5,
      reviews_count: p.reviews_count != null ? Number(p.reviews_count) : 0,
      sku: p.sku ?? '',
      warranty_ar: p.warranty_ar ?? '',
      warranty_en: p.warranty_en ?? '',
      created_at: p.created_at ?? new Date().toISOString()
    })) as Product[];
  } catch (e) {
    console.warn('Error querying products from Supabase:', e);
    return null;
  }
}

export async function upsertProductToSupabase(prod: Product): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase client not connected' };

  try {
    // Only send columns that exist in the Supabase products table schema
    const payload = {
      id: prod.id,
      title_ar: prod.title_ar,
      title_en: prod.title_en || prod.title_ar,
      slug: prod.slug || prod.id,
      description_ar: prod.description_ar || '',
      description_en: prod.description_en || '',
      category_id: prod.category_id,
      brand: prod.brand || 'Al-Laith',
      price: Number(prod.price) || 0,
      price_usd: Number(prod.price_usd) || 0,
      compare_at_price: prod.compare_at_price ? Number(prod.compare_at_price) : null,
      compare_at_price_usd: prod.compare_at_price_usd ? Number(prod.compare_at_price_usd) : null,
      has_discount: Boolean(prod.has_discount || (prod.compare_at_price && prod.compare_at_price > prod.price)),
      discount_percent: Number(prod.discount_percent) || 0,
      condition: prod.condition || 'new',
      device_type: prod.device_type || 'smartphone',
      images: Array.isArray(prod.images) ? prod.images : [],
      variants: Array.isArray(prod.variants) ? prod.variants : [],
      specs: Array.isArray(prod.specs) ? prod.specs : [],
      stock_quantity: Number(prod.stock_quantity) || 0,
      is_featured: Boolean(prod.is_featured),
      is_archived: Boolean(prod.is_archived),
      rating: Number(prod.rating) || 5,
      reviews_count: Number(prod.reviews_count) || 0,
      sku: prod.sku || '',
      warranty_ar: prod.warranty_ar || 'كفالة الليث',
      warranty_en: prod.warranty_en || 'Al-Laith Warranty',
      created_at: prod.created_at || new Date().toISOString()
    };

    const { error } = await client.from('products').upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error('Failed to upsert product to Supabase:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    console.error('Exception upserting product to Supabase:', e);
    return { success: false, error: e?.message };
  }
}

export async function deleteProductFromSupabase(id: string): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase client not connected' };

  try {
    const { error } = await client
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete product from Supabase:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    console.error('Exception deleting product from Supabase:', e);
    return { success: false, error: e?.message };
  }
}

export async function archiveProductInSupabase(id: string, isArchived: boolean): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase client not connected' };

  try {
    const { error } = await client
      .from('products')
      .update({ is_archived: isArchived })
      .eq('id', id);

    if (error) {
      console.error('Failed to archive product in Supabase:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    console.error('Exception archiving product in Supabase:', e);
    return { success: false, error: e?.message };
  }
}

// ========================================================
// SYNCHRONIZATION HELPERS: CATEGORIES
// ========================================================

export async function fetchCategoriesFromSupabase(): Promise<Category[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) return null;
    return (data || []) as Category[];
  } catch {
    return null;
  }
}

export async function upsertCategoryToSupabase(cat: Category): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase client not connected' };

  try {
    const { error } = await client
      .from('categories')
      .upsert({
        id: cat.id,
        name_ar: cat.name_ar,
        name_en: cat.name_en,
        slug: cat.slug,
        image_url: cat.image_url,
        sort_order: cat.sort_order,
        is_archived: cat.is_archived ?? false
      }, { onConflict: 'id' });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
}

export async function deleteCategoryFromSupabase(id: string): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase client not connected' };

  try {
    const { error } = await client.from('categories').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
}

export async function archiveCategoryInSupabase(id: string, isArchived: boolean): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase client not connected' };

  try {
    const { error } = await client
      .from('categories')
      .update({ is_archived: isArchived })
      .eq('id', id);

    if (error) {
      console.error('Failed to archive category in Supabase:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    console.error('Exception archiving category in Supabase:', e);
    return { success: false, error: e?.message };
  }
}

// ========================================================
// SYNCHRONIZATION HELPERS: HERO SLIDES
// ========================================================

export async function fetchHeroSlidesFromSupabase(): Promise<HeroSlide[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('hero_slides')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error || !data) return null;
    return data.map((d: any) => ({
      id: d.id,
      title_ar: d.title_ar,
      title_en: d.title_en,
      subtitle_ar: d.subtitle_ar || '',
      subtitle_en: d.subtitle_en || '',
      tag_ar: d.badge_ar || d.tag_ar || '',
      tag_en: d.badge_en || d.tag_en || '',
      image: d.image_url || d.image,
      button_text_ar: d.button_text_ar || 'تصفح الآن',
      button_text_en: d.button_text_en || 'Shop Now',
      button_link: d.link_target || d.link || d.button_link || 'catalog'
    }));
  } catch {
    return null;
  }
}

export async function upsertHeroSlideToSupabase(slide: HeroSlide, index = 0): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase client not connected' };

  try {
    const { error } = await client
      .from('hero_slides')
      .upsert({
        id: slide.id,
        title_ar: slide.title_ar,
        title_en: slide.title_en,
        subtitle_ar: slide.subtitle_ar || '',
        subtitle_en: slide.subtitle_en || '',
        badge_ar: slide.tag_ar || '',
        badge_en: slide.tag_en || '',
        image_url: slide.image || '',
        link_type: 'custom',
        link_target: slide.button_link || 'catalog',
        button_text_ar: slide.button_text_ar || 'تصفح الآن',
        button_text_en: slide.button_text_en || 'Shop Now',
        sort_order: index,
        is_active: true
      }, { onConflict: 'id' });

    if (error) {
      console.error('Failed to upsert hero slide to Supabase:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
}

export async function deleteHeroSlideFromSupabase(id: string): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase client not connected' };

  try {
    const { error } = await client.from('hero_slides').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
}

// ========================================================
// SYNCHRONIZATION HELPERS: STORE SETTINGS
// ========================================================

export async function fetchSettingsFromSupabase(): Promise<Partial<StoreSettings> | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('store_settings')
      .select('*')
      .eq('id', 'default')
      .single();

    if (error || !data) return null;
    return {
      site_name_ar: data.site_name_ar ?? 'متجر الليث للهواتف الذكية',
      site_name_en: data.site_name_en ?? 'Al-Laith Smart Phones',
      custom_logo_url: data.custom_logo_url ?? data.logo_url ?? '',
      whatsapp_number: data.whatsapp_number ?? '0937861787',
      maintenance_whatsapp: data.maintenance_whatsapp ?? '0937861787',
      usd_exchange_rate: Number(data.usd_exchange_rate) || 15000,
      store_address_ar: data.store_address_ar ?? 'اللاذقية - شارع 8 آذار - مقابل بنك بيمو',
      store_address_en: data.store_address_en ?? 'Latakia, 8th of March St, Facing BEMO Bank',
      store_phone: data.store_phone ?? '041221199',
      store_email: data.store_email ?? 'info@allaith-store.com',
      store_lat: Number(data.store_lat) || 35.524917,
      store_lng: Number(data.store_lng) || 35.852556,
      google_sheets_webhook_url: data.google_sheets_webhook_url ?? '',
      delivery_fee_base: data.delivery_fee_base != null ? Number(data.delivery_fee_base) : 25000,
      free_delivery_threshold: data.free_delivery_threshold != null ? Number(data.free_delivery_threshold) : 5000000
    };
  } catch {
    return null;
  }
}

export async function upsertSettingsToSupabase(settings: StoreSettings): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase client not connected' };

  try {
    const { error } = await client
      .from('store_settings')
      .upsert({
        id: 'default',
        site_name_ar: settings.site_name_ar,
        site_name_en: settings.site_name_en,
        logo_url: settings.custom_logo_url || settings.logo_url,
        custom_logo_url: settings.custom_logo_url,
        whatsapp_number: settings.whatsapp_number,
        maintenance_whatsapp: settings.maintenance_whatsapp,
        usd_exchange_rate: settings.usd_exchange_rate,
        store_address_ar: settings.store_address_ar,
        store_address_en: settings.store_address_en,
        store_phone: settings.store_phone,
        store_email: settings.store_email,
        store_lat: settings.store_lat,
        store_lng: settings.store_lng,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
}

// ========================================================
// FULL STORE CATALOG SEED & SYNC
// ========================================================

export async function syncEntireCatalogToSupabase(
  products: Product[],
  categories: Category[],
  heroSlides: HeroSlide[],
  settings: StoreSettings
): Promise<{ success: boolean; message: string; count?: number }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase is not configured yet. Please enter project URL & anon key.' };
  }

  try {
    // 1. Settings
    await upsertSettingsToSupabase(settings);

    // 2. Categories
    for (const cat of categories) {
      await upsertCategoryToSupabase(cat);
    }

    // 3. Products
    for (const prod of products) {
      await upsertProductToSupabase(prod);
    }

    // 4. Hero Slides
    for (let i = 0; i < heroSlides.length; i++) {
      await upsertHeroSlideToSupabase(heroSlides[i], i);
    }

    return {
      success: true,
      message: `تمت مزامنة ${products.length} منتجاً و ${categories.length} قسماً و ${heroSlides.length} بانرات مع Supabase بنجاح!`,
      count: products.length
    };
  } catch (e: any) {
    return { success: false, message: e?.message || 'Sync failed' };
  }
}

// ========================================================
// SYNCHRONIZATION HELPERS: ORDERS
// ========================================================

export async function fetchOrdersFromSupabase(): Promise<any[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

export async function upsertOrderToSupabase(order: any): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase client not connected' };

  try {
    const { error } = await client
      .from('orders')
      .upsert({
        id: order.id,
        order_number: order.order_number || `ORD-${Date.now().toString().slice(-6)}`,
        customer_name: order.customer_name || 'عميل',
        customer_phone: order.customer_phone || order.phone || '',
        governorate: order.governorate || 'اللاذقية',
        delivery_address: order.delivery_address || order.address || 'سوريا',
        notes: order.notes || '',
        items: Array.isArray(order.items) ? order.items : [],
        subtotal: Number(order.subtotal) || 0,
        delivery_fee: Number(order.delivery_fee) || 0,
        total: Number(order.total) || 0,
        currency: order.currency || 'SYP',
        status: order.status || 'new',
        whatsapp_sent: Boolean(order.whatsapp_sent),
        google_sheets_synced: Boolean(order.google_sheets_synced),
        synced_to_sheets: Boolean(order.synced_to_sheets),
        created_at: order.created_at || new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      console.error('Failed to upsert order to Supabase:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
}

export async function updateOrderStatusInSupabase(orderId: string, status: string): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase client not connected' };

  try {
    const { error } = await client
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
}

// ========================================================
// SYNCHRONIZATION HELPERS: MAINTENANCE REQUESTS
// ========================================================

export async function fetchMaintenanceRequestsFromSupabase(): Promise<any[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('maintenance_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

export async function upsertMaintenanceRequestToSupabase(req: any): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase client not connected' };

  try {
    const { error } = await client
      .from('maintenance_requests')
      .upsert({
        id: req.id,
        request_number: req.request_number,
        customer_name: req.customer_name,
        phone: req.phone,
        device_type: req.device_type,
        device_model: req.device_model,
        issue_description: req.issue_description,
        photo_url: req.photo_url,
        preferred_date: req.preferred_date,
        status: req.status || 'new',
        notes_admin: req.notes_admin,
        created_at: req.created_at || new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
}

export async function updateMaintenanceStatusInSupabase(requestId: string, status: string): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase client not connected' };

  try {
    const { error } = await client
      .from('maintenance_requests')
      .update({ status })
      .eq('id', requestId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
}

// ========================================================
// SYNCHRONIZATION HELPERS: PHONE SOURCING REQUESTS
// ========================================================

export async function fetchPhoneRequestsFromSupabase(): Promise<any[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('phone_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

export async function upsertPhoneRequestToSupabase(req: any): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase client not connected' };

  try {
    const specs = req.specifications || [req.brand, req.model, req.notes_admin || req.notes].filter(Boolean).join(' - ') || 'طلب جهاز مخصص';
    const { error } = await client
      .from('phone_requests')
      .upsert({
        id: req.id,
        request_number: req.request_number || `REQ-${Date.now().toString().slice(-6)}`,
        customer_name: req.customer_name || req.name || 'عميل',
        phone: req.phone || req.customer_phone || '',
        address: req.address || req.city || 'اللاذقية',
        device_type: req.device_type || 'smartphone',
        specifications: specs,
        storage: req.storage || req.storage_preference || null,
        color: req.color || req.color_preference || null,
        condition: req.condition || 'new',
        status: req.status || 'pending',
        created_at: req.created_at || new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      console.error('Failed to upsert phone request to Supabase:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
}

// ========================================================
// REALTIME SUBSCRIPTION FOR LIVE STOREFRONT UPDATES
// ========================================================

export function subscribeToStoreSync(
  onTableChange: (table: string, eventType: string, payload: any) => void
): () => void {
  const client = getSupabaseClient();
  if (!client) return () => {};

  try {
    const channel = client
      .channel('store-sync-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        onTableChange('products', payload.eventType, payload);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, (payload) => {
        onTableChange('categories', payload.eventType, payload);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hero_slides' }, (payload) => {
        onTableChange('hero_slides', payload.eventType, payload);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'store_settings' }, (payload) => {
        onTableChange('store_settings', payload.eventType, payload);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        onTableChange('orders', payload.eventType, payload);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'maintenance_requests' }, (payload) => {
        onTableChange('maintenance_requests', payload.eventType, payload);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'phone_requests' }, (payload) => {
        onTableChange('phone_requests', payload.eventType, payload);
      })
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  } catch (e) {
    console.warn('Realtime subscription not supported or error:', e);
    return () => {};
  }
}

/**
 * Complete SQL Migration Script for Supabase
 * Can be run directly inside the Supabase SQL Editor
 */
export const SUPABASE_SQL_SCHEMA = `-- ========================================================
-- Al-Laith for Telecommunications (متجر الليث للاتصالات)
-- Complete Supabase PostgreSQL Database Schema
-- Run this in your Supabase project's SQL Editor
-- ========================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Store Administrators Table (Authentication via Supabase Database)
CREATE TABLE IF NOT EXISTS public.store_admins (
    id TEXT PRIMARY KEY DEFAULT ('adm_' || substr(md5(random()::text), 1, 8)),
    username TEXT NOT NULL UNIQUE,
    email TEXT UNIQUE,
    password TEXT NOT NULL,
    password_hash TEXT,
    full_name TEXT NOT NULL DEFAULT 'مدير متجر الليث',
    role TEXT NOT NULL DEFAULT 'super_admin',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Designated Master Admin User
INSERT INTO public.store_admins (id, username, email, password, full_name, role)
VALUES 
    ('adm_master', 'admin', 'admin@allaith.sy', 'laith2026', 'المدير العام', 'super_admin'),
    ('adm_owner', 'ali', 'alinsheikh1998@gmail.com', 'laith2026', 'علي الشيخ - المدير العام', 'super_admin')
ON CONFLICT (username) DO UPDATE SET 
    password = EXCLUDED.password,
    role = EXCLUDED.role;

-- 3. Store Settings Table
CREATE TABLE IF NOT EXISTS public.store_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    site_name_ar TEXT NOT NULL DEFAULT 'الليث للاتصالات',
    site_name_en TEXT NOT NULL DEFAULT 'Al-Laith Telecom',
    logo_url TEXT,
    custom_logo_url TEXT,
    whatsapp_number TEXT DEFAULT '963944000000',
    maintenance_whatsapp TEXT DEFAULT '963944000000',
    usd_exchange_rate NUMERIC DEFAULT 15000,
    store_address_ar TEXT DEFAULT 'اللاذقية - شارع 8 آذار',
    store_address_en TEXT DEFAULT 'Latakia - 8th of March St',
    store_phone TEXT DEFAULT '+96341234567',
    store_email TEXT DEFAULT 'info@allaith.sy',
    store_lat NUMERIC DEFAULT 35.524917,
    store_lng NUMERIC DEFAULT 35.852556,
    footer_quick_links JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    image_url TEXT,
    sort_order INT DEFAULT 0,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Products Table (Includes multi-attribute variants, Amazon-style specs, discounts & archive flag)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description_ar TEXT,
    description_en TEXT,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    brand TEXT NOT NULL,
    price NUMERIC NOT NULL, -- SYP price
    price_usd NUMERIC,      -- USD price
    compare_at_price NUMERIC,
    compare_at_price_usd NUMERIC,
    has_discount BOOLEAN DEFAULT false,
    discount_percent NUMERIC DEFAULT 0,
    condition TEXT DEFAULT 'new',
    condition_details TEXT,
    device_type TEXT DEFAULT 'smartphone',
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    variants JSONB DEFAULT '[]'::jsonb,
    variant_combinations JSONB DEFAULT '[]'::jsonb, -- e.g. [{"attributes":{"Storage":"256GB","Color":"Black"},"price_usd":1000,"stock_quantity":10}]
    specs JSONB DEFAULT '[]'::jsonb,                 -- Amazon-style Key/Value pairs
    stock_quantity INT DEFAULT 10,
    is_featured BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,              -- Hidden from public storefront when true
    rating NUMERIC DEFAULT 5.0,
    reviews_count INT DEFAULT 1,
    sku TEXT,
    warranty_ar TEXT,
    warranty_en TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Orders Table (Sales Orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    governorate TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    notes TEXT,
    items JSONB NOT NULL,
    subtotal NUMERIC NOT NULL,
    delivery_fee NUMERIC DEFAULT 0,
    total NUMERIC NOT NULL,
    currency TEXT DEFAULT 'SYP',
    status TEXT NOT NULL DEFAULT 'new', -- 'new', 'confirmed', 'shipped', 'delivered', 'cancelled'
    google_sheets_synced BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Maintenance & Tech Lab Requests
CREATE TABLE IF NOT EXISTS public.maintenance_requests (
    id TEXT PRIMARY KEY,
    request_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    device_type TEXT NOT NULL,
    device_model TEXT NOT NULL,
    issue_description TEXT NOT NULL,
    photo_url TEXT,
    preferred_date TEXT,
    status TEXT NOT NULL DEFAULT 'new', -- 'new', 'in_progress', 'resolved', 'cancelled'
    notes_admin TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Analytics & Visits Table (Timeframe tracking & permanent storage)
CREATE TABLE IF NOT EXISTS public.analytics_visits (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    path TEXT NOT NULL,
    page_title TEXT,
    referrer TEXT,
    device TEXT DEFAULT 'desktop',
    visitor_id TEXT NOT NULL,
    duration_seconds INT DEFAULT 0
);

-- 8. Hero Slides Table (Dynamic Homepage Carousel)
CREATE TABLE IF NOT EXISTS public.hero_slides (
    id TEXT PRIMARY KEY,
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    subtitle_ar TEXT,
    subtitle_en TEXT,
    tag_ar TEXT,
    tag_en TEXT,
    image_url TEXT NOT NULL,
    link TEXT DEFAULT '#catalog',
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Custom Phone Sourcing Requests
CREATE TABLE IF NOT EXISTS public.phone_requests (
    id TEXT PRIMARY KEY,
    request_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    color TEXT,
    storage TEXT,
    budget_range TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    notes_admin TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Indexes for Instant Performance
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_archived ON public.products(is_archived);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON public.maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_hero_slides_sort ON public.hero_slides(sort_order);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON public.analytics_visits(timestamp);

-- 11. Row Level Security (Public Read, Admin Full Access)
ALTER TABLE public.store_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_visits ENABLE ROW LEVEL SECURITY;

-- Allow access with anon key for store_admins table
CREATE POLICY "Full access with anon key for store_admins" ON public.store_admins FOR ALL USING (true);

-- Allow public read of unarchived products
CREATE POLICY "Public can view unarchived products" ON public.products
    FOR SELECT USING (is_archived = false);

-- Allow public read of unarchived categories
CREATE POLICY "Public can view unarchived categories" ON public.categories
    FOR SELECT USING (is_archived = false);

-- Allow public read of hero slides
CREATE POLICY "Public can view hero slides" ON public.hero_slides
    FOR SELECT USING (true);

-- Allow public read of store settings
CREATE POLICY "Public can view settings" ON public.store_settings
    FOR SELECT USING (true);

-- Allow public to insert orders, maintenance and phone requests
CREATE POLICY "Public can create orders" ON public.orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can create maintenance requests" ON public.maintenance_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can create phone requests" ON public.phone_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can record visits" ON public.analytics_visits
    FOR INSERT WITH CHECK (true);

-- Allow all operations for anon/service key
CREATE POLICY "Full access with anon key for products" ON public.products FOR ALL USING (true);
CREATE POLICY "Full access with anon key for categories" ON public.categories FOR ALL USING (true);
CREATE POLICY "Full access with anon key for settings" ON public.store_settings FOR ALL USING (true);
CREATE POLICY "Full access with anon key for orders" ON public.orders FOR ALL USING (true);
CREATE POLICY "Full access with anon key for maintenance" ON public.maintenance_requests FOR ALL USING (true);
CREATE POLICY "Full access with anon key for hero_slides" ON public.hero_slides FOR ALL USING (true);
CREATE POLICY "Full access with anon key for phone_requests" ON public.phone_requests FOR ALL USING (true);
CREATE POLICY "Full access with anon key for analytics" ON public.analytics_visits FOR ALL USING (true);
`;

/**
 * Validates connection to Supabase instance
 */
export async function testSupabaseConnection(url?: string, anonKey?: string): Promise<{ success: boolean; message: string }> {
  try {
    const client = getSupabaseClient(url, anonKey);
    if (!client) {
      return { success: false, message: 'Missing URL or Anon Key' };
    }
    const { error } = await client.from('store_settings').select('id').limit(1);
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return { success: true, message: 'الاتصال ناجح! يرجى تشغيل كود SQL لإنشاء الجداول.' };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: 'الاتصال بقاعدة بيانات Supabase مستقر وناجح!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Connection test failed' };
  }
}
