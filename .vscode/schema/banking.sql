CREATE TABLE Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(50),
    state VARCHAR(50),
    zip_code VARCHAR(10),
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_name (last_name, first_name)
);
CREATE TABLE accounts (
    account_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    account_type ENUM('Savings', 'Checking', 'Business') NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 0.00,
    status ENUM('Active', 'Inactive', 'Closed') DEFAULT 'Active',
    created_date DATE NOT NULL,
    closed_date DATE,
    interest_rate DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    INDEX idx_customer (user_id),
    INDEX idx_account_number (account_number),
    INDEX idx_status (status)
);
CREATE TABLE transactions (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    account_id INT NOT NULL,
    transaction_type ENUM('Deposit', 'Withdraw', 'Transfer') NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    balance_after DECIMAL(15, 2) NOT NULL,
    description TEXT,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reference_number VARCHAR(50) UNIQUE,
    status ENUM('Completed', 'Pending', 'Failed') DEFAULT 'Completed',
    FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE,
    INDEX idx_account (account_id),
    INDEX idx_date (transaction_date),
    INDEX idx_type (transaction_type),
    INDEX idx_reference (reference_number)
);
CREATE TABLE transfers (
    transfer_id INT PRIMARY KEY AUTO_INCREMENT,
    from_account_id INT NOT NULL,
    to_account_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    transfer_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    status ENUM('Completed', 'Pending', 'Failed') DEFAULT 'Completed',
    from_transaction_id INT,
    to_transaction_id INT,
    FOREIGN KEY (from_account_id) REFERENCES accounts(account_id),
    FOREIGN KEY (to_account_id) REFERENCES accounts(account_id),
    FOREIGN KEY (from_transaction_id) REFERENCES transactions(transaction_id),
    FOREIGN KEY (to_transaction_id) REFERENCES transactions(transaction_id),
    INDEX idx_from_account (from_account_id),
    INDEX idx_to_account (to_account_id),
    INDEX idx_date (transfer_date)
);

CREATE TABLE account_types (
    type_id INT PRIMARY KEY AUTO_INCREMENT,
    type_name VARCHAR(50) UNIQUE NOT NULL,
    minimum_balance DECIMAL(15, 2) DEFAULT 0.00,
    interest_rate DECIMAL(5, 2) DEFAULT 0.00,
    monthly_fee DECIMAL(10, 2) DEFAULT 0.00,
    description TEXT
);

CREATE TABLE transaction_limits (
    limit_id INT PRIMARY KEY AUTO_INCREMENT,
    account_type VARCHAR(50) NOT NULL,
    daily_withdrawal_limit DECIMAL(15, 2),
    daily_transfer_limit DECIMAL(15, 2),
    transaction_limit DECIMAL(15, 2),
    effective_date DATE NOT NULL
);

CREATE TABLE cards (
    card_id INT PRIMARY KEY AUTO_INCREMENT,
    account_id INT NOT NULL,
    card_number VARCHAR(16) UNIQUE NOT NULL,
    card_type ENUM('Debit', 'Credit') NOT NULL,
    card_holder_name VARCHAR(100) NOT NULL,
    expiry_date DATE NOT NULL,
    cvv VARCHAR(3) NOT NULL,
    credit_limit DECIMAL(15, 2) DEFAULT 0.00,
    available_credit DECIMAL(15, 2) DEFAULT 0.00,
    status ENUM('Active', 'Blocked', 'Expired') DEFAULT 'Active',
    issue_date DATE NOT NULL,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE,
    INDEX idx_account (account_id),
    INDEX idx_card_number (card_number),
    INDEX idx_status (status)
);

CREATE TABLE loans (
    loan_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    account_id INT,
    loan_type ENUM('Personal', 'Home', 'Auto', 'Business', 'Education') NOT NULL,
    loan_amount DECIMAL(15, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL,
    loan_term_months INT NOT NULL,
    monthly_payment DECIMAL(15, 2) NOT NULL,
    outstanding_balance DECIMAL(15, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    next_payment_date DATE,
    status ENUM('Active', 'Paid', 'Defaulted', 'Pending') DEFAULT 'Pending',
    purpose TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id),
    INDEX idx_customer (user_id),
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date)
);

CREATE TABLE loan_payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    loan_id INT NOT NULL,
    payment_amount DECIMAL(15, 2) NOT NULL,
    principal_amount DECIMAL(15, 2) NOT NULL,
    interest_amount DECIMAL(15, 2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method ENUM('Bank Transfer', 'Cash', 'Check', 'Online') DEFAULT 'Bank Transfer',
    remaining_balance DECIMAL(15, 2) NOT NULL,
    status ENUM('Completed', 'Pending', 'Failed') DEFAULT 'Completed',
    FOREIGN KEY (loan_id) REFERENCES loans(loan_id) ON DELETE CASCADE,
    INDEX idx_loan (loan_id),
    INDEX idx_date (payment_date)
);
CREATE VIEW customer_account_summary AS
SELECT 
    u.user_id,
    CONCAT(u.first_name, ' ', u.last_name) AS user_name,
    u.email,
    COUNT(a.account_id) AS total_accounts,
    SUM(a.balance) AS total_balance,
    GROUP_CONCAT(a.account_type) AS account_types
FROM Users u
LEFT JOIN accounts a ON u.user_id = a.user_id
WHERE a.status = 'Active'
GROUP BY u.user_id, u.first_name, u.last_name, u.email;
CREATE VIEW account_transaction_history AS
SELECT
    a.account_id,
    a.account_number,
    u.user_id,
    CONCAT(u.first_name, ' ', u.last_name) AS user_name,
    t.transaction_id,
    t.transaction_type,
    t.amount,
    t.balance_after,
    t.description,
    t.transaction_date,
    t.status
FROM accounts a
JOIN Users u ON a.user_id = u.user_id
JOIN transactions t ON a.account_id = t.account_id
ORDER BY t.transaction_date DESC;
CREATE VIEW daily_transaction_summary AS
SELECT 
    DATE(transaction_date) AS transaction_day,
    transaction_type,
    COUNT(*) AS transaction_count,
    SUM(amount) AS total_amount,
    AVG(amount) AS average_amount
FROM transactions
WHERE status = 'Completed'
GROUP BY DATE(transaction_date), transaction_type;
CREATE VIEW User_loans_summary AS
SELECT 
u.user_id,
    CONCAT(u.first_name, ' ', u.last_name) AS user_name,
    COUNT(l.loan_id) AS total_loans,
    SUM(l.loan_amount) AS total_borrowed,
    SUM(l.outstanding_balance) AS total_outstanding,
    SUM(l.monthly_payment) AS total_monthly_payment
FROM Users u
LEFT JOIN loans l ON u.user_id = l.user_id
WHERE l.status IN ('Active', 'Pending')
GROUP BY u.user_id, u.first_name, u.last_name;
CREATE VIEW active_cards_summary AS
SELECT
    u.user_id,
    CONCAT(u.first_name, ' ', u.last_name) AS user_name,
    ca.card_id,
    ca.card_type,
    ca.card_number,
    ca.expiry_date,
    ca.credit_limit,
    ca.available_credit,
    ca.status,
    a.account_number
FROM Users u
JOIN accounts a ON u.user_id = a.user_id
JOIN cards ca ON a.account_id = ca.account_id
WHERE ca.status = 'Active';
DELIMITER //

CREATE PROCEDURE create_account(
    IN p_user_id INT,
    IN p_account_type VARCHAR(20),
    IN p_initial_deposit DECIMAL(15,2)
)
BEGIN
    DECLARE v_account_number VARCHAR(20);
    DECLARE v_account_id INT;

    SET v_account_number = CONCAT('ACC', LPAD(FLOOR(RAND() * 999999999), 9, '0'));

    INSERT INTO accounts (user_id, account_number, account_type, balance, created_date)
    VALUES (p_user_id, v_account_number, p_account_type, p_initial_deposit, CURDATE());

    SET v_account_id = LAST_INSERT_ID();

    IF p_initial_deposit > 0 THEN
        INSERT INTO transactions (account_id, transaction_type, amount, balance_after, description)
        VALUES (v_account_id, 'Deposit', p_initial_deposit, p_initial_deposit, 'Initial deposit');
    END IF;

    SELECT v_account_id AS account_id, v_account_number AS account_number;
END //;

DELIMITER ;
DELIMITER //

CREATE PROCEDURE process_deposit(
    IN p_account_id INT,
    IN p_amount DECIMAL(15,2),
    IN p_description TEXT
)
BEGIN
    DECLARE v_current_balance DECIMAL(15,2);
    DECLARE v_new_balance DECIMAL(15,2);

    SELECT balance INTO v_current_balance FROM accounts WHERE account_id = p_account_id;

    SET v_new_balance = v_current_balance + p_amount;

    UPDATE accounts SET balance = v_new_balance WHERE account_id = p_account_id;

    INSERT INTO transactions (account_id, transaction_type, amount, balance_after, description)
    VALUES (p_account_id, 'Deposit', p_amount, v_new_balance, p_description);

    SELECT 'Deposit successful' AS message, v_new_balance AS new_balance;
END //

DELIMITER ;
DELIMITER //

CREATE PROCEDURE process_withdrawal(
    IN p_account_id INT,
    IN p_amount DECIMAL(15,2),
    IN p_description TEXT
)
BEGIN
    DECLARE v_current_balance DECIMAL(15,2);
    DECLARE v_new_balance DECIMAL(15,2);

    SELECT balance INTO v_current_balance FROM accounts WHERE account_id = p_account_id;

    IF v_current_balance < p_amount THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient balance';
    END IF;

    SET v_new_balance = v_current_balance - p_amount;

    UPDATE accounts SET balance = v_new_balance WHERE account_id = p_account_id;

    INSERT INTO transactions (account_id, transaction_type, amount, balance_after, description)
    VALUES (p_account_id, 'Withdraw', p_amount, v_new_balance, p_description);

    SELECT 'Withdrawal successful' AS message, v_new_balance AS new_balance;
END //

DELIMITER ;
DELIMITER //

CREATE PROCEDURE process_transfer(
    IN p_from_account_id INT,
    IN p_to_account_id INT,
    IN p_amount DECIMAL(15,2),
    IN p_description TEXT
)
BEGIN
    DECLARE v_from_balance DECIMAL(15,2);
    DECLARE v_to_balance DECIMAL(15,2);
    DECLARE v_new_from_balance DECIMAL(15,2);
    DECLARE v_new_to_balance DECIMAL(15,2);
    DECLARE v_from_trans_id INT;
    DECLARE v_to_trans_id INT;

    START TRANSACTION;

    SELECT balance INTO v_from_balance FROM accounts WHERE account_id = p_from_account_id FOR UPDATE;
    SELECT balance INTO v_to_balance FROM accounts WHERE account_id = p_to_account_id FOR UPDATE;

    IF v_from_balance < p_amount THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient balance for transfer';
    END IF;

    SET v_new_from_balance = v_from_balance - p_amount;
    SET v_new_to_balance = v_to_balance + p_amount;

    UPDATE accounts SET balance = v_new_from_balance WHERE account_id = p_from_account_id;
    UPDATE accounts SET balance = v_new_to_balance WHERE account_id = p_to_account_id;

    INSERT INTO transactions (account_id, transaction_type, amount, balance_after, description)
    VALUES (p_from_account_id, 'Transfer', -p_amount, v_new_from_balance, CONCAT('Transfer to account ', p_to_account_id));
    SET v_from_trans_id = LAST_INSERT_ID();

    INSERT INTO transactions (account_id, transaction_type, amount, balance_after, description)
    VALUES (p_to_account_id, 'Transfer', p_amount, v_new_to_balance, CONCAT('Transfer from account ', p_from_account_id));
    SET v_to_trans_id = LAST_INSERT_ID();

    INSERT INTO transfers (from_account_id, to_account_id, amount, description, from_transaction_id, to_transaction_id)
    VALUES (p_from_account_id, p_to_account_id, p_amount, p_description, v_from_trans_id, v_to_trans_id);

    COMMIT;

    SELECT 'Transfer successful' AS message;
END //

DELIMITER ;
DELIMITER //

CREATE PROCEDURE issue_card(
    IN p_account_id INT,
    IN p_card_type VARCHAR(10),
    IN p_card_holder_name VARCHAR(100),
    IN p_credit_limit DECIMAL(15,2)
)
BEGIN
    DECLARE v_card_number VARCHAR(16);
    DECLARE v_cvv VARCHAR(3);
    DECLARE v_expiry_date DATE;

    SET v_card_number = CONCAT('4', LPAD(FLOOR(RAND() * 999999999999999), 15, '0'));
    SET v_cvv = LPAD(FLOOR(RAND() * 999), 3, '0');
    SET v_expiry_date = DATE_ADD(CURDATE(), INTERVAL 5 YEAR);

    INSERT INTO cards (account_id, card_number, card_type, card_holder_name, expiry_date, cvv, 
                       credit_limit, available_credit, issue_date)
    VALUES (p_account_id, v_card_number, p_card_type, p_card_holder_name, v_expiry_date, v_cvv,
            p_credit_limit, p_credit_limit, CURDATE());

    SELECT LAST_INSERT_ID() AS card_id, v_card_number AS card_number, v_expiry_date AS expiry_date;
END //

DELIMITER ;
DELIMITER //

CREATE PROCEDURE apply_for_loan(
    IN p_user_id INT,
    IN p_account_id INT,
    IN p_loan_type VARCHAR(20),
    IN p_loan_amount DECIMAL(15,2),
    IN p_interest_rate DECIMAL(5,2),
    IN p_loan_term_months INT,
    IN p_purpose TEXT
)
BEGIN
    DECLARE v_monthly_payment DECIMAL(15,2);
    DECLARE v_end_date DATE;
    DECLARE v_monthly_rate DECIMAL(10,8);

    SET v_monthly_rate = p_interest_rate / 100 / 12;
    SET v_monthly_payment = p_loan_amount * v_monthly_rate * POWER(1 + v_monthly_rate, p_loan_term_months) 
                           / (POWER(1 + v_monthly_rate, p_loan_term_months) - 1);

    SET v_end_date = DATE_ADD(CURDATE(), INTERVAL p_loan_term_months MONTH);

    INSERT INTO loans (user_id, account_id, loan_type, loan_amount, interest_rate, 
                       loan_term_months, monthly_payment, outstanding_balance, 
                       start_date, end_date, next_payment_date, purpose)
    VALUES (p_user_id, p_account_id, p_loan_type, p_loan_amount, p_interest_rate,
            p_loan_term_months, v_monthly_payment, p_loan_amount,
            CURDATE(), v_end_date, DATE_ADD(CURDATE(), INTERVAL 1 MONTH), p_purpose);

    SELECT LAST_INSERT_ID() AS loan_id, v_monthly_payment AS monthly_payment, v_end_date AS end_date;
END //

DELIMITER ;
DELIMITER //

CREATE PROCEDURE make_loan_payment(
    IN p_loan_id INT,
    IN p_payment_amount DECIMAL(15,2),
    IN p_payment_method VARCHAR(20)
)
BEGIN
    DECLARE v_interest_rate DECIMAL(5,2);
    DECLARE v_outstanding DECIMAL(15,2);
    DECLARE v_interest_amount DECIMAL(15,2);
    DECLARE v_principal_amount DECIMAL(15,2);
    DECLARE v_remaining_balance DECIMAL(15,2);

    SELECT interest_rate, outstanding_balance 
    INTO v_interest_rate, v_outstanding 
    FROM loans WHERE loan_id = p_loan_id;

    SET v_interest_amount = v_outstanding * (v_interest_rate / 100 / 12);
    SET v_principal_amount = p_payment_amount - v_interest_amount;
    SET v_remaining_balance = v_outstanding - v_principal_amount;

    INSERT INTO loan_payments (loan_id, payment_amount, principal_amount, interest_amount, 
                               payment_method, remaining_balance)
    VALUES (p_loan_id, p_payment_amount, v_principal_amount, v_interest_amount,
            p_payment_method, v_remaining_balance);

    UPDATE loans 
    SET outstanding_balance = v_remaining_balance,
        next_payment_date = DATE_ADD(next_payment_date, INTERVAL 1 MONTH),
        status = CASE WHEN v_remaining_balance <= 0 THEN 'Paid' ELSE status END
    WHERE loan_id = p_loan_id;

    SELECT 'Payment successful' AS message, v_remaining_balance AS remaining_balance;
END //

DELIMITER ;
INSERT INTO Users (first_name, last_name, email, phone, address, city, state, zip_code, date_of_birth) VALUES
('John', 'Doe', 'john.doe@email.com', '555-0101', '123 Main St', 'New York', 'NY', '10001', '1985-05-15'),
('Jane', 'Smith', 'jane.smith@email.com', '555-0102', '456 Oak Ave', 'Los Angeles', 'CA', '90001', '1990-08-22'),
('Robert', 'Johnson', 'robert.j@email.com', '555-0103', '789 Pine Rd', 'Chicago', 'IL', '60601', '1978-12-10'),
('Emily', 'Williams', 'emily.w@email.com', '555-0104', '321 Elm St', 'Houston', 'TX', '77001', '1995-03-28');

-- Insert account types
INSERT INTO account_types (type_name, minimum_balance, interest_rate, monthly_fee, description) VALUES
('Savings', 100.00, 2.50, 0.00, 'Standard savings account with interest'),
('Checking', 0.00, 0.00, 5.00, 'Everyday checking account'),
('Business', 500.00, 1.50, 15.00, 'Business account for commercial use');

-- Insert transaction limits
INSERT INTO transaction_limits (account_type, daily_withdrawal_limit, daily_transfer_limit, transaction_limit, effective_date) VALUES
('Savings', 1000.00, 5000.00, 500.00, '2024-01-01'),
('Checking', 2000.00, 10000.00, 1000.00, '2024-01-01'),
('Business', 10000.00, 50000.00, 5000.00, '2024-01-01');

-- Create sample accounts using stored procedure
CALL create_account(1, 'Savings', 5000.00);
CALL create_account(1, 'Checking', 2500.00);
CALL create_account(2, 'Savings', 10000.00);
CALL create_account(3, 'Checking', 1500.00);
CALL create_account(4, 'Business', 25000.00);

-- Issue sample cards
CALL issue_card(1, 'Debit', 'John Doe', 0.00);
CALL issue_card(2, 'Credit', 'John Doe', 5000.00);
CALL issue_card(3, 'Debit', 'Jane Smith', 0.00);

-- Apply for sample loans
CALL apply_for_loan(1, 1, 'Personal', 10000.00, 8.5, 36, 'Home renovation');
CALL apply_for_loan(2, 3, 'Auto', 25000.00, 6.5, 60, 'Car purchase');
CALL apply_for_loan(3, 4, 'Business', 50000.00, 7.0, 84, 'Business expansion');