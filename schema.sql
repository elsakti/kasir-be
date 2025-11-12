-- Database Schema for Restaurant API
-- Updated with English naming conventions

-- Drop tables if exists
DROP TABLE IF EXISTS cart CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Create Categories Table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Create Products Table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    price INTEGER NOT NULL,
    is_available BOOLEAN DEFAULT true,
    image VARCHAR(255),
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL
);

-- Create Cart Table
CREATE TABLE cart (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_price INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Orders Table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    total_amount INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Order Items Table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    total_price INTEGER NOT NULL,
    notes TEXT
);

-- Insert Initial Categories
INSERT INTO categories (id, name) VALUES
(1, 'Makanan'),
(2, 'Minuman'),
(3, 'Cemilan');

-- Reset sequence for categories
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));

-- Insert Initial Products
INSERT INTO products (id, code, name, price, is_available, image, category_id) VALUES
(1, 'K-01', 'Sate Ayam', 16000, true, 'sate-ayam.jpg', 1),
(2, 'K-02', 'Nasi Goreng Telur', 14000, true, 'nasi-goreng-telor.jpg', 1),
(3, 'K-03', 'Nasi Rames', 12000, true, 'nasi-rames.jpg', 1),
(4, 'K-04', 'Lontong Opor Ayam', 18000, true, 'lontong-opor-ayam.jpg', 1),
(5, 'K-05', 'Mie Goreng', 13000, true, 'mie-goreng.jpg', 1),
(6, 'K-06', 'Bakso', 10000, true, 'bakso.jpg', 1),
(7, 'K-07', 'Mie Ayam Bakso', 14000, true, 'mie-ayam-bakso.jpg', 1),
(8, 'K-08', 'Pangsit 6 pcs', 5000, true, 'pangsit.jpg', 3),
(9, 'K-09', 'Kentang Goreng', 5000, true, 'kentang-goreng.jpg', 3),
(10, 'K-010', 'Cheese Burger', 15000, true, 'cheese-burger.jpg', 3),
(11, 'K-011', 'Coffe Late', 15000, true, 'coffe-late.jpg', 2),
(12, 'K-012', 'Es Jeruk', 7000, true, 'es-jeruk.jpg', 2),
(13, 'K-013', 'Es Teh', 5000, true, 'es-teh.jpg', 2),
(14, 'K-014', 'Teh Hangat', 3000, true, 'teh-hangat.jpg', 2);

-- Reset sequence for products
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));

-- Insert Sample Orders
INSERT INTO orders (id, total_amount) VALUES
(1, 60000),
(2, 23000),
(3, 16000);

-- Insert Order Items for Order 1
INSERT INTO order_items (id, order_id, product_id, quantity, total_price, notes) VALUES
(1, 1, 1, 2, 32000, 'Semuanya Pedas'),
(2, 1, 2, 2, 28000, NULL);

-- Insert Order Items for Order 2
INSERT INTO order_items (id, order_id, product_id, quantity, total_price, notes) VALUES
(3, 2, 6, 1, 10000, 'Bakso Kosongan'),
(4, 2, 5, 1, 13000, NULL);

-- Insert Order Items for Order 3
INSERT INTO order_items (id, order_id, product_id, quantity, total_price) VALUES
(5, 3, 1, 1, 16000);

-- Reset sequences
SELECT setval('orders_id_seq', (SELECT MAX(id) FROM orders));
SELECT setval('order_items_id_seq', (SELECT MAX(id) FROM order_items));

-- Create Indexes for better performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_cart_product ON cart(product_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
