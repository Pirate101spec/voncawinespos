
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','cashier') NOT NULL DEFAULT 'cashier'
);

-- Example insert (password = 'admin123')
INSERT INTO users (username, password, role)
VALUES ('admin', PASSWORD_HASH('admin123', PASSWORD_DEFAULT), 'admin');
