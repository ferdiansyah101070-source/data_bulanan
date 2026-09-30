# Quick Deploy Checklist

## Pre-Deploy
- [ ] Struktur folder benar (api/, public/, server.js)
- [ ] vercel.json ada dan routing benar
- [ ] .env.example ter-commit (jangan .env asli)
- [ ] Dependencies lengkap di package.json

## Deploy ke Vercel

### 1. Setup Database
```
Vercel Dashboard → Storage → Create Database → Postgres
Region: Singapore (untuk Indonesia)
```

### 2. Push ke GitHub
```bash
git add .
git commit -m "Ready for production"
git push origin main
```

### 3. Deploy
```
Vercel Dashboard → New Project → Import from GitHub
Framework: Other (auto-detect)
Deploy
```

### 4. Verify
- [ ] Open deployment URL
- [ ] Test tambah transaksi
- [ ] Test filter
- [ ] Test edit/delete
- [ ] Check summary cards update

## Common Issues

### 404 on /api/*
**Fix:** Check `api/index.js` exists and vercel.json routes correct

### 500 Database Error
**Fix:** Create Postgres database in Vercel Storage tab

### Static files not loading
**Fix:** Ensure `public/` folder committed to git

### CORS error
**Fix:** Already handled in server.js with `cors()` middleware

## Test Deployment
```bash
# Local test before deploy
npm run local           # SQLite
npm start               # Postgres (needs .env)
```

## Logs
```
Vercel Dashboard → Deployments → [Latest] → Function Logs
```

## Rollback
```
Vercel Dashboard → Deployments → [Previous] → Promote to Production
```
