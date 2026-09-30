// API Base URL
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

let editingId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeDateInput();
    populateYearFilter();
    loadTransactions();
    loadSummary();
    
    document.getElementById('transactionForm').addEventListener('submit', handleSubmit);
    document.getElementById('cancelBtn').addEventListener('click', cancelEdit);
});

// Set today's date as default
function initializeDateInput() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('transaction_date').value = today;
}

// Populate year filter with current and past years
function populateYearFilter() {
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

// Load transactions with filters
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
        if (!response.ok) throw new Error('Gagal memuat transaksi');
        
        const transactions = await response.json();
        displayTransactions(transactions);
    } catch (error) {
        console.error('Error:', error);
        showNotification('Gagal memuat data transaksi', 'error');
        document.getElementById('transactionsList').innerHTML = 
            '<div class="empty-state">Gagal memuat data. Coba refresh halaman.</div>';
    }
}

// Display transactions
function displayTransactions(transactions) {
    const container = document.getElementById('transactionsList');
    
    if (transactions.length === 0) {
        container.innerHTML = '<div class="empty-state">Belum ada transaksi. Tambahkan transaksi pertama Anda!</div>';
        return;
    }
    
    container.innerHTML = transactions.map(t => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-header">
                    <span class="transaction-type ${t.type}">${t.type}</span>
                    <span class="transaction-category">${t.category}</span>
                </div>
                ${t.description ? `<div class="transaction-description">${t.description}</div>` : ''}
                <div class="transaction-date">${formatDate(t.transaction_date)}</div>
            </div>
            <div class="transaction-amount ${t.type}">
                ${t.type === 'pemasukan' ? '+' : '-'} ${formatCurrency(t.amount)}
            </div>
            <div class="transaction-actions">
                <button class="btn-edit" onclick="editTransaction(${t.id})">Edit</button>
                <button class="btn-delete" onclick="deleteTransaction(${t.id})">Hapus</button>
            </div>
        </div>
    `).join('');
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
        if (!response.ok) throw new Error('Gagal memuat summary');
        
        const summary = await response.json();
        
        document.getElementById('saldo').textContent = formatCurrency(summary.saldo);
        document.getElementById('pemasukan').textContent = formatCurrency(summary.pemasukan.total);
        document.getElementById('pengeluaran').textContent = formatCurrency(summary.pengeluaran.total);
    } catch (error) {
        console.error('Error:', error);
        showNotification('Gagal memuat summary', 'error');
    }
}

// Handle form submit
async function handleSubmit(e) {
    e.preventDefault();
    
    const data = {
        type: document.getElementById('type').value,
        amount: parseFloat(document.getElementById('amount').value),
        category: document.getElementById('category').value,
        description: document.getElementById('description').value,
        transaction_date: document.getElementById('transaction_date').value
    };
    
    try {
        let response;
        if (editingId) {
            response = await fetch(`${API_URL}/transactions/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            response = await fetch(`${API_URL}/transactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }
        
        if (!response.ok) throw new Error('Gagal menyimpan transaksi');
        
        showNotification(editingId ? 'Transaksi berhasil diupdate' : 'Transaksi berhasil ditambahkan', 'success');
        resetForm();
        loadTransactions();
        loadSummary();
    } catch (error) {
        console.error('Error:', error);
        showNotification('Gagal menyimpan transaksi', 'error');
    }
}

// Edit transaction
async function editTransaction(id) {
    try {
        const response = await fetch(`${API_URL}/transactions/${id}`);
        if (!response.ok) throw new Error('Gagal memuat transaksi');
        
        const transaction = await response.json();
        
        document.getElementById('type').value = transaction.type;
        document.getElementById('amount').value = transaction.amount;
        document.getElementById('category').value = transaction.category;
        document.getElementById('description').value = transaction.description || '';
        document.getElementById('transaction_date').value = transaction.transaction_date.split('T')[0];
        
        editingId = id;
        document.getElementById('submitBtn').textContent = 'Update Transaksi';
        document.getElementById('cancelBtn').style.display = 'inline-block';
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error('Error:', error);
        showNotification('Gagal memuat transaksi untuk diedit', 'error');
    }
}

// Cancel edit
function cancelEdit() {
    resetForm();
}

// Delete transaction
async function deleteTransaction(id) {
    if (!confirm('Yakin ingin menghapus transaksi ini?')) return;
    
    try {
        const response = await fetch(`${API_URL}/transactions/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Gagal menghapus transaksi');
        
        showNotification('Transaksi berhasil dihapus', 'success');
        loadTransactions();
        loadSummary();
    } catch (error) {
        console.error('Error:', error);
        showNotification('Gagal menghapus transaksi', 'error');
    }
}

// Apply filters
function applyFilters() {
    loadTransactions();
    loadSummary();
}

// Reset form
function resetForm() {
    document.getElementById('transactionForm').reset();
    initializeDateInput();
    editingId = null;
    document.getElementById('submitBtn').textContent = 'Tambah Transaksi';
    document.getElementById('cancelBtn').style.display = 'none';
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return date.toLocaleDateString('id-ID', options);
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}
