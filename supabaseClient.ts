
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

/**
 * SUPABASE CONFIGURATION:
 * These values are now pulled from environment variables in Vercel.
 * Make sure to add SUPABASE_URL and SUPABASE_ANON_KEY to your Vercel Project Settings.
 */

// Fix: Use process.env instead of import.meta.env as configured in vite.config.ts
const supabaseUrl = (process.env.SUPABASE_URL || 'https://prxaquywrzeanxigbavx.supabase.co') as string;
const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || 'sb_publishable_pwGJk9_0B5ZdzeKTqBamrA_2drrUT3m') as string;

export const isSupabaseConfigured = () => {
  return (
    supabaseUrl !== '' && 
    !supabaseUrl.includes('placeholder')
  );
};

export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured() ? supabaseAnonKey : 'placeholder'
);

export const uploadImage = async (fileBase64: string, folder: string, fileName: string) => {
  if (!isSupabaseConfigured()) return null;

  try {
    const base64Data = fileBase64.includes(',') ? fileBase64.split(',')[1] : fileBase64;
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
      .upload(path, blob, { contentType: 'image/png', upsert: true });

    if (error) {
      console.error('Supabase Storage Error:', error.message);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('academy-assets')
      .getPublicUrl(path);

    return publicUrl;
  } catch (error) {
    console.error('Upload process failed:', error);
    return null;
  }
};
