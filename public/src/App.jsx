import { useState, useEffect } from 'react'

function App() {
  const [transactions, setTransactions] = useState([])
  const [formData, setFormData] = useState({
    type: 'income',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [filter, setFilter] = useState({
    type: 'all',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  })

  useEffect(() => {
    const saved = localStorage.getItem('transactions')
    if (saved) {
      setTransactions(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions))
  }, [transactions])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.amount || !formData.description || !formData.category) {
      alert('Mohon lengkapi semua field')
      return
    }

    const newTransaction = {
      id: Date.now(),
      ...formData,
      amount: parseFloat(formData.amount),
      createdAt: new Date().toISOString()
    }

    setTransactions([newTransaction, ...transactions])
    setFormData({
      type: 'income',
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0]
    })
  }

  const handleDelete = (id) => {
    if (confirm('Hapus transaksi ini?')) {
      setTransactions(transactions.filter(t => t.id !== id))
    }
  }

  const filteredTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date)
    const matchType = filter.type === 'all' || t.type === filter.type
    const matchMonth = transactionDate.getMonth() + 1 === parseInt(filter.month)
    const matchYear = transactionDate.getFullYear() === parseInt(filter.year)
    
    return matchType && matchMonth && matchYear
  })

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpense

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date)
  }

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i)

  const incomeCategories = ['Gaji', 'Bonus', 'Investasi', 'Freelance', 'Lainnya']
  const expenseCategories = ['Makanan', 'Transport', 'Belanja', 'Tagihan', 'Hiburan', 'Kesehatan', 'Pendidikan', 'Lainnya']

  return (
    <div className="container">
      <div className="header">
        <h1>💰 Pencatat Keuangan</h1>
        <p className="date">
          {new Date().toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <div className="summary">
        <div className="summary-card income">
          <h3>Total Pemasukan</h3>
          <div className="amount">{formatCurrency(totalIncome)}</div>
        </div>
        <div className="summary-card expense">
          <h3>Total Pengeluaran</h3>
          <div className="amount">{formatCurrency(totalExpense)}</div>
        </div>
        <div className="summary-card balance">
          <h3>Saldo</h3>
          <div className="amount">{formatCurrency(balance)}</div>
        </div>
      </div>

      <div className="form-section">
        <h2>Tambah Transaksi</h2>
        <form onSubmit={handleSubmit}>
          <div className="form">
            <div className="form-group">
              <label>Tipe</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value, category: '' })}
              >
                <option value="income">Pemasukan</option>
                <option value="expense">Pengeluaran</option>
              </select>
            </div>

            <div className="form-group">
              <label>Jumlah (Rp)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="100000"
                min="0"
                step="1000"
              />
            </div>

            <div className="form-group">
              <label>Deskripsi</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Keterangan transaksi"
              />
            </div>

            <div className="form-group">
              <label>Kategori</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">Pilih kategori</option>
                {formData.type === 'income' 
                  ? incomeCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)
                  : expenseCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)
                }
              </select>
            </div>

            <div className="form-group">
              <label>Tanggal</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Tambah Transaksi
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="transactions-section">
        <h2>Riwayat Transaksi</h2>
        
        <div className="filter-section">
          <div className="form-group">
            <label>Filter Tipe</label>
            <select 
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            >
              <option value="all">Semua</option>
              <option value="income">Pemasukan</option>
              <option value="expense">Pengeluaran</option>
            </select>
          </div>

          <div className="form-group">
            <label>Bulan</label>
            <select 
              value={filter.month}
              onChange={(e) => setFilter({ ...filter, month: e.target.value })}
            >
              {months.map((month, idx) => (
                <option key={idx} value={idx + 1}>{month}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Tahun</label>
            <select 
              value={filter.year}
              onChange={(e) => setFilter({ ...filter, year: e.target.value })}
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3>Belum ada transaksi</h3>
            <p>Tambahkan transaksi pertama Anda untuk mulai melacak keuangan</p>
          </div>
        ) : (
          <div className="transactions-list">
            {filteredTransactions.map(transaction => (
              <div key={transaction.id} className={`transaction-item ${transaction.type}`}>
                <div className="transaction-date">{formatDate(transaction.date)}</div>
                <div>
                  <div className="transaction-description">{transaction.description}</div>
                  <div className="transaction-category">{transaction.category}</div>
                </div>
                <div className={`transaction-amount ${transaction.type}`}>
                  {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                </div>
                <button 
                  onClick={() => handleDelete(transaction.id)}
                  className="btn btn-danger btn-small"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
