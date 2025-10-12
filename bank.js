const accounts = [];
const transactions = [];
let accountIdCounter = 1000;
let transactionIdCounter = 1;

function showTab(tabName, event) {
    const tabs = document.querySelectorAll('.tab-content');
    const navTabs = document.querySelectorAll('.nav-tab');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    navTabs.forEach(tab => tab.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');

    if (tabName === 'dashboard') updateDashboard();
    if (tabName === 'accounts') displayAccounts();
    if (tabName === 'transaction') {
        updateTransactionSelects();
        displayTransactions();
    }
}

function showAlert(message, type) {
    const alertContainer = document.getElementById('alert-container');
    alertContainer.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    setTimeout(() => alertContainer.innerHTML = '', 3000);
}

document.getElementById('create-account-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('holder-name').value;
    const type = document.getElementById('account-type').value;
    const deposit = parseFloat(document.getElementById('initial-deposit').value);

    if (deposit < 0) {
        showAlert('Initial deposit cannot be negative!', 'danger');
        return;
    }

    const account = {
        id: accountIdCounter++,
        name: name,
        type: type,
        balance: deposit,
        createdDate: new Date().toLocaleDateString()
    };

    accounts.push(account);
    
    transactions.push({
        id: transactionIdCounter++,
        accountId: account.id,
        type: 'deposit',
        amount: deposit,
        date: new Date().toLocaleString(),
        description: 'Initial deposit'
    });

    showAlert(`Account created successfully! Account ID: ${account.id}`, 'success');
    this.reset();
});

document.getElementById('transaction-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const accountId = parseInt(document.getElementById('trans-account').value);
    const type = document.getElementById('trans-type').value;
    const amount = parseFloat(document.getElementById('trans-amount').value);
    
    if (!accountId) {
        showAlert('Please select an account!', 'danger');
        return;
    }

    if (amount <= 0) {
        showAlert('Amount must be greater than zero!', 'danger');
        return;
    }

    const account = accounts.find(acc => acc.id === accountId);
    
    if (!account) {
        showAlert('Account not found!', 'danger');
        return;
    }

    if (type === 'withdraw' && account.balance < amount) {
        showAlert('Insufficient balance!', 'danger');
        return;
    }

    if (type === 'transfer') {
        const transferToId = parseInt(document.getElementById('transfer-to').value);
        
        if (!transferToId) {
            showAlert('Please select a transfer destination account!', 'danger');
            return;
        }

        if (accountId === transferToId) {
            showAlert('Cannot transfer to the same account!', 'danger');
            return;
        }

        const transferToAccount = accounts.find(acc => acc.id === transferToId);
        
        if (!transferToAccount) {
            showAlert('Transfer account not found!', 'danger');
            return;
        }
        
        if (account.balance < amount) {
            showAlert('Insufficient balance for transfer!', 'danger');
            return;
        }
        
        account.balance -= amount;
        transferToAccount.balance += amount;
        
        transactions.push({
            id: transactionIdCounter++,
            accountId: accountId,
            type: 'transfer',
            amount: -amount,
            date: new Date().toLocaleString(),
            description: `Transfer to Account #${transferToId}`
        });
        
        transactions.push({
            id: transactionIdCounter++,
            accountId: transferToId,
            type: 'transfer',
            amount: amount,
            date: new Date().toLocaleString(),
            description: `Transfer from Account #${accountId}`
        });
        
        showAlert(`Transfer of $${amount.toFixed(2)} completed successfully!`, 'success');
    } else {
        if (type === 'deposit') {
            account.balance += amount;
        } else if (type === 'withdraw') {
            account.balance -= amount;
        }

        transactions.push({
            id: transactionIdCounter++,
            accountId: accountId,
            type: type,
            amount: type === 'withdraw' ? -amount : amount,
            date: new Date().toLocaleString(),
            description: type.charAt(0).toUpperCase() + type.slice(1)
        });

        showAlert(`${type.charAt(0).toUpperCase() + type.slice(1)} of $${amount.toFixed(2)} completed successfully!`, 'success');
    }

    displayTransactions();
    updateDashboard();
    this.reset();
    document.getElementById('transfer-to-group').style.display = 'none';
});

function toggleTransferField() {
    const type = document.getElementById('trans-type').value;
    const transferGroup = document.getElementById('transfer-to-group');
    const fromAccountId = parseInt(document.getElementById('trans-account').value);
    
    transferGroup.style.display = type === 'transfer' ? 'block' : 'none';
    
    if (type === 'transfer' && fromAccountId) {
        updateTransferToSelect(fromAccountId);
    }
}

function updateTransactionSelects() {
    const transAccount = document.getElementById('trans-account');
    const transferTo = document.getElementById('transfer-to');
    
    transAccount.innerHTML = '<option value="">Select Account</option>';
    transferTo.innerHTML = '<option value="">Select Account</option>';
    
    accounts.forEach(acc => {
        transAccount.innerHTML += `<option value="${acc.id}">${acc.name} - #${acc.id} ($${acc.balance.toFixed(2)})</option>`;
        transferTo.innerHTML += `<option value="${acc.id}">${acc.name} - #${acc.id}</option>`;
    });
}

function updateTransferToSelect(excludeAccountId) {
    const transferTo = document.getElementById('transfer-to');
    transferTo.innerHTML = '<option value="">Select Account</option>';
    
    accounts.forEach(acc => {
        if (acc.id !== excludeAccountId) {
            transferTo.innerHTML += `<option value="${acc.id}">${acc.name} - #${acc.id}</option>`;
        }
    });
}

function displayAccounts() {
    const accountsList = document.getElementById('accounts-list');
    
    if (accounts.length === 0) {
        accountsList.innerHTML = '<div class="no-data">No accounts found. Create one to get started!</div>';
        return;
    }

    accountsList.innerHTML = accounts.map(acc => `
        <div class="account-card">
            <div class="account-info">
                <div class="account-details">
                    <h3>${acc.name}</h3>
                    <p>Account #${acc.id} | ${acc.type}</p>
                    <p>Created: ${acc.createdDate}</p>
                </div>
                <div class="balance">$${acc.balance.toFixed(2)}</div>
            </div>
        </div>
    `).join('');
}

function displayTransactions() {
    const transList = document.getElementById('transaction-list');
    
    if (transactions.length === 0) {
        transList.innerHTML = '<div class="no-data">No transactions yet.</div>';
        return;
    }

    transList.innerHTML = transactions.slice().reverse().map(trans => {
        const account = accounts.find(acc => acc.id === trans.accountId);
        return `
            <div class="transaction-item">
                <div>
                    <span class="transaction-type ${trans.type}">${trans.type.toUpperCase()}</span>
                    <p><strong>${account ? account.name : 'Unknown'}</strong> - ${trans.description}</p>
                    <small>${trans.date}</small>
                </div>
                <div class="balance" style="color: ${trans.amount >= 0 ? '#28a745' : '#dc3545'}">
                    ${trans.amount >= 0 ? '+' : ''}$${trans.amount.toFixed(2)}
                </div>
            </div>
        `;
    }).join('');
}

function updateDashboard() {
    document.getElementById('total-accounts').textContent = accounts.length;
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    document.getElementById('total-balance').textContent = `$${totalBalance.toFixed(2)}`;
    document.getElementById('total-transactions').textContent = transactions.length;
}

updateDashboard();