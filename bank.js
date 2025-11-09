const accounts = [];
const transactions = [];
let accountIdCounter = 1000;
let transactionIdCounter = 1;

const loans = [];
const cards = [];
let loanIdCounter = 5000;
let cardIdCounter = 7000;

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
    if (tabName === 'loans') {
        updateLoanAccountSelect();
        displayLoans();
    }
    if (tabName === 'cards') {
        updateCardAccountSelect();
        displayCards();
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

document.getElementById('loan-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const accountId = parseInt(document.getElementById('loan-account').value);
    const loanType = document.getElementById('loan-type').value;
    const loanAmount = parseFloat(document.getElementById('loan-amount').value);
    const loanTerm = parseInt(document.getElementById('loan-term').value);
    
    const account = accounts.find(acc => acc.id === accountId);
    
    if (!account) {
        showAlert('Account not found!', 'danger');
        return;
    }
    
    let interestRate;
    switch(loanType) {
        case 'Personal': interestRate = 8.5; break;
        case 'Home': interestRate = 6.5; break;
        case 'Auto': interestRate = 7.0; break;
        case 'Business': interestRate = 9.5; break;
        default: interestRate = 8.0;
    }
    
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                          (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    const totalRepayment = monthlyPayment * numberOfPayments;
    const totalInterest = totalRepayment - loanAmount;
    
    const loan = {
        id: loanIdCounter++,
        accountId: accountId,
        accountName: account.name,
        loanType: loanType,
        amount: loanAmount,
        interestRate: interestRate,
        term: loanTerm,
        monthlyPayment: monthlyPayment,
        totalRepayment: totalRepayment,
        totalInterest: totalInterest,
        remainingBalance: loanAmount,
        status: 'Active',
        appliedDate: new Date().toLocaleDateString(),
        nextPaymentDate: getNextPaymentDate()
    };
    
    loans.push(loan);
    account.balance += loanAmount;
    
    transactions.push({
        id: transactionIdCounter++,
        accountId: accountId,
        type: 'deposit',
        amount: loanAmount,
        date: new Date().toLocaleString(),
        description: `Loan disbursement - ${loanType} Loan #${loan.id}`
    });
    
    showAlert(`Loan approved! Loan ID: ${loan.id}. Amount $${loanAmount.toFixed(2)} credited to your account.`, 'success');
    displayLoans();
    this.reset();
});

document.getElementById('loan-payment-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const loanId = parseInt(document.getElementById('payment-loan').value);
    const paymentAmount = parseFloat(document.getElementById('payment-amount').value);
    
    const loan = loans.find(l => l.id === loanId);
    
    if (!loan) {
        showAlert('Loan not found!', 'danger');
        return;
    }
    
    if (loan.status === 'Paid Off') {
        showAlert('This loan has already been paid off!', 'danger');
        return;
    }
    
    const account = accounts.find(acc => acc.id === loan.accountId);
    
    if (account.balance < paymentAmount) {
        showAlert('Insufficient balance for loan payment!', 'danger');
        return;
    }
    
    account.balance -= paymentAmount;
    loan.remainingBalance -= paymentAmount;
    
    if (loan.remainingBalance <= 0) {
        loan.status = 'Paid Off';
        loan.remainingBalance = 0;
    }
    
    loan.nextPaymentDate = getNextPaymentDate();
    
    transactions.push({
        id: transactionIdCounter++,
        accountId: account.id,
        type: 'withdraw',
        amount: -paymentAmount,
        date: new Date().toLocaleString(),
        description: `Loan payment - ${loan.loanType} Loan #${loan.id}`
    });
    
    showAlert(`Payment of $${paymentAmount.toFixed(2)} processed successfully!`, 'success');
    displayLoans();
    this.reset();
});

function displayLoans() {
    const loansList = document.getElementById('loans-list');
    
    if (!loansList) return;
    
    if (loans.length === 0) {
        loansList.innerHTML = '<div class="no-data">No loans found. Apply for a loan to get started!</div>';
        return;
    }
    
    loansList.innerHTML = loans.map(loan => `
        <div class="loan-card">
            <div class="loan-header">
                <div>
                    <h3>${loan.loanType} Loan #${loan.id}</h3>
                    <p>${loan.accountName} - Account #${loan.accountId}</p>
                </div>
                <div class="loan-status ${loan.status === 'Active' ? 'status-active' : 'status-paid'}">
                    ${loan.status}
                </div>
            </div>
            <div class="loan-details">
                <div class="loan-detail-item">
                    <span class="label">Loan Amount:</span>
                    <span class="value">$${loan.amount.toFixed(2)}</span>
                </div>
                <div class="loan-detail-item">
                    <span class="label">Interest Rate:</span>
                    <span class="value">${loan.interestRate}% APR</span>
                </div>
                <div class="loan-detail-item">
                    <span class="label">Term:</span>
                    <span class="value">${loan.term} years</span>
                </div>
                <div class="loan-detail-item">
                    <span class="label">Monthly Payment:</span>
                    <span class="value">$${loan.monthlyPayment.toFixed(2)}</span>
                </div>
                <div class="loan-detail-item">
                    <span class="label">Remaining Balance:</span>
                    <span class="value balance-amount">$${loan.remainingBalance.toFixed(2)}</span>
                </div>
                <div class="loan-detail-item">
                    <span class="label">Next Payment:</span>
                    <span class="value">${loan.nextPaymentDate}</span>
                </div>
            </div>
            <div class="loan-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${((loan.amount - loan.remainingBalance) / loan.amount * 100).toFixed(1)}%"></div>
                </div>
                <p class="progress-text">${((loan.amount - loan.remainingBalance) / loan.amount * 100).toFixed(1)}% paid</p>
            </div>
        </div>
    `).join('');
    
    updateLoanSelects();
}

function updateLoanSelects() {
    const paymentLoan = document.getElementById('payment-loan');
    
    if (!paymentLoan) return;
    
    paymentLoan.innerHTML = '<option value="">Select Loan</option>';
    
    loans.filter(l => l.status === 'Active').forEach(loan => {
        paymentLoan.innerHTML += `<option value="${loan.id}">${loan.loanType} Loan #${loan.id} - Balance: $${loan.remainingBalance.toFixed(2)}</option>`;
    });
}

function updateLoanAccountSelect() {
    const loanAccount = document.getElementById('loan-account');
    
    if (!loanAccount) return;
    
    loanAccount.innerHTML = '<option value="">Select Account</option>';
    
    accounts.forEach(acc => {
        loanAccount.innerHTML += `<option value="${acc.id}">${acc.name} - #${acc.id} ($${acc.balance.toFixed(2)})</option>`;
    });
}

function getNextPaymentDate() {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toLocaleDateString();
}

document.getElementById('card-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const accountId = parseInt(document.getElementById('card-account').value);
    const cardType = document.getElementById('card-type').value;
    
    const account = accounts.find(acc => acc.id === accountId);
    
    if (!account) {
        showAlert('Account not found!', 'danger');
        return;
    }
    
    let creditLimit, annualFee, rewardRate;
    
    switch(cardType) {
        case 'Debit':
            creditLimit = account.balance;
            annualFee = 0;
            rewardRate = 0;
            break;
        case 'Credit':
            creditLimit = 5000;
            annualFee = 50;
            rewardRate = 1.0;
            break;
        case 'Gold':
            creditLimit = 15000;
            annualFee = 150;
            rewardRate = 2.0;
            break;
        case 'Platinum':
            creditLimit = 30000;
            annualFee = 300;
            rewardRate = 3.0;
            break;
        default:
            creditLimit = 5000;
            annualFee = 50;
            rewardRate = 1.0;
    }
    
    const cardNumber = generateCardNumber();
    const cvv = generateCVV();
    const expiryDate = getCardExpiryDate();
    
    const card = {
        id: cardIdCounter++,
        accountId: accountId,
        accountName: account.name,
        cardType: cardType,
        cardNumber: cardNumber,
        cvv: cvv,
        expiryDate: expiryDate,
        creditLimit: creditLimit,
        availableCredit: creditLimit,
        usedCredit: 0,
        annualFee: annualFee,
        rewardRate: rewardRate,
        rewardsEarned: 0,
        status: 'Active',
        issuedDate: new Date().toLocaleDateString()
    };
    
    cards.push(card);
    
    showAlert(`${cardType} Card issued successfully! Card ID: ${card.id}`, 'success');
    displayCards();
    this.reset();
});

document.getElementById('card-transaction-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const cardId = parseInt(document.getElementById('transaction-card').value);
    const transactionAmount = parseFloat(document.getElementById('card-trans-amount').value);
    const transactionType = document.getElementById('card-trans-type').value;
    
    const card = cards.find(c => c.id === cardId);
    
    if (!card) {
        showAlert('Card not found!', 'danger');
        return;
    }
    
    if (card.status !== 'Active') {
        showAlert('This card is not active!', 'danger');
        return;
    }
    
    const account = accounts.find(acc => acc.id === card.accountId);
    
    if (transactionType === 'purchase') {
        if (card.availableCredit < transactionAmount) {
            showAlert('Insufficient credit limit!', 'danger');
            return;
        }
        
        card.usedCredit += transactionAmount;
        card.availableCredit -= transactionAmount;
        
        const rewardsEarned = (transactionAmount * card.rewardRate / 100);
        card.rewardsEarned += rewardsEarned;
        
        if (card.cardType === 'Debit') {
            account.balance -= transactionAmount;
        }
        
        transactions.push({
            id: transactionIdCounter++,
            accountId: account.id,
            type: 'withdraw',
            amount: -transactionAmount,
            date: new Date().toLocaleString(),
            description: `Card purchase - ${card.cardType} Card #${card.id}`
        });
        
        showAlert(`Purchase of $${transactionAmount.toFixed(2)} processed. Rewards earned: $${rewardsEarned.toFixed(2)}`, 'success');
        
    } else if (transactionType === 'payment') {
        if (account.balance < transactionAmount) {
            showAlert('Insufficient account balance!', 'danger');
            return;
        }
        
        const paymentAmount = Math.min(transactionAmount, card.usedCredit);
        
        card.usedCredit -= paymentAmount;
        card.availableCredit += paymentAmount;
        account.balance -= paymentAmount;
        
        transactions.push({
            id: transactionIdCounter++,
            accountId: account.id,
            type: 'withdraw',
            amount: -paymentAmount,
            date: new Date().toLocaleString(),
            description: `Card payment - ${card.cardType} Card #${card.id}`
        });
        
        showAlert(`Payment of $${paymentAmount.toFixed(2)} processed successfully!`, 'success');
    }
    
    displayCards();
    this.reset();
});

function displayCards() {
    const cardsList = document.getElementById('cards-list');
    
    if (!cardsList) return;
    
    if (cards.length === 0) {
        cardsList.innerHTML = '<div class="no-data">No cards found. Apply for a card to get started!</div>';
        return;
    }
    
    cardsList.innerHTML = cards.map(card => `
        <div class="card-item ${card.cardType.toLowerCase()}">
            <div class="card-visual">
                <div class="card-chip">💳</div>
                <div class="card-number">${formatCardNumber(card.cardNumber)}</div>
                <div class="card-info-row">
                    <div>
                        <p class="card-label">Card Holder</p>
                        <p class="card-value">${card.accountName}</p>
                    </div>
                    <div>
                        <p class="card-label">Expires</p>
                        <p class="card-value">${card.expiryDate}</p>
                    </div>
                    <div>
                        <p class="card-label">CVV</p>
                        <p class="card-value">•••</p>
                    </div>
                </div>
                <div class="card-type-badge">${card.cardType}</div>
            </div>
            <div class="card-details-section">
                <div class="card-detail-row">
                    <span>Credit Limit:</span>
                    <span class="highlight">$${card.creditLimit.toFixed(2)}</span>
                </div>
                <div class="card-detail-row">
                    <span>Available Credit:</span>
                    <span class="highlight-green">$${card.availableCredit.toFixed(2)}</span>
                </div>
                <div class="card-detail-row">
                    <span>Used Credit:</span>
                    <span class="highlight-red">$${card.usedCredit.toFixed(2)}</span>
                </div>
                <div class="card-detail-row">
                    <span>Rewards Earned:</span>
                    <span class="highlight-gold">$${card.rewardsEarned.toFixed(2)}</span>
                </div>
                <div class="card-detail-row">
                    <span>Annual Fee:</span>
                    <span>$${card.annualFee}</span>
                </div>
                <div class="card-detail-row">
                    <span>Status:</span>
                    <span class="status-badge ${card.status === 'Active' ? 'status-active' : 'status-inactive'}">${card.status}</span>
                </div>
            </div>
        </div>
    `).join('');
    
    updateCardSelects();
}

function updateCardSelects() {
    const transactionCard = document.getElementById('transaction-card');
    
    if (!transactionCard) return;
    
    transactionCard.innerHTML = '<option value="">Select Card</option>';
    
    cards.filter(c => c.status === 'Active').forEach(card => {
        transactionCard.innerHTML += `<option value="${card.id}">${card.cardType} Card - ${formatCardNumber(card.cardNumber)} (Available: $${card.availableCredit.toFixed(2)})</option>`;
    });
}

function updateCardAccountSelect() {
    const cardAccount = document.getElementById('card-account');
    
    if (!cardAccount) return;
    
    cardAccount.innerHTML = '<option value="">Select Account</option>';
    
    accounts.forEach(acc => {
        cardAccount.innerHTML += `<option value="${acc.id}">${acc.name} - #${acc.id} ($${acc.balance.toFixed(2)})</option>`;
    });
}

function generateCardNumber() {
    let cardNumber = '';
    for (let i = 0; i < 16; i++) {
        cardNumber += Math.floor(Math.random() * 10);
    }
    return cardNumber;
}

function generateCVV() {
    return Math.floor(100 + Math.random() * 900).toString();
}

function getCardExpiryDate() {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 5);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${month}/${year}`;
}

function formatCardNumber(number) {
    return number.replace(/(\d{4})(?=\d)/g, '$1 ');
}

updateDashboard();