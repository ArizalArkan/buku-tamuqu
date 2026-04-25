/**
 * Test script to verify Supabase connection
 * Run with: npx ts-node test-supabase.ts
 */

import { supabase } from './src/lib/supabase';

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');

  try {
    // Test 1: Check connection
    const { data, error } = await supabase.from('guests').select('count');
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      console.log('\n💡 Make sure:');
      console.log('   1. You have created the tables using supabase-schema.sql');
      console.log('   2. Your .env.local file has correct credentials');
      console.log('   3. Your Supabase project is running');
      return;
    }

    console.log('✅ Successfully connected to Supabase!');
    console.log(`📊 Found ${data?.length || 0} guests in database\n`);

    // Test 2: Try to fetch guests
    const { data: guests, error: guestsError } = await supabase
      .from('guests')
      .select('*')
      .limit(5);

    if (guestsError) {
      console.error('❌ Error fetching guests:', guestsError.message);
      return;
    }

    if (guests && guests.length > 0) {
      console.log('📋 Sample guests:');
      guests.forEach((guest, i) => {
        console.log(`   ${i + 1}. ${guest.name} (${guest.category}) - ${guest.attendance_status}`);
      });
    } else {
      console.log('ℹ️  No guests found. Add some test data:');
      console.log('\n   Run this in Supabase SQL Editor:');
      console.log(`
   INSERT INTO guests (name, phone, category, table_no, rsvp_status, attendance_status)
   VALUES 
     ('Arizal Arkan', '081234567890', 'VVIP', 'V1', 'Ya', 'Belum'),
     ('Budi Santoso', '081234567891', 'VIP', 'A1', 'Ya', 'Belum');
      `);
    }

    console.log('\n✨ Setup complete! Run "npm run dev" to start the app.');

  } catch (err) {
    console.error('❌ Unexpected error:', err);
    console.log('\n💡 Check your .env.local file:');
    console.log('   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co');
    console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...');
  }
}

testConnection();
