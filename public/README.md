# Aplikasi Pencatat Keuangan Bulanan

Aplikasi web untuk mencatat pemasukan dan pengeluaran dengan fitur lengkap hari, bulan, dan tahun.

## Fitur

- ✅ Tambah transaksi pemasukan/pengeluaran
- ✅ Kategori transaksi
- ✅ Filter berdasarkan bulan dan tahun
- ✅ Ringkasan total pemasukan, pengeluaran, dan saldo
- ✅ Penyimpanan lokal (LocalStorage)
- ✅ Responsive design
- ✅ Format mata uang Rupiah

## Cara Install & Run Lokal

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build untuk production
npm run build
```

## Deploy ke Vercel

### Opsi 1: Via Dashboard Vercel
1. Push kode ke GitHub
2. Buka https://vercel.com
3. Import repository
4. Deploy otomatis

### Opsi 2: Via Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## Teknologi

- React 18
- Vite
- LocalStorage (database client-side)
- CSS modern dengan gradients

## Catatan

Aplikasi ini menggunakan LocalStorage untuk menyimpan data transaksi. Data tersimpan di browser pengguna dan tidak memerlukan backend server atau database eksternal. Cocok untuk penggunaan personal.
