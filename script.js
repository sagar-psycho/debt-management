document.addEventListener('DOMContentLoaded', () => {
const transactionForm = document.getElementById('transactionForm');
const transactionTable = document.getElementById('transactionTable').querySelector('tbody');
const summaryTable = document.getElementById('summaryTable').querySelector('tbody');

const totalDebtEl = document.getElementById('totalDebt');
const totalRecoveryEl = document.getElementById('totalRecovery');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let currentTransactionId = null; // Track the transaction being edited

// Display stored transactions on load
displayTransactions();

transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const amount = document.getElementById('amount').value;
    const transactionType = document.getElementById('transactionType').value;
    const purpose = document.getElementById('purpose').value;
    const date = new Date().toLocaleDateString();

    const transaction = {
    id: Date.now(),
    date,
    name,
    amount: parseFloat(amount),
    type: transactionType,
    purpose
    };

    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    displayTransactions();
    transactionForm.reset();
});

function displayTransactions() {
    transactionTable.innerHTML = '';
    summaryTable.innerHTML = '';
    
    let summary = {};
    let totalDebt = 0;
    let totalRecovery = 0;

    transactions.forEach((transaction, index) => {
    const row = `
        <tr>
        <td>${index + 1}</td>
        <td>${transaction.date}</td>
        <td>${transaction.name}</td>
        <td>${transaction.type}</td>
        <td>${transaction.amount}</td>
        <td>
            <button class="btn btn-warning btn-sm edit-btn" data-id="${transaction.id}">Edit</button>
            <button class="btn btn-danger btn-sm delete-btn" data-id="${transaction.id}">Delete</button>
        </td>
        </tr>
    `;
    transactionTable.insertAdjacentHTML('beforeend', row);

    // Calculate totals
    if (transaction.type === 'Debt') {
        totalDebt += transaction.amount;
    } else {
        totalRecovery += transaction.amount;
    }

    // Summarize data
    if (!summary[transaction.name]) {
        summary[transaction.name] = { debt: 0, recovery: 0, date: transaction.date };
    }
    if (transaction.type === 'Debt') {
        summary[transaction.name].debt += transaction.amount;
    } else {
        summary[transaction.name].recovery += transaction.amount;
    }
    });

    // Update totals in the UI
    totalDebtEl.textContent = totalDebt.toFixed(2);
    totalRecoveryEl.textContent = totalRecovery.toFixed(2);

    // Populate summary table
    Object.keys(summary).forEach((name, index) => {
    const personSummary = summary[name];
    const totalAmount = personSummary.debt - personSummary.recovery;
    const row = `
        <tr>
        <td>${index + 1}</td>
        <td>${personSummary.date}</td>
        <td>${name}</td>
        <td>${personSummary.debt}</td>
        <td>${personSummary.recovery}</td>
        <td>${totalAmount}</td>
        <td>
            <button class="btn btn-info btn-sm">View</button>
        </td>
        </tr>
    `;
    summaryTable.insertAdjacentHTML('beforeend', row);
    });

    // Attach event listeners for edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', handleEditTransaction);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', handleDeleteTransaction);
    });
}

// Edit Transaction
function handleEditTransaction(e) {
    const transactionId = e.target.dataset.id;
    currentTransactionId = transactionId;
    const transaction = transactions.find(t => t.id == transactionId);

    // Fill the edit modal with the transaction data
    document.getElementById('editName').value = transaction.name;
    document.getElementById('editAmount').value = transaction.amount;
    document.getElementById('editTransactionType').value = transaction.type;
    document.getElementById('editPurpose').value = transaction.purpose;

    // Show the modal
    const editModal = new bootstrap.Modal(document.getElementById('editTransactionModal'));
    editModal.show();
}

// Save changes to the edited transaction
document.getElementById('editTransactionForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const updatedTransaction = {
    id: currentTransactionId,
    date: transactions.find(t => t.id == currentTransactionId).date, // Keep the original date
    name: document.getElementById('editName').value,
    amount: parseFloat(document.getElementById('editAmount').value),
    type: document.getElementById('editTransactionType').value,
    purpose: document.getElementById('editPurpose').value
    };

    transactions = transactions.map(t => t.id == currentTransactionId ? updatedTransaction : t);
    localStorage.setItem('transactions', JSON.stringify(transactions));

    // Hide the modal and refresh the table
    const editModal = bootstrap.Modal.getInstance(document.getElementById('editTransactionModal'));
    editModal.hide();
    displayTransactions();
});

// Delete Transaction
function handleDeleteTransaction(e) {
    const transactionId = e.target.dataset.id;
    currentTransactionId = transactionId;

    // Show confirmation modal
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmationModal'));
    deleteModal.show();
}

// Confirm deletion
document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
    transactions = transactions.filter(t => t.id != currentTransactionId);
    localStorage.setItem('transactions', JSON.stringify(transactions));

    // Hide the modal and refresh the table
    const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmationModal'));
    deleteModal.hide();
    displayTransactions();
});
});