# Panduan Deploy Aplikasi Manajemen Keuangan

## Testing Lokal

### Opsi 1: SQLite (Simple, Tanpa Setup Database)

```bash
npm install
npm run local
```

Buka browser: `http://localhost:3000`

Database SQLite otomatis dibuat di file `finance.db`

### Opsi 2: Vercel Postgres (Production-like)

1. Buat database di Vercel Dashboard
2. Copy environment variables ke `.env`:
```bash
cp .env.example .env
# Edit .env, paste credentials dari Vercel
```

3. Jalankan:
```bash
npm start
```

---

## Deploy ke Vercel (Production)

### Step 1: Buat Database

1. Login ke [Vercel](https://vercel.com)
2. Klik **Storage** > **Create Database**
3. Pilih **Postgres**
4. Pilih region terdekat (Singapore untuk Indonesia)
5. Klik **Create**

Vercel otomatis set environment variables.

### Step 2: Deploy

**Cara A: Via GitHub (Recommended)**

```bash
# Push ke GitHub
git init
git add .
git commit -m "Initial commit: Finance app"
git branch -M main
git remote add origin https://github.com/username/finance-app.git
git push -u origin main
```

Di Vercel:
1. **Add New Project**
2. Import repository dari GitHub
3. Vercel auto-detect settings
4. **Deploy**

**Cara B: Via Vercel CLI**

```bash
npm i -g vercel
vercel login
vercel --prod
```

### Step 3: Test

Buka URL deployment: `https://your-app.vercel.app`

---

## Struktur Project

```
finance-app/
├── public/              # Frontend (Vanilla JS)
│   ├── index.html      # UI
│   ├── style.css       # Styling
│   └── script.js       # Logic
├── server.js           # API (Vercel Postgres)
├── server-sqlite.js    # API (SQLite untuk lokal)
├── vercel.json         # Vercel config
├── package.json        # Dependencies
├── finance.db          # SQLite database (lokal)
├── .env.example        # Template environment vars
└── DEPLOY.md           # Ini file
```

---

## Environment Variables

Untuk production (Vercel Postgres), otomatis di-set Vercel:
```
POSTGRES_URL
POSTGRES_PRISMA_URL
POSTGRES_URL_NON_POOLING
POSTGRES_USER
POSTGRES_HOST
POSTGRES_PASSWORD
POSTGRES_DATABASE
```

Untuk local development dengan Postgres, copy dari Vercel ke `.env`

---

## Troubleshooting

### Error 404 di Vercel (API not found)
**Penyebab:** Routing salah atau struktur folder tidak sesuai

**Solusi:**
1. Pastikan struktur folder:
   ```
   finance-app/
   ├── api/
   │   └── index.js        # Entry point untuk API
   ├── public/
   │   ├── index.html
   │   ├── style.css
   │   └── script.js
   ├── server.js           # Express app
   └── vercel.json         # Config routing
   ```

2. File `api/index.js` harus ada:
   ```js
   const app = require('../server.js');
   module.exports = app;
   ```

3. Vercel.json routing:
   - `/api/*` → `api/index.js`
   - Static files → `public/*`
   - Root → `public/index.html`

### Error 500 di Vercel (Database error)
**Penyebab:** Environment variables tidak tersetting atau database belum dibuat

**Solusi:**
1. Buat Vercel Postgres di Dashboard > Storage
2. Environment variables auto-inject, cek di Settings > Environment Variables
3. Redeploy setelah database created
4. Check logs: Deployments > Function Logs

**Alternative:** Pakai Neon atau Supabase (free tier lebih besar)

### Server lokal error "ENOENT sql-wasm.wasm"
✅ Fixed: Hapus locateFile config di server-sqlite.js

### Database kosong setelah deploy
- Check Vercel logs: Dashboard > Deployments > Logs
- Database auto-create saat first request
- Sample data otomatis di-insert jika table kosong

### CORS error di production
Tambah di server.js:
```js
app.use(cors({
  origin: ['https://your-app.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
```

### Static files 404
- Pastikan `public/` folder ter-commit ke git
- Check vercel.json build config
- Cek File Structure di Vercel Dashboard

### UI tidak muncul
- Hard refresh: Ctrl+F5
- Check browser console (F12)
- Check Network tab untuk API errors
- Verify `public/index.html` accessible

---

## Free Tier Limits

**Vercel Free:**
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Serverless functions (12s timeout)
- ✅ Custom domain + SSL

**Vercel Postgres Free:**
- ✅ 256 MB storage
- ✅ 60 hours compute/month
- ⚠️ **Note**: Vercel Postgres deprecated, bisa migrate ke Neon

**Alternatif Database (Free):**
1. **Neon** - 512MB free, recommended
2. **Supabase** - 500MB free + realtime
3. **Railway** - $5 credit/month

---

## Migration ke Neon (Optional)

Jika mau migrate dari Vercel Postgres:

1. Buat database di [Neon](https://neon.tech)
2. Export data dari Vercel Postgres
3. Update `POSTGRES_URL` di Vercel env vars
4. Import data ke Neon
5. Redeploy

Guide: [Neon Migration](https://neon.com/docs/guides/vercel-postgres-transition-guide)

---

## Production Checklist

- [ ] Database created & connected
- [ ] Environment variables set
- [ ] Code pushed ke GitHub
- [ ] Deployed ke Vercel
- [ ] Test semua fitur (CRUD, filter, summary)
- [ ] Custom domain (optional)
- [ ] Setup backup (optional)

---

## API Endpoints

```
GET    /api/transactions              # List transaksi (filter: year, month, type)
GET    /api/transactions/:id          # Detail transaksi
POST   /api/transactions              # Create transaksi
PUT    /api/transactions/:id          # Update transaksi
DELETE /api/transactions/:id          # Delete transaksi
GET    /api/summary                   # Summary (filter: year, month)
GET    /api/report/monthly            # Laporan bulanan (filter: year)
```

---

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (Vanilla, no framework)
- **Backend**: Node.js + Express (Serverless)
- **Database**: PostgreSQL (Vercel) / SQLite (lokal)
- **Hosting**: Vercel
- **Design**: Dark theme with glassmorphism

---

**Buat Pertama Kali:** 2026-09-29  
**Status:** ✅ Ready to deploy
