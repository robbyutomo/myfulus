# MyFulus

Aplikasi web untuk mengelola budget, pemasukan, dan pengeluaran harian.

## Fitur

- **Autentikasi Multi-User**: Daftar dan login dengan email
- **Dashboard**: Ringkasan keuangan bulanan
- **Pencatatan Transaksi**: Catat pemasukan dan pengeluaran dengan kategori
- **Budget Bulanan**: Atur anggaran per kategori
- **Target Tabungan**: Tetapkan dan pantau target tabungan
- **Laporan Keuangan**: Grafik visual dan export CSV
- **Analisis Pola Belanja**: Insight tentang kebiasaan belanja

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Backend**: Next.js API Routes
- **Database**: Turso (libSQL) dengan Drizzle ORM
- **UI Components**: Custom components dengan Lucide icons
- **Charts**: Recharts

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Konfigurasi Database

Buat file `.env.local`:

```env
TURSO_DATABASE_URL="libsql://your-database-name.turso.io"
TURSO_AUTH_TOKEN="your-auth-token-here"
```

### 3. Jalankan Database Migration

```bash
npm run db:push
```

### 4. Jalankan Development Server

```bash
npm run dev
```

Buka http://localhost:3000

## Struktur Project

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── register/route.ts
│   │   │   ├── me/route.ts
│   │   │   └── logout/route.ts
│   │   ├── transactions/route.ts
│   │   ├── budgets/route.ts
│   │   ├── savings/route.ts
│   │   ├── categories/route.ts
│   │   ├── dashboard/route.ts
│   │   └── reports/route.ts
│   ├── dashboard/page.tsx
│   ├── transactions/page.tsx
│   ├── budgets/page.tsx
│   ├── savings/page.tsx
│   ├── reports/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── card.tsx
│   └── Providers.tsx
└── lib/
    ├── db/
    │   ├── schema.ts
    │   └── client.ts
    └── utils.ts
```

## Database Schema

- **users**: Data pengguna
- **categories**: Kategori transaksi (pemasukan/pengeluaran)
- **transactions**: Pencatatan transaksi
- **budgets**: Anggaran bulanan per kategori
- **savings_goals**: Target tabungan

## Scripts

- `npm run dev`: Jalankan development server
- `npm run build`: Build untuk production
- `npm run start`: Jalankan production server
- `npm run lint`: Jalankan ESLint
- `npm run db:push`: Push schema ke database
- `npm run db:generate`: Generate migration
- `npm run db:studio`: Buka Drizzle Studio

## Deployment

Deploy ke Vercel:

```bash
npx vercel deploy --prod
```

Pastikan environment variables sudah dikonfigurasi di Vercel.
