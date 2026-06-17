-- PostgreSQL Database Schema for Paper Plane Gifting Platform

-- Users Table (Customers, Admins, B2B Clients, Vendors)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'customer', -- 'customer', 'admin', 'corporate', 'vendor'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vendors Table
CREATE TABLE IF NOT EXISTS vendors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    company VARCHAR(255),
    performance_score DECIMAL(3, 2) DEFAULT 5.00, -- 0.00 to 5.00
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive'
    total_paid DECIMAL(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price INT NOT NULL,
    size VARCHAR(50) NOT NULL, -- 'Small', 'Medium', 'Large'
    image VARCHAR(500),
    stock INT NOT NULL DEFAULT 10,
    vendor_id INT REFERENCES vendors(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    total_price INT NOT NULL,
    status VARCHAR(100) NOT NULL DEFAULT 'Order Placed', -- 'Order Placed', 'Customization', 'Packaging', 'Quality Check', 'Dispatch', 'Delivered'
    ribbon_color VARCHAR(100),
    box_size VARCHAR(50) DEFAULT 'Medium',
    tracking_id VARCHAR(100) UNIQUE,
    payment_status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Paid', 'Failed'
    payment_method VARCHAR(50), -- 'UPI', 'Card', 'Net Banking'
    invoice_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table (Connects Orders to Products)
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE SET NULL,
    quantity INT NOT NULL DEFAULT 1,
    price INT NOT NULL
);

-- Recipients & Personalization Table
CREATE TABLE IF NOT EXISTS recipients (
    id SERIAL PRIMARY KEY,
    order_id INT UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    name VARCHAR(255),
    message TEXT,
    custom_text VARCHAR(255),
    photo_url TEXT,
    logo_url TEXT
);

-- Returns & Refund Management Table
CREATE TABLE IF NOT EXISTS returns (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'Return', 'Replacement', 'Refund'
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected'
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Corporate Gifting Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    corporate_id INT REFERENCES users(id) ON DELETE CASCADE,
    budget INT NOT NULL,
    delivery_date DATE NOT NULL,
    status VARCHAR(100) DEFAULT 'Scheduled', -- 'Scheduled', 'In Progress', 'Completed', 'Cancelled'
    employee_list_url TEXT, -- Path to uploaded CSV/List of employees
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- CRM / Gifting Calendar Table
CREATE TABLE IF NOT EXISTS crm_contacts (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100),
    occasion_type VARCHAR(100) NOT NULL, -- 'birthday', 'anniversary', 'festival', etc.
    occasion_date DATE NOT NULL,
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
