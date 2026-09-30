# Aplikasi Manajemen Keuangan

Aplikasi web untuk mengatur pemasukan dan pengeluaran bulanan dengan fitur lengkap.

## Demo

🚀 [Live Demo di Vercel](https://your-app.vercel.app)

## Fitur

- ✅ Input transaksi cepat
- ✅ Dashboard summary (Saldo, Pemasukan, Pengeluaran)
- ✅ Filter berdasarkan tahun, bulan, dan tipe
- ✅ CRUD lengkap (Create, Read, Update, Delete)
- ✅ Database Postgres (Vercel Postgres / Neon)
- ✅ Responsive dark theme design
- ✅ Notifikasi real-time

## Teknologi

- **Backend**: Node.js + Express
- **Database**: PostgreSQL (Vercel Postgres)
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Hosting**: Vercel (Serverless)
- **Design**: Caustic-inspired dark theme

## Quick Start (Local Development)

### 1. Clone & Install

```bash
git clone https://github.com/username/finance-app.git
cd finance-app
npm install
```

### 2. Setup Database

**Opsi A: Vercel Postgres (Recommended untuk production)**

1. Buat database di [Vercel Dashboard](https://vercel.com)
2. Copy environment variables ke `.env`
3. Jalankan aplikasi

**Opsi B: Local Postgres**

```bash
# Install PostgreSQL
# Create database
createdb finance_db

# Update .env
DATABASE_URL="postgresql://user:password@localhost:5432/finance_db"
```

### 3. Run

```bash
npm start
```

Buka: `http://localhost:3000`

## Deploy ke Vercel

### Method 1: Via GitHub (Recommended)

```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

Kemudian:
1. Login ke [Vercel](https://vercel.com)
2. Klik **New Project**
3. Import dari GitHub
4. Vercel auto-detect settings
5. **Setup Database**: Klik **Storage** > **Create** > **Postgres**
6. **Deploy**

### Method 2: Via Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
```

Ikuti prompts untuk setup database.

## Environment Variables

```bash
# .env
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."
POSTGRES_USER="default"
POSTGRES_HOST="xxx.postgres.vercel-storage.com"
POSTGRES_PASSWORD="xxx"
POSTGRES_DATABASE="verceldb"
```

## File Structure

```
finance-app/
├── public/              # Frontend
│   ├── index.html      # Main page
│   ├── style.css       # Styles
│   └── script.js       # Logic
├── server.js           # Express API
├── vercel.json         # Vercel config
├── package.json        # Dependencies
├── DEPLOY.md           # Deploy guide
└── README.md           # This file
```

## API Endpoints

### Transactions
- `GET /api/transactions` - Get all (filter: year, month, day, type)
- `GET /api/transactions/:id` - Get by ID
- `POST /api/transactions` - Create
- `PUT /api/transactions/:id` - Update
- `DELETE /api/transactions/:id` - Delete

### Summary
- `GET /api/summary` - Statistics (filter: year, month)
- `GET /api/report/monthly` - Monthly report (filter: year)

## Tech Stack Details

### Frontend
- Vanilla JavaScript (no framework)
- CSS Grid & Flexbox
- Fetch API
- Dark theme with glassmorphism

### Backend
- Express.js (serverless functions)
- Vercel Postgres (@vercel/postgres)
- CORS enabled
- RESTful API

### Database Schema

```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) CHECK(type IN ('pemasukan', 'pengeluaran')),
  amount DECIMAL(15, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Troubleshooting

### Error 500 di Vercel
- Pastikan database sudah dibuat di Vercel Dashboard
- Check environment variables sudah tersetting
- Lihat logs di Vercel Dashboard > Deployments > Logs

### Database connection error
- Verify environment variables
- Check database status di Vercel Storage tab
- Restart deployment

### UI tidak muncul
- Hard refresh (Ctrl+F5)
- Check browser console (F12)
- Verify API endpoint di Network tab

## Development Tips

1. **Testing local**: Gunakan PostgreSQL local atau copy env vars dari Vercel
2. **Debugging**: Check Vercel logs untuk server errors
3. **Database**: Backup data sebelum migration
4. **Performance**: Vercel auto-scales, no config needed

## Free Tier Limits

Vercel Free:
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Serverless functions
- ✅ SSL/HTTPS

Vercel Postgres Free:
- ✅ 256 MB storage
- ✅ 60 hours compute/month
- ⚠️ Note: Vercel Postgres deprecated, migrate to Neon recommended

## Migration ke Neon (Optional)

Jika mau migrate dari Vercel Postgres ke Neon:

1. Export data dari Vercel Postgres
2. Buat database baru di [Neon](https://neon.tech)
3. Update connection string di environment variables
4. Import data ke Neon
5. Redeploy

Guide lengkap: [Neon Migration Guide](https://neon.com/docs/guides/vercel-postgres-transition-guide)

## License

MIT

## Support

Jika ada pertanyaan atau issue:
1. Check DEPLOY.md untuk panduan lengkap
2. Buka issue di GitHub
3. Check Vercel documentation

---

**Made with ❤️ using Vercel + PostgreSQL**
