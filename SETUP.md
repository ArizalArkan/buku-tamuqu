# Setup Guide: Wedding Guestbook QR Check-in System

## Prerequisites
- Node.js 18+ installed
- Supabase account (free tier works)

## 1. Supabase Setup

### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Create a new project
3. Wait for the database to be provisioned

### Run Database Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Open the file `supabase-schema.sql` from this project
3. Copy and paste the entire SQL content into the SQL Editor
4. Click **Run** to create the tables and indexes

### Get API Credentials
1. Go to **Project Settings** → **API**
2. Copy the following:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## 2. Environment Configuration

1. Open `.env.local` in the project root
2. Replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## 3. Seed Sample Data (Optional)

To test the system, you can add sample guests via Supabase SQL Editor:

```sql
INSERT INTO guests (name, phone, category, table_no, rsvp_status, attendance_status, souvenir_status)
VALUES
  ('Arizal Arkan', '081234567890', 'VVIP', 'V1', 'Ya', 'Belum', 'Pending'),
  ('Budi Santoso', '081234567891', 'VIP', 'A1', 'Ya', 'Belum', 'Pending'),
  ('Siti Aminah', '081234567892', 'Regular', 'B2', 'Ya', 'Belum', 'Pending'),
  ('Dewi Kusuma', '081234567893', 'VIP', 'A2', 'Belum', 'Belum', 'Pending'),
  ('Ahmad Wijaya', '081234567894', 'Regular', 'B3', 'Ya', 'Belum', 'Pending');
```

## 4. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 5. Testing QR Check-in

### Generate Test QR Codes
You can use any QR code generator (e.g., [qr-code-generator.com](https://www.qr-code-generator.com/)) to create QR codes with URLs like:

```
https://invitingart.id/ayubi-arkan/?to=Arizal Arkan
https://invitingart.id/ayubi-arkan/?to=Budi Santoso
```

**Important:** The guest name in the `?to=` parameter must **exactly match** the name in your database (case-insensitive).

### Test Check-in Flow

1. **Via QR Scanner:**
   - Go to `/check-in` page
   - Click "Start Scanner"
   - Grant camera permissions
   - Scan a QR code with the format above
   - Guest will be automatically checked in

2. **Via Manual Search:**
   - Go to `/check-in` page
   - Type guest name in "Cari tamu terdaftar"
   - Click "Check-in"

3. **Via Attendance Page:**
   - Go to `/attendance` page
   - Find the guest in the table
   - Click "Hadir" button
   - Real-time updates across all pages

### Undo Check-in
- In `/attendance` page, click "Batal" button for checked-in guests

## 6. Real-time Updates

The system uses Supabase Realtime to automatically update:
- Attendance statistics
- Guest status badges
- Recent check-in list

No page refresh needed!

## Features Implemented

✅ QR code scanner with camera access
✅ Parse `?to=` query parameter from QR URLs
✅ Auto check-in on QR scan
✅ Manual check-in via search
✅ Manual check-in from attendance page
✅ Undo check-in functionality
✅ Real-time attendance updates
✅ Check-in history tracking
✅ Supabase database integration

## Troubleshooting

### Camera not working
- Ensure you're using HTTPS or localhost
- Grant camera permissions in browser
- Try a different browser (Chrome/Edge recommended)

### Guest not found
- Check the guest name exactly matches the database
- Names are case-insensitive but must match spelling
- Add guest via Data Tamu page first

### Real-time not updating
- Check Supabase connection in browser console
- Verify API keys in `.env.local`
- Refresh the page to reconnect

## Next Steps

- Add guest management UI (CRUD operations)
- Implement souvenir distribution tracking
- Add export/import Excel functionality
- Generate QR codes automatically for each guest
- Add authentication for admin access
