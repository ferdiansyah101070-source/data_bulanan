CREATE DATABASE IF NOT EXISTS finance_db;
USE finance_db;

CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('pemasukan', 'pengeluaran') NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_transaction_date ON transactions(transaction_date);
CREATE INDEX idx_type ON transactions(type);

-- Data contoh
INSERT INTO transactions (type, amount, category, description, transaction_date) VALUES
('pemasukan', 5000000, 'Gaji', 'Gaji bulanan', '2026-09-25'),
('pengeluaran', 500000, 'Makanan', 'Belanja bulanan', '2026-09-26'),
('pengeluaran', 200000, 'Transport', 'Bensin', '2026-09-27'),
('pemasukan', 1000000, 'Bonus', 'Bonus proyek', '2026-09-28');
