# Wedding Guestbook & Management Dashboard

A modern, real-time wedding guest management system with QR code check-in functionality built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

### ✨ Core Features
- 📱 **QR Code Check-in** - Scan QR codes to automatically check in guests
- 👥 **Guest Management** - Track RSVPs, attendance, and souvenir distribution
- 📊 **Real-time Dashboard** - Live statistics and metrics
- 🔄 **Real-time Updates** - Automatic UI updates across all pages
- 📋 **Attendance Tracking** - Manual and automated check-in options
- 🎁 **Souvenir Management** - Track gift distribution

### 🎯 Check-in Methods
1. **QR Scanner** - Camera-based QR code scanning
2. **Manual Search** - Search and check in by guest name
3. **Attendance Page** - Click "Hadir" button directly from guest list

### 📄 Pages
- `/` - Dashboard with metrics and statistics
- `/guests` - Guest list management
- `/attendance` - Attendance tracking with manual check-in
- `/check-in` - QR scanner and check-in interface
- `/souvenir` - Souvenir distribution tracking
- `/rsvp` - RSVP management
- `/login` - Authentication (mock)

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (Strict mode)
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui + Lucide React icons
- **Database:** Supabase (PostgreSQL)
- **Real-time:** Supabase Realtime
- **QR Scanner:** @zxing/library

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Supabase

Follow the detailed setup guide in [SETUP.md](./SETUP.md)

Quick steps:
1. Create a Supabase project
2. Run `supabase-schema.sql` in SQL Editor
3. Copy your project URL and anon key

### 3. Configure Environment

Create/edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## QR Code Format

The system expects QR codes with URLs in this format:

```
https://invitingart.id/ayubi-arkan/?to=Guest Name
```

The `?to=` parameter should contain the exact guest name (case-insensitive).

### Example QR URLs:
- `https://invitingart.id/ayubi-arkan/?to=Arizal Arkan`
- `https://invitingart.id/ayubi-arkan/?to=Budi Santoso`

## Database Schema

### Tables

**guests**
- Guest information (name, phone, category, table assignment)
- RSVP status (Ya, Tidak, Belum)
- Attendance status (Hadir, Belum)
- Souvenir status (Terima, Pending)
- Check-in timestamp

**check_ins**
- Check-in history log
- Tracks method (qr_scan, manual, attendance_page)
- Links to guest records

See `supabase-schema.sql` for full schema.

## Project Structure

```
src/
├── app/
│   ├── actions/
│   │   └── check-in.ts          # Server actions for check-in
│   ├── attendance/
│   │   └── page.tsx             # Attendance tracking page
│   ├── check-in/
│   │   └── page.tsx             # QR scanner page
│   ├── guests/
│   │   └── page.tsx             # Guest management
│   ├── souvenir/
│   │   └── page.tsx             # Souvenir tracking
│   ├── layout.tsx               # Root layout with sidebar
│   └── page.tsx                 # Dashboard
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx          # Navigation sidebar
│   │   └── topbar.tsx           # Top navigation bar
│   ├── table/
│   │   └── data-table.tsx       # Reusable data table
│   ├── ui/                      # shadcn/ui components
│   └── qr-scanner.tsx           # QR code scanner component
└── lib/
    ├── mockData.ts              # Sample data for testing
    ├── supabase.ts              # Supabase client
    └── utils.ts                 # Utility functions
```

## Development

### Adding New Guests

Via Supabase SQL Editor:

```sql
INSERT INTO guests (name, phone, category, table_no, rsvp_status)
VALUES ('John Doe', '081234567890', 'VIP', 'A1', 'Ya');
```

### Testing Check-in

1. Add guests to database
2. Generate QR codes with format: `https://invitingart.id/ayubi-arkan/?to=John Doe`
3. Scan QR code on `/check-in` page
4. Verify real-time update on `/attendance` page

## Deployment

### Vercel (Recommended)

```bash
vercel
```

Make sure to add environment variables in Vercel dashboard.

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_key
```

## Troubleshooting

See [SETUP.md](./SETUP.md#troubleshooting) for common issues and solutions.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
