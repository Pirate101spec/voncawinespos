CREATE DATABASE vonca_wines;

USE vonca_wines;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- In a real application, hash this password!
    role VARCHAR(50) DEFAULT 'cashier'
);

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    barcode VARCHAR(255) UNIQUE -- Added barcode column for simulation
);

CREATE TABLE sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    total DECIMAL(10, 2) NOT NULL,
    datetime DATETIME NOT NULL,
    cashier_id INT,
    FOREIGN KEY (cashier_id) REFERENCES users(id)
);

CREATE TABLE sale_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL, -- Price at the time of sale
    FOREIGN KEY (sale_id) REFERENCES sales(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Insert some sample data
INSERT INTO users (username, password, role) VALUES ('cashier1', 'password', 'cashier');
INSERT INTO users (username, password, role) VALUES ('admin', 'adminpass', 'admin');

INSERT INTO products (name, price, barcode) VALUES ('Red Wine - Merlot', 1500.00, '123456789012');
INSERT INTO products (name, price, barcode) VALUES ('White Wine - Chardonnay', 1200.00, '987654321098');
INSERT INTO products (name, price, barcode) VALUES ('Sparkling Wine - Brut', 2000.00, '112233445566');
INSERT INTO products (name, price, barcode) VALUES ('Rose Wine - Zinfandel', 1350.00, '665544332211');
INSERT INTO products (name, price, barcode) VALUES ('Dessert Wine - Port', 2500.00, '009988776655');