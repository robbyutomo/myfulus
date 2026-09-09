# MyFulus - Anti-AI Slop UI Guidelines

## Visual Direction: Financial Dashboard

Berdasarkan `references/visual_directions.md`, MyFulus menggunakan arah **Financial Dashboard** karena ini adalah aplikasi keuangan/budgeting.

### Mood
- **Precise, sober, high-trust, data-first**
- Fokus pada kejelasan data, bukan dekorasi
- Membangun kepercayaan melalui presisi dan konsistensi

### Palette yang Disarankan
```
Base:      #111827 (gray-900) atau #f9fafb (gray-50)
Surface:   #1f2937 (gray-800) atau #ffffff (white)
Border:    #374151 (gray-700) atau #e5e7eb (gray-200)

Primary:   #059669 (emerald-600) - untuk positive/income
Secondary: #6366f1 (indigo-500) - untuk accent netral
Negative:  #dc2626 (red-600) - untuk expense/alert
Warning:   #d97706 (amber-500) - untuk warning/budget hampir habis

Text:      #111827 (gray-900) atau #f9fafb (gray-50)
Muted:     #6b7280 (gray-500)
```

### Typography
- **Tabular numbers** untuk angka/nilai uang
- **Mono font** untuk ID transaksi (opsional)
- **Clear hierarchy**: Display > Heading > Body > Label > Caption
- **Hindari**: Inter sebagai default, gradient text, font display yang terlalu besar

### Layout Strategy: Dense Dashboard
```
┌─────────────────────────────────────────┐
│  KPI Strip (Total Income/Expense/Balance)│
├─────────────────────────────────────────┤
│  Filters (Bulan/Tahun/Kategori)         │
├─────────────────────────────────────────┤
│  Chart + Table (Side by side)           │
├─────────────────────────────────────────┤
│  Transaction List (Dense, scannable)    │
├─────────────────────────────────────────┤
│  Quick Actions (Add Transaction, etc)   │
└─────────────────────────────────────────┘
```

### Component Density
- **Cards**: Minimal padding, border subtle, tidak ada shadow berlebihan
- **Tables**: Dense rows, clear cell hierarchy, alternating subtle bg
- **Buttons**: Compact, icon + label, tidak ada rounded-2xl berlebihan
- **Forms**: Inline labels, compact spacing, clear validation states

## Anti-Slop Rules untuk MyFulus

### ❌ DILARANG (Slop Patterns)
1. **Purple/Indigo gradient** - Gunakan emerald untuk income, red untuk expense
2. **Gradient text** - Gunakan solid colors dengan hierarchy
3. **Emoji icons** - Gunakan Lucide icons yang konsisten
4. **rounded-2xl everywhere** - Variasi radius berdasarkan component role
5. **Hover animation pada semua card** - Hanya pada interactive elements
6. **Empty whitespace sebagai fake premium** - Gunakan space untuk hierarchy
7. **Hero + 3 cards + CTA** - Gunakan dense dashboard layout
8. **Glassmorphism** - Gunakan solid backgrounds dengan subtle borders
9. **Neon glow** - Gunakan subtle shadows untuk elevation
10. **Generic SaaS copy** - Gunakan Bahasa Indonesia yang spesifik

### ✅ DO (Best Practices)
1. **Data-first design** - Angka/nilai uang harus prominent
2. **Clear visual hierarchy** - KPI > Chart > Table > Actions
3. **Semantic colors** - Green = positive, Red = negative, Amber = warning
4. **Tabular numbers** - Untuk semua nilai uang
5. **Dense information** - Tampilkan banyak data tanpa overwhelming
6. **Platform-native feel** - Seperti aplikasi keuangan native
7. **Functional motion** - Hanya untuk state changes dan loading
8. **Accessibility** - Clear focus states, sufficient contrast
9. **Responsive** - Mobile-first, tablet-friendly
10. **Consistent spacing** - Gunakan spacing scale yang konsisten

## Design Tokens

### Spacing Scale
```
--space-1: 0.25rem  (4px)
--space-2: 0.5rem   (8px)
--space-3: 0.75rem  (12px)
--space-4: 1rem     (16px)
--space-5: 1.25rem  (20px)
--space-6: 1.5rem   (24px)
--space-8: 2rem     (32px)
--space-10: 2.5rem  (40px)
--space-12: 3rem    (48px)
```

### Border Radius
```
--radius-sm: 0.25rem  (4px)  - buttons, inputs
--radius-md: 0.375rem (6px)  - cards, containers
--radius-lg: 0.5rem   (8px)  - modals, dropdowns
--radius-none: 0      - tables, dense data
```

### Shadows/Elevation
```
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1)
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1)
```

### Typography Scale
```
--text-xs: 0.75rem   (12px) - captions, labels
--text-sm: 0.875rem  (14px) - body, secondary
--text-base: 1rem    (16px) - primary body
--text-lg: 1.125rem  (18px) - subheadings
--text-xl: 1.25rem   (20px) - headings
--text-2xl: 1.5rem   (24px) - section titles
--text-3xl: 1.875rem (30px) - KPI values
```

## Component Guidelines

### Cards
```tsx
// ❌ BAD: AI Slop
<Card className="rounded-2xl shadow-xl bg-gradient-to-br from-purple-500 to-blue-500">

// ✅ GOOD: MyFulus Style
<Card className="rounded-md border border-gray-200 bg-white">
```

### Buttons
```tsx
// ❌ BAD: AI Slop
<Button className="rounded-full px-8 py-3 text-lg font-bold gradient-bg">

// ✅ GOOD: MyFulus Style
<Button className="rounded-md px-4 py-2 text-sm font-medium">
  <Icon className="w-4 h-4 mr-2" />
  Label
</Button>
```

### Tables
```tsx
// ❌ BAD: AI Slop
<div className="rounded-2xl overflow-hidden shadow-lg">
  <table className="w-full">

// ✅ GOOD: MyFulus Style
<div className="rounded-md border border-gray-200 overflow-hidden">
  <table className="w-full text-sm">
```

## AI Slop Score Checklist

Sebelum ship UI, pastikan:

- [ ] Tidak ada purple/indigo gradient tanpa alasan brand
- [ ] Tidak ada gradient text
- [ ] Tidak ada emoji sebagai icon
- [ ] Tidak ada rounded-2xl pada semua komponen
- [ ] Tidak ada hover animation pada semua card
- [ ] Tidak ada empty whitespace sebagai fake premium
- [ ] Tidak ada hero + 3 cards + CTA structure
- [ ] Tidak ada glassmorphism tanpa tujuan
- [ ] Tidak ada neon glow tanpa tujuan
- [ ] Inter tidak digunakan hanya karena default
- [ ] Layout dense dan information-rich
- [ ] Semantic colors untuk positive/negative
- [ ] Tabular numbers untuk angka
- [ ] Clear visual hierarchy

## References

- `references/anti_slop_patterns.md` - Pola yang harus dihindari
- `references/visual_directions.md` - Arah visual yang tersedia
- `references/layout_patterns.md` - Pola layout alternatif
- `references/typography_guidance.md` - Panduan tipografi
- `references/motion_rules.md` - Aturan motion/animasi

## Implementation Checklist

Saat implementasi UI baru:

1. **Tentukan visual direction** - Pilih dari `visual_directions.md`
2. **Definisikan design tokens** - Palette, typography, spacing
3. **Pilih layout pattern** - Dari `layout_patterns.md`
4. **Implementasikan components** - Ikuti guidelines di atas
5. **Jalankan AI Slop Score** - Cek semua item
6. **Revise jika perlu** - Perbaiki yang masih slop
7. **Test responsive** - Mobile, tablet, desktop
8. **Accessibility check** - Focus states, contrast, screen reader
