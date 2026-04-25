import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Guest = {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  category: 'VVIP' | 'VIP' | 'Regular';
  source?: string;
  table_no?: string;
  rsvp_status: 'Ya' | 'Tidak' | 'Belum';
  attendance_status: 'Hadir' | 'Belum';
  souvenir_status: 'Terima' | 'Pending';
  checked_in_at?: string;
  created_at?: string;
  updated_at?: string;
};
