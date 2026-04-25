-- Create guests table
CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  category TEXT NOT NULL CHECK (category IN ('VVIP', 'VIP', 'Regular')),
  source TEXT,
  table_no TEXT,
  pax INTEGER NOT NULL DEFAULT 1 CHECK (pax >= 1),
  rsvp_status TEXT NOT NULL DEFAULT 'Belum' CHECK (rsvp_status IN ('Ya', 'Tidak', 'Belum')),
  attendance_status TEXT NOT NULL DEFAULT 'Belum' CHECK (attendance_status IN ('Hadir', 'Belum')),
  souvenir_status TEXT NOT NULL DEFAULT 'Pending' CHECK (souvenir_status IN ('Terima', 'Pending')),
  checked_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster name lookups
CREATE INDEX IF NOT EXISTS idx_guests_name ON guests(name);
CREATE INDEX IF NOT EXISTS idx_guests_attendance ON guests(attendance_status);

-- Create check_ins table for tracking check-in history
CREATE TABLE IF NOT EXISTS check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMPTZ DEFAULT NOW(),
  check_in_method TEXT CHECK (check_in_method IN ('qr_scan', 'manual', 'attendance_page')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for check-ins
CREATE INDEX IF NOT EXISTS idx_check_ins_guest ON check_ins(guest_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_time ON check_ins(checked_in_at DESC);

-- Enable Row Level Security (optional, for production)
-- ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust for production)
-- CREATE POLICY "Enable all operations for authenticated users" ON guests FOR ALL USING (true);
-- CREATE POLICY "Enable all operations for authenticated users" ON check_ins FOR ALL USING (true);
