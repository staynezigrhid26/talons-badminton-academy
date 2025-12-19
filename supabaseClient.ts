
import { createClient } from '@supabase/supabase-js';

/**
 * SUPABASE CONFIGURATION:
 * These values are pulled from environment variables in Vercel.
 */

const supabaseUrl = (process.env.SUPABASE_URL || 'https://prxaquywrzeanigbavx.supabase.co').trim() as string;
const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || 'sb_publishable_pwGJk9_0B5ZdzeKTqBamrA_2drrUT3m').trim() as string;

// Debug helper for developers
if (supabaseUrl.includes(' ') || supabaseAnonKey.includes(' ')) {
  console.error('SUPABASE CONFIG ERROR: Your URL or Key contains spaces. Please check your Vercel Environment Variables.');
}

export const isSupabaseConfigured = () => {
  return (
    supabaseUrl !== '' && 
    !supabaseUrl.includes('placeholder') &&
    supabaseUrl.startsWith('https://')
  );
};

export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured() ? supabaseAnonKey : 'placeholder'
);

/**
 * Diagnostic tool to check if the storage bucket is ready.
 * Run this to see if CORS or Permissions are the issue.
 */
export const checkStorageConfig = async () => {
  if (!isSupabaseConfigured()) return { ok: false, message: "Not configured" };
  
  try {
    const { data, error } = await supabase.storage.getBucket('academy-assets');
    if (error) {
      if (error.message.includes('not found')) {
        return { ok: false, message: "BUCKET MISSING: Create a bucket named 'academy-assets' in Supabase Storage." };
      }
      return { ok: false, message: `STORAGE ERROR: ${error.message}` };
    }
    return { ok: true, message: "Storage is correctly configured and accessible!" };
  } catch (e) {
    if (e instanceof TypeError && e.message.includes('fetch')) {
      return { ok: false, message: "CORS ERROR: Your browser is blocking the request. Update 'Allowed Origins' in Supabase." };
    }
    return { ok: false, message: "Unknown connection error." };
  }
};

/**
 * Uploads a base64 image to Supabase Storage.
 */
export const uploadImage = async (fileBase64: string, folder: string, fileName: string) => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase is not configured. Image will only be stored locally.');
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

    const cleanFileName = fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const path = `${folder}/${cleanFileName}-${Date.now()}.png`;
    
    const { data, error } = await supabase.storage
      .from('academy-assets')
      .upload(path, blob, { 
        contentType: 'image/png', 
        upsert: true,
        cacheControl: '3600'
      });

    if (error) {
      console.error(`Upload failed: ${error.message}`);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('academy-assets')
      .getPublicUrl(path);

    return publicUrl;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('CORS/Network Error detected during upload.');
    } else {
      console.error('Upload process failed:', error);
    }
    return null;
  }
};
