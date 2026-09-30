const express = require('express');
const { sql } = require('@vercel/postgres');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Cache untuk mempercepat response
let dbInitialized = false;

// Initialize database (lazy init)
async function initDatabase() {
  if (dbInitialized) return;
  
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        type VARCHAR(20) NOT NULL CHECK(type IN ('pemasukan', 'pengeluaran')),
        amount DECIMAL(15, 2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        transaction_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_transaction_date ON transactions(transaction_date DESC);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_type ON transactions(type);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_date_type ON transactions(transaction_date DESC, type);
    `;

    // Check if table is empty and insert sample data
    const result = await sql`SELECT COUNT(*) as count FROM transactions`;
    const count = parseInt(result.rows[0].count);
    
    if (count === 0) {
      await sql`
        INSERT INTO transactions (type, amount, category, description, transaction_date) 
        VALUES 
          ('pemasukan', 5000000, 'Gaji', 'Gaji bulanan', '2026-09-25'),
          ('pengeluaran', 500000, 'Makanan', 'Belanja bulanan', '2026-09-26'),
          ('pengeluaran', 200000, 'Transport', 'Bensin', '2026-09-27'),
          ('pemasukan', 1000000, 'Bonus', 'Bonus proyek', '2026-09-28')
      `;
      console.log('Sample data inserted');
    }

    dbInitialized = true;
    console.log('Database initialized');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}

// Routes

// Get all transactions with filters
app.get('/api/transactions', async (req, res) => {
  await initDatabase();
  
  try {
    const { year, month, day, type } = req.query;
    
    let query = 'SELECT * FROM transactions WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (year) {
      query += ` AND EXTRACT(YEAR FROM transaction_date) = $${paramCount}`;
      params.push(year);
      paramCount++;
    }
    if (month) {
      query += ` AND EXTRACT(MONTH FROM transaction_date) = $${paramCount}`;
      params.push(parseInt(month));
      paramCount++;
    }
    if (day) {
      query += ` AND EXTRACT(DAY FROM transaction_date) = $${paramCount}`;
      params.push(parseInt(day));
      paramCount++;
    }
    if (type) {
      query += ` AND type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }

    query += ' ORDER BY transaction_date DESC, created_at DESC LIMIT 100';

    const result = await sql.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get transaction by ID
app.get('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await sql`SELECT * FROM transactions WHERE id = ${id}`;
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching transaction:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create transaction
app.post('/api/transactions', async (req, res) => {
  try {
    const { type, amount, category, description, transaction_date } = req.body;

    if (!type || !amount || !category || !transaction_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await sql`
      INSERT INTO transactions (type, amount, category, description, transaction_date) 
      VALUES (${type}, ${amount}, ${category}, ${description || null}, ${transaction_date})
      RETURNING id
    `;
    
    res.status(201).json({ 
      id: result.rows[0].id, 
      message: 'Transaction created successfully' 
    });
  } catch (err) {
    console.error('Error creating transaction:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update transaction
app.put('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { type, amount, category, description, transaction_date } = req.body;

    const result = await sql`
      UPDATE transactions 
      SET type = ${type}, 
          amount = ${amount}, 
          category = ${category}, 
          description = ${description || null}, 
          transaction_date = ${transaction_date}, 
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${id}
      RETURNING id
    `;
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json({ message: 'Transaction updated successfully' });
  } catch (err) {
    console.error('Error updating transaction:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete transaction
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await sql`DELETE FROM transactions WHERE id = ${id} RETURNING id`;
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    console.error('Error deleting transaction:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get summary statistics
app.get('/api/summary', async (req, res) => {
  await initDatabase();
  
  try {
    const { year, month } = req.query;
    
    let query = `
      SELECT 
        type,
        SUM(amount) as total,
        COUNT(*) as count
      FROM transactions
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (year) {
      query += ` AND EXTRACT(YEAR FROM transaction_date) = $${paramCount}`;
      params.push(year);
      paramCount++;
    }
    if (month) {
      query += ` AND EXTRACT(MONTH FROM transaction_date) = $${paramCount}`;
      params.push(parseInt(month));
      paramCount++;
    }

    query += ' GROUP BY type';

    const result = await sql.query(query, params);
    
    const summary = {
      pemasukan: { total: 0, count: 0 },
      pengeluaran: { total: 0, count: 0 },
      saldo: 0
    };

    result.rows.forEach(row => {
      if (row.type === 'pemasukan') {
        summary.pemasukan.total = parseFloat(row.total);
        summary.pemasukan.count = parseInt(row.count);
        summary.saldo += parseFloat(row.total);
      } else if (row.type === 'pengeluaran') {
        summary.pengeluaran.total = parseFloat(row.total);
        summary.pengeluaran.count = parseInt(row.count);
        summary.saldo -= parseFloat(row.total);
      }
    });

    res.json(summary);
  } catch (err) {
    console.error('Error fetching summary:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get monthly report
app.get('/api/report/monthly', async (req, res) => {
  try {
    const { year } = req.query;
    
    let query = `
      SELECT 
        EXTRACT(MONTH FROM transaction_date) as month,
        type,
        SUM(amount) as total
      FROM transactions
    `;
    const params = [];

    if (year) {
      query += ` WHERE EXTRACT(YEAR FROM transaction_date) = $1`;
      params.push(year);
    }

    query += ` GROUP BY EXTRACT(MONTH FROM transaction_date), type ORDER BY month`;

    const result = await sql.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching monthly report:', err);
    res.status(500).json({ error: err.message });
  }
});

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize database before starting server
if (process.env.VERCEL) {
  // On Vercel, init database on first request
  initDatabase().catch(console.error);
} else {
  // Local development
  initDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }).catch(console.error);
}

// Export for Vercel
module.exports = app;
