import { createClient } from '@supabase/supabase-js';

/**
 * 🛠️ UPDATED SUPABASE SQL EDITOR SCRIPT (Simplified / Lowercase Only)
 * Run this in your Supabase SQL Editor:
 * 
 * CREATE TABLE students (id TEXT PRIMARY KEY, name TEXT, age INT, birthday DATE, profile_pic TEXT, level TEXT, health_status TEXT, attendance JSONB DEFAULT '[]'::jsonb, tournament_ids JSONB DEFAULT '[]'::jsonb, notes TEXT);
 * CREATE TABLE coaches (id TEXT PRIMARY KEY, name TEXT, email TEXT UNIQUE, password TEXT, specialization TEXT, profile_pic TEXT, age INT, phone TEXT);
 * CREATE TABLE officers (id TEXT PRIMARY KEY, name TEXT, role TEXT, profile_pic TEXT, contact TEXT);
 * CREATE TABLE tournaments (id TEXT PRIMARY KEY, name TEXT, date DATE, location TEXT, categories JSONB DEFAULT '[]'::jsonb, description TEXT);
 * CREATE TABLE announcements (id TEXT PRIMARY KEY, title TEXT, content TEXT, date DATE, author TEXT);
 * CREATE TABLE daily_plans (id TEXT PRIMARY KEY, date DATE, start_time TEXT, end_time TEXT, total_duration TEXT, title TEXT, exercises JSONB DEFAULT '[]'::jsonb, notes TEXT);
 * CREATE TABLE sessions (id TEXT PRIMARY KEY, title TEXT, date DATE, start_time TEXT, end_time TEXT, focus TEXT, type TEXT, target_levels JSONB DEFAULT '[]'::jsonb);
 * CREATE TABLE academy_settings (id TEXT PRIMARY KEY, name TEXT, logo_url TEXT, banner_url TEXT);
 * 
 * ALTER TABLE students DISABLE ROW LEVEL SECURITY;
 * ALTER TABLE coaches DISABLE ROW LEVEL SECURITY;
 * ALTER TABLE officers DISABLE ROW LEVEL SECURITY;
 * ALTER TABLE tournaments DISABLE ROW LEVEL SECURITY;
 * ALTER TABLE announcements DISABLE ROW LEVEL SECURITY;
 * ALTER TABLE daily_plans DISABLE ROW LEVEL SECURITY;
 * ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
 * ALTER TABLE academy_settings DISABLE ROW LEVEL SECURITY;
 * 
 * IMPORTANT: Create a Public Storage Bucket named 'academy-assets'.
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

export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured() ? supabaseAnonKey : 'placeholder'
);

export const fetchData = async (table: string) => {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase.from(table).select('*');
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Supabase Fetch Error [${table}]:`, error);
    return null;
  }
};

export const upsertRecord = async (table: string, record: any) => {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase.from(table).upsert(record).select().single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Supabase Upsert Error [${table}]:`, error);
    throw error;
  }
};

export const deleteRecord = async (table: string, id: string) => {
  if (!isSupabaseConfigured()) return;
  try {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    console.error(`Supabase Delete Error [${table}]:`, error);
    throw error;
  }
};

export const uploadImage = async (fileBase64: string, folder: string, fileName: string) => {
  if (!isSupabaseConfigured() || !fileBase64 || !fileBase64.includes(',')) return null;
  try {
    const base64Parts = fileBase64.split(',');
    const base64Data = base64Parts.length > 1 ? base64Parts[1] : base64Parts[0];
    
    // Safety check for valid base64
    try {
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });
      const cleanFileName = (fileName || 'unnamed').replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const path = `${folder}/${cleanFileName}-${Date.now()}.png`;
      const { error } = await supabase.storage.from('academy-assets').upload(path, blob, { contentType: 'image/png', upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('academy-assets').getPublicUrl(path);
      return publicUrl;
    } catch (atobErr) {
      console.error('Invalid Base64 Data Provided');
      return null;
    }
  } catch (error) {
    console.error('Upload Error:', error);
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