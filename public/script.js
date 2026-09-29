const API_URL = 'http://localhost:3000/api';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadYears();
  loadTransactions();
  loadSummary();
  
  // Set default date to today
  document.getElementById('transaction_date').valueAsDate = new Date();
  document.getElementById('quickDate').valueAsDate = new Date();
  
  // Filter listeners
  document.getElementById('filterYear').addEventListener('change', handleFilterChange);
  document.getElementById('filterMonth').addEventListener('change', handleFilterChange);
  document.getElementById('filterType').addEventListener('change', handleFilterChange);
  
  // Form submit
  document.getElementById('transactionForm').addEventListener('submit', handleSubmit);
  document.getElementById('quickForm').addEventListener('submit', handleQuickSubmit);
});

// Load years for filter
function loadYears() {
  const currentYear = new Date().getFullYear();
  const yearSelect = document.getElementById('filterYear');
  
  for (let year = currentYear; year >= currentYear - 5; year--) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  }
  
  yearSelect.value = currentYear;
}

// Load transactions
async function loadTransactions() {
  try {
    const year = document.getElementById('filterYear').value;
    const month = document.getElementById('filterMonth').value;
    const type = document.getElementById('filterType').value;
    
    let url = `${API_URL}/transactions?`;
    if (year) url += `year=${year}&`;
    if (month) url += `month=${month}&`;
    if (type) url += `type=${type}&`;
    
    const response = await fetch(url);
    const transactions = await response.json();
    
    renderTransactions(transactions);
  } catch (error) {
    console.error('Error loading transactions:', error);
    document.getElementById('transactionsBody').innerHTML = 
      '<tr><td colspan="6" class="no-data">Error loading data</td></tr>';
  }
}

// Render transactions table
function renderTransactions(transactions) {
  const tbody = document.getElementById('transactionsBody');
  
  if (transactions.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="no-data">Tidak ada transaksi</td></tr>';
    return;
  }
  
  tbody.innerHTML = transactions.map(t => {
    const date = new Date(t.transaction_date);
    const formattedDate = date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    
    const amount = formatCurrency(t.amount);
    const typeClass = t.type === 'pemasukan' ? 'type-pemasukan' : 'type-pengeluaran';
    const amountClass = t.type === 'pemasukan' ? 'amount-positive' : 'amount-negative';
    const amountPrefix = t.type === 'pemasukan' ? '+' : '-';
    
    return `
      <tr>
        <td>${formattedDate}</td>
        <td><span class="type-badge ${typeClass}">${capitalize(t.type)}</span></td>
        <td>${t.category}</td>
        <td>${t.description || '-'}</td>
        <td class="${amountClass}">${amountPrefix} ${amount}</td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-edit" onclick="editTransaction(${t.id})">Edit</button>
            <button class="btn btn-delete" onclick="deleteTransaction(${t.id})">Hapus</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Load summary
async function loadSummary() {
  try {
    const year = document.getElementById('filterYear').value;
    const month = document.getElementById('filterMonth').value;
    
    let url = `${API_URL}/summary?`;
    if (year) url += `year=${year}&`;
    if (month) url += `month=${month}&`;
    
    const response = await fetch(url);
    const summary = await response.json();
    
    document.getElementById('totalIncome').textContent = formatCurrency(summary.pemasukan.total);
    document.getElementById('incomeCount').textContent = `${summary.pemasukan.count} transaksi`;
    
    document.getElementById('totalExpense').textContent = formatCurrency(summary.pengeluaran.total);
    document.getElementById('expenseCount').textContent = `${summary.pengeluaran.count} transaksi`;
    
    document.getElementById('balance').textContent = formatCurrency(summary.saldo);
  } catch (error) {
    console.error('Error loading summary:', error);
  }
}

// Filter change handler
function handleFilterChange() {
  loadTransactions();
  loadSummary();
}

// Reset filters
function resetFilters() {
  document.getElementById('filterYear').value = new Date().getFullYear();
  document.getElementById('filterMonth').value = '';
  document.getElementById('filterType').value = '';
  loadTransactions();
  loadSummary();
}

// Show add modal
function showAddModal() {
  document.getElementById('modalTitle').textContent = 'Tambah Transaksi';
  document.getElementById('transactionForm').reset();
  document.getElementById('transactionId').value = '';
  document.getElementById('transaction_date').valueAsDate = new Date();
  document.getElementById('modal').style.display = 'block';
}

// Edit transaction
async function editTransaction(id) {
  try {
    const response = await fetch(`${API_URL}/transactions/${id}`);
    const transaction = await response.json();
    
    document.getElementById('modalTitle').textContent = 'Edit Transaksi';
    document.getElementById('transactionId').value = transaction.id;
    document.getElementById('type').value = transaction.type;
    document.getElementById('amount').value = transaction.amount;
    document.getElementById('category').value = transaction.category;
    document.getElementById('description').value = transaction.description || '';
    document.getElementById('transaction_date').value = transaction.transaction_date.split('T')[0];
    
    document.getElementById('modal').style.display = 'block';
  } catch (error) {
    console.error('Error loading transaction:', error);
    alert('Error loading transaction');
  }
}

// Delete transaction
async function deleteTransaction(id) {
  if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/transactions/${id}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      loadTransactions();
      loadSummary();
    } else {
      alert('Error deleting transaction');
    }
  } catch (error) {
    console.error('Error deleting transaction:', error);
    alert('Error deleting transaction');
  }
}

// Handle form submit
async function handleSubmit(e) {
  e.preventDefault();
  
  const id = document.getElementById('transactionId').value;
  const data = {
    type: document.getElementById('type').value,
    amount: parseFloat(document.getElementById('amount').value),
    category: document.getElementById('category').value,
    description: document.getElementById('description').value,
    transaction_date: document.getElementById('transaction_date').value
  };
  
  try {
    const url = id ? `${API_URL}/transactions/${id}` : `${API_URL}/transactions`;
    const method = id ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      closeModal();
      loadTransactions();
      loadSummary();
    } else {
      alert('Error saving transaction');
    }
  } catch (error) {
    console.error('Error saving transaction:', error);
    alert('Error saving transaction');
  }
}

// Close modal
function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('modal');
  if (event.target === modal) {
    closeModal();
  }
}

// Handle quick form submit
async function handleQuickSubmit(e) {
  e.preventDefault();
  
  const data = {
    type: document.getElementById('quickType').value,
    amount: parseFloat(document.getElementById('quickAmount').value),
    category: document.getElementById('quickCategory').value,
    description: document.getElementById('quickDescription').value,
    transaction_date: document.getElementById('quickDate').value
  };
  
  try {
    const response = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      // Reset form
      document.getElementById('quickForm').reset();
      document.getElementById('quickDate').valueAsDate = new Date();
      
      // Reload data
      loadTransactions();
      loadSummary();
      
      // Show success feedback
      showNotification('Transaksi berhasil disimpan!', 'success');
    } else {
      showNotification('Error menyimpan transaksi', 'error');
    }
  } catch (error) {
    console.error('Error saving transaction:', error);
    showNotification('Error menyimpan transaksi', 'error');
  }
}

// Show notification
function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Helper functions
function formatCurrency(amount) {
  return 'Rp ' + parseFloat(amount).toLocaleString('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
