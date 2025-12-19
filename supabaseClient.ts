import { createClient } from '@supabase/supabase-js';

/**
 * SUPABASE CONFIGURATION:
 * These values are injected by Vite during the build process on Vercel.
 * Make sure to add SUPABASE_URL and SUPABASE_ANON_KEY to your Vercel Project Settings.
 */

const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = () => {
  return (
    supabaseUrl !== '' && 
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey !== ''
  );
};

// Initialize with a placeholder if not configured to prevent crashes, 
// though we check isSupabaseConfigured() before critical actions.
export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured() ? supabaseAnonKey : 'placeholder'
);

/**
 * Diagnostic tool to check if the storage bucket is ready.
 */
export const checkStorageConfig = async () => {
  if (!isSupabaseConfigured()) return { ok: false, message: "Environment variables missing in Vercel settings." };
  
  try {
    const { data, error } = await supabase.storage.from('academy-assets').list('', { limit: 1 });
    
    if (error) {
      if (error.message.toLowerCase().includes('not found')) {
        return { ok: false, message: "Bucket 'academy-assets' not found in your Supabase project." };
      }
      return { ok: false, message: `Access Error: ${error.message}` };
    }
    return { ok: true, message: "Connected to Supabase Storage!" };
  } catch (e) {
    return { ok: false, message: "Network connection error. Check CORS settings in Supabase dashboard." };
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
      console.warn('Cloud upload failed, falling back to local base64:', error.message);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('academy-assets')
      .getPublicUrl(path);

    return publicUrl;
  } catch (error) {
    console.warn('Network error during upload. Using local fallback.');
    return null;
  }
};