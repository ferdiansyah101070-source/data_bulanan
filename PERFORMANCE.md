# Optimasi Performa Vercel

## Masalah: Loading Lambat di Vercel

### Penyebab
1. **Cold Start** - Function sleep setelah tidak dipakai
2. **Database Query** - Tidak ada index atau query tidak optimal
3. **No Caching** - Setiap request hit database
4. **Large Response** - Fetch semua data tanpa limit

### Solusi yang Sudah Diterapkan

#### 1. Database Optimization
```sql
-- Index untuk speed up query
CREATE INDEX idx_transaction_date ON transactions(transaction_date DESC);
CREATE INDEX idx_type ON transactions(type);
CREATE INDEX idx_date_type ON transactions(transaction_date DESC, type);
```

#### 2. Query Limit
```js
// Tambah LIMIT untuk transactions list
query += ' ORDER BY transaction_date DESC, created_at DESC LIMIT 100';
```

#### 3. Lazy Database Init
```js
let dbInitialized = false;

async function initDatabase() {
  if (dbInitialized) return; // Skip jika sudah init
  // ... init code
  dbInitialized = true;
}

// Setiap endpoint call initDatabase()
app.get('/api/transactions', async (req, res) => {
  await initDatabase(); // Auto-init on first request
  // ... rest of code
});
```

#### 4. Static File Caching
```json
// vercel.json
{
  "headers": [{
    "source": "/(.*\\.(css|js|html|png|jpg|svg|ico))",
    "headers": [{
      "key": "Cache-Control",
      "value": "public, max-age=86400"
    }]
  }]
}
```

#### 5. Loading State di Frontend
```js
// Show loading sebelum fetch
document.getElementById('saldo').textContent = '...';

// Fetch data
const response = await fetch(url);

// Update dengan data real
document.getElementById('saldo').textContent = formatCurrency(summary.saldo);
```

## Tips Tambahan

### Untuk Cold Start
1. **Warm-up ping**: Set cron job ping `/api/summary` setiap 5 menit
2. **Upgrade plan**: Vercel Pro tidak sleep (expensive)

### Alternative Database (Lebih Cepat)
1. **Neon** - Free tier, auto-scale, 512MB
   - Setup: https://neon.tech
   - Connection pooling built-in
   
2. **Supabase** - Free tier, realtime
   - Setup: https://supabase.com
   - REST API + realtime subscriptions

3. **PlanetScale** - MySQL, free tier
   - Setup: https://planetscale.com
   - Branching database

### Frontend Optimization
```js
// Parallel fetch untuk speed
await Promise.all([
  loadTransactions(),
  loadSummary()
]);

// Debounce filter
let filterTimeout;
function applyFilters() {
  clearTimeout(filterTimeout);
  filterTimeout = setTimeout(() => {
    loadTransactions();
    loadSummary();
  }, 300);
}
```

## Expected Performance

### Before Optimization
- First load: 3-5 detik (cold start)
- Subsequent: 1-2 detik

### After Optimization
- First load: 1-2 detik
- Subsequent: 300-500ms
- Cached static: <100ms

## Monitoring

Check Vercel logs untuk bottleneck:
```
Dashboard → Deployments → [Latest] → Functions → Runtime Logs
```

Metrics to watch:
- **Duration**: <1000ms ideal
- **Memory**: <100MB ideal
- **Cold Boot**: <500ms ideal

## Deploy

Setelah semua optimasi, commit dan push:
```bash
git add .
git commit -m "Optimize Vercel performance: indexes, caching, lazy init"
git push origin main
```

Vercel auto-deploy dan apply optimasi.
