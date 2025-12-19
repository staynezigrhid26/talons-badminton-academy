import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = () => {
  return (
    supabaseUrl !== '' && 
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey !== ''
  );
};

export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured() ? supabaseAnonKey : 'placeholder'
);

// Generic fetcher for table data
export const fetchData = async (table: string) => {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.from(table).select('*');
  if (error) {
    console.error(`Error fetching ${table}:`, error);
    return null;
  }
  return data;
};

// Generic upsert (insert or update)
export const upsertRecord = async (table: string, record: any) => {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.from(table).upsert(record).select().single();
  if (error) {
    console.error(`Error upserting to ${table}:`, error);
    throw error;
  }
  return data;
};

// Generic delete
export const deleteRecord = async (table: string, id: string) => {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) {
    console.error(`Error deleting from ${table}:`, error);
    throw error;
  }
};

/**
 * Uploads a base64 image to Supabase Storage.
 */
export const uploadImage = async (fileBase64: string, folder: string, fileName: string) => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured. Using local storage only.');
    return null;
  }

  try {
    const base64Parts = fileBase64.split(',');
    const base64Data = base64Parts.length > 1 ? base64Parts[1] : base64Parts[0];
    
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });

    const cleanFileName = (fileName || 'unnamed').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const path = `${folder}/${cleanFileName}-${Date.now()}.png`;
    
    const { error } = await supabase.storage
      .from('academy-assets')
      .upload(path, blob, { 
        contentType: 'image/png', 
        upsert: true,
        cacheControl: '3600'
      });

    if (error) {
      console.warn('Cloud upload failed:', error.message);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('academy-assets')
      .getPublicUrl(path);

    return publicUrl;
  } catch (error) {
    console.warn('Network error during upload.');
    return null;
  }
};

export const checkStorageConfig = async () => {
  if (!isSupabaseConfigured()) return { ok: false, message: "Env missing" };
  try {
    const { error } = await supabase.storage.from('academy-assets').list('', { limit: 1 });
    return error ? { ok: false, message: error.message } : { ok: true, message: "Cloud connected" };
  } catch (e) {
    return { ok: false, message: "Network error" };
  }
};