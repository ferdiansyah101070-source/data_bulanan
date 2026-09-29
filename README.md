# Aplikasi Manajemen Keuangan

Aplikasi web untuk mengatur pemasukan dan pengeluaran bulanan dengan fitur lengkap.

## Fitur

- ✅ Catat pemasukan dan pengeluaran
- ✅ Input cepat tanpa modal
- ✅ Filter berdasarkan hari, bulan, dan tahun
- ✅ Dashboard dengan ringkasan keuangan
- ✅ CRUD lengkap (Create, Read, Update, Delete)
- ✅ Database SQLite (tidak perlu install MySQL)
- ✅ Responsive design dengan dark theme
- ✅ Notifikasi real-time

## Teknologi

- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Design**: Caustic-inspired dark theme

## Cara Install

### 1. Install Dependencies

```bash
cd finance-app
npm install
```

### 2. Jalankan Aplikasi

```bash
npm start
```

Atau untuk development dengan auto-reload:

```bash
npm run dev
```

### 3. Buka Browser

```
http://localhost:3000
```

Database SQLite (`finance.db`) akan dibuat otomatis dengan data contoh.

## API Endpoints

### Transactions

- `GET /api/transactions` - Get all transactions (dengan filter)
  - Query params: `year`, `month`, `day`, `type`
- `GET /api/transactions/:id` - Get transaction by ID
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Summary

- `GET /api/summary` - Get summary statistics
  - Query params: `year`, `month`

### Reports

- `GET /api/report/monthly` - Get monthly report
  - Query params: `year`

## Struktur File

```
finance-app/
├── public/
│   ├── index.html      # Frontend HTML
│   ├── style.css       # Styling (Caustic theme)
│   └── script.js       # JavaScript logic
├── server.js           # Express server + SQLite
├── finance.db          # SQLite database (auto-generated)
├── package.json        # Dependencies
└── README.md           # Documentation
```

## Fitur UI

### Input Cepat
Form input horizontal di atas tabel untuk entry cepat transaksi.

### Summary Cards
- Card pemasukan (biru)
- Card pengeluaran (amber)
- Card saldo (putih)

### Filter
- Filter by tahun
- Filter by bulan
- Filter by tipe transaksi

### Tabel Transaksi
- Sortir otomatis by tanggal (terbaru)
- Edit dan hapus per row
- Badge warna untuk tipe

## Hosting

### Hosting Gratis (Rekomendasi)

1. **Vercel/Netlify** - Frontend + Backend
   - Deploy langsung dari GitHub
   - SQLite database akan reset setiap deploy
   - Untuk production, gunakan PostgreSQL/MongoDB

2. **Railway.app** - Full stack
   - Support SQLite persistent
   - Deploy dari GitHub
   - Free tier tersedia

### Hosting Berbayar

1. **VPS**: DigitalOcean, Linode, AWS EC2
2. **Cloud**: Google Cloud, Azure, Heroku

## Tips Penggunaan

1. **Backup Database**: Copy file `finance.db` secara berkala
2. **Production**: Ganti SQLite dengan PostgreSQL/MySQL untuk production
3. **HTTPS**: Gunakan SSL certificate untuk production
4. **Monitoring**: Gunakan PM2 untuk production

## Keuntungan SQLite

- Tidak perlu install database server terpisah
- Database dalam 1 file (`finance.db`)
- Cukup untuk aplikasi personal/small team
- Mudah backup (copy paste file)
- Cepat untuk read operations

## Upgrade ke MySQL

Jika nanti mau upgrade ke MySQL:
1. Install MySQL Server
2. Ganti `better-sqlite3` dengan `mysql2` di package.json
3. Ubah kode di `server.js` untuk koneksi MySQL
4. Import `database.sql`

## License

MIT
