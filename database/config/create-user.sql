INSERT IGNORE INTO users (username, email, password_hash, first_name, last_name, is_verified, role)
VALUES
('admin', 'admin@example.com', '$2a$10$YourHashedPasswordHere', 'Admin', 'User', TRUE, 'admin'),
('testuser', 'user@example.com', '$2a$10$YourHashedPasswordHere', 'Test', 'User', TRUE, 'user');

CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY 'root';
GRANT ALL PRIVILEGES ON authdb.* TO 'root'@'%';
FLUSH PRIVILEGES;
