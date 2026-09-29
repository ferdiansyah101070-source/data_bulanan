const express = require('express');
const initSqlJs = require('sql.js');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

let db;
const DB_FILE = 'finance.db';

// Initialize database
async function initDatabase() {
  const SQL = await initSqlJs();
  
  try {
    if (fs.existsSync(DB_FILE)) {
      const buffer = fs.readFileSync(DB_FILE);
      db = new SQL.Database(buffer);
      console.log('Database loaded from file');
    } else {
      db = new SQL.Database();
      console.log('New database created');
    }
  } catch (err) {
    db = new SQL.Database();
    console.log('Created new database due to error:', err.message);
  }

  // Create table
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('pemasukan', 'pengeluaran')),
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      transaction_date TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_transaction_date ON transactions(transaction_date);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_type ON transactions(type);`);

  // Insert sample data if table is empty
  const result = db.exec('SELECT COUNT(*) as count FROM transactions');
  const count = result.length > 0 ? result[0].values[0][0] : 0;
  
  if (count === 0) {
    db.run(`
      INSERT INTO transactions (type, amount, category, description, transaction_date) 
      VALUES 
        ('pemasukan', 5000000, 'Gaji', 'Gaji bulanan', '2026-09-25'),
        ('pengeluaran', 500000, 'Makanan', 'Belanja bulanan', '2026-09-26'),
        ('pengeluaran', 200000, 'Transport', 'Bensin', '2026-09-27'),
        ('pemasukan', 1000000, 'Bonus', 'Bonus proyek', '2026-09-28')
    `);
    saveDatabase();
    console.log('Sample data inserted');
  }

  console.log('Database initialized');
}

// Save database to file
function saveDatabase() {
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

// Helper to convert SQL.js result to objects
function resultToObjects(result) {
  if (!result || result.length === 0) return [];
  const columns = result[0].columns;
  const values = result[0].values;
  return values.map(row => {
    const obj = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return obj;
  });
}

// Routes

// Get all transactions with filters
app.get('/api/transactions', (req, res) => {
  try {
    const { year, month, day, type } = req.query;
    
    let query = 'SELECT * FROM transactions WHERE 1=1';
    const params = {};

    if (year) {
      query += ` AND strftime('%Y', transaction_date) = $year`;
      params.$year = year;
    }
    if (month) {
      query += ` AND strftime('%m', transaction_date) = $month`;
      params.$month = month.padStart(2, '0');
    }
    if (day) {
      query += ` AND strftime('%d', transaction_date) = $day`;
      params.$day = day.padStart(2, '0');
    }
    if (type) {
      query += ' AND type = $type';
      params.$type = type;
    }

    query += ' ORDER BY transaction_date DESC, created_at DESC';

    const result = db.exec(query, params);
    const transactions = resultToObjects(result);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get transaction by ID
app.get('/api/transactions/:id', (req, res) => {
  try {
    const { id } = req.params;
    const result = db.exec('SELECT * FROM transactions WHERE id = $id', { $id: id });
    const transactions = resultToObjects(result);
    
    if (transactions.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(transactions[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create transaction
app.post('/api/transactions', (req, res) => {
  try {
    const { type, amount, category, description, transaction_date } = req.body;

    if (!type || !amount || !category || !transaction_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    db.run(`
      INSERT INTO transactions (type, amount, category, description, transaction_date) 
      VALUES ($type, $amount, $category, $description, $date)
    `, {
      $type: type,
      $amount: amount,
      $category: category,
      $description: description || null,
      $date: transaction_date
    });

    const result = db.exec('SELECT last_insert_rowid() as id');
    const id = result[0].values[0][0];
    
    saveDatabase();
    res.status(201).json({ 
      id: id, 
      message: 'Transaction created successfully' 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update transaction
app.put('/api/transactions/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { type, amount, category, description, transaction_date } = req.body;

    db.run(`
      UPDATE transactions 
      SET type = $type, amount = $amount, category = $category, 
          description = $description, transaction_date = $date, 
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = $id
    `, {
      $type: type,
      $amount: amount,
      $category: category,
      $description: description || null,
      $date: transaction_date,
      $id: id
    });
    
    saveDatabase();
    res.json({ message: 'Transaction updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete transaction
app.delete('/api/transactions/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.run('DELETE FROM transactions WHERE id = $id', { $id: id });
    
    saveDatabase();
    res.json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get summary statistics
app.get('/api/summary', (req, res) => {
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
    const params = {};

    if (year) {
      query += ` AND strftime('%Y', transaction_date) = $year`;
      params.$year = year;
    }
    if (month) {
      query += ` AND strftime('%m', transaction_date) = $month`;
      params.$month = month.padStart(2, '0');
    }

    query += ' GROUP BY type';

    const result = db.exec(query, params);
    const rows = resultToObjects(result);
    
    const summary = {
      pemasukan: { total: 0, count: 0 },
      pengeluaran: { total: 0, count: 0 },
      saldo: 0
    };

    rows.forEach(row => {
      if (row.type === 'pemasukan') {
        summary.pemasukan.total = parseFloat(row.total);
        summary.pemasukan.count = row.count;
        summary.saldo += parseFloat(row.total);
      } else if (row.type === 'pengeluaran') {
        summary.pengeluaran.total = parseFloat(row.total);
        summary.pengeluaran.count = row.count;
        summary.saldo -= parseFloat(row.total);
      }
    });

    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get monthly report
app.get('/api/report/monthly', (req, res) => {
  try {
    const { year } = req.query;
    
    let query = `
      SELECT 
        strftime('%m', transaction_date) as month,
        type,
        SUM(amount) as total
      FROM transactions
    `;
    const params = {};

    if (year) {
      query += ` WHERE strftime('%Y', transaction_date) = $year`;
      params.$year = year;
    }

    query += ` GROUP BY strftime('%m', transaction_date), type ORDER BY month`;

    const result = db.exec(query, params);
    const rows = resultToObjects(result);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  saveDatabase();
  console.log('\nDatabase saved. Shutting down...');
  process.exit(0);
});
