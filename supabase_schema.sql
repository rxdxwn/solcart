-- =========================================================================
-- SOLCart Database Initialization Schema (Supabase PostgreSQL)
-- Run this script in your Supabase SQL Editor to initialize all tables
-- and seed initial records (settings, staff simulation, UAE gift card).
-- =========================================================================

-- 1. CLEANUP (Optional - uncomment if reset is needed)
-- DROP TABLE IF EXISTS activity_logs CASCADE;
-- DROP TABLE IF EXISTS tickets CASCADE;
-- DROP TABLE IF EXISTS transactions CASCADE;
-- DROP TABLE IF EXISTS orders CASCADE;
-- DROP TABLE IF EXISTS products CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
-- DROP TABLE IF EXISTS settings CASCADE;

-- 2. CREATE TABLES

-- A. Settings Table (Single-row configuration)
CREATE TABLE IF NOT EXISTS settings (
    id VARCHAR(32) PRIMARY KEY DEFAULT 'default',
    marketplace_markup NUMERIC(5,2) DEFAULT 0.00,
    supported_cryptos JSONB DEFAULT '["SOL", "USDC"]'::jsonb,
    default_sol_wallet VARCHAR(128) DEFAULT 'So11111111111111111111111111111111111111112',
    rpc_provider VARCHAR(128) DEFAULT 'Helius Mainnet Beta',
    email_alerts BOOLEAN DEFAULT false,
    maintenance_mode BOOLEAN DEFAULT false,
    tax_rate NUMERIC(5,2) DEFAULT 0.00,
    shipping_fee_usd NUMERIC(10,2) DEFAULT 0.00,
    free_shipping_threshold_usd NUMERIC(10,2) DEFAULT 0.00,
    feature_flags JSONB DEFAULT '{"autoSwap": true, "mockFulfillment": true, "analyticsDashboard": true}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- B. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(128) PRIMARY KEY,
    email VARCHAR(256) UNIQUE NOT NULL,
    name VARCHAR(256) NOT NULL,
    password_hash VARCHAR(256),
    role VARCHAR(64) DEFAULT 'customer',
    is_verified BOOLEAN DEFAULT false,
    verification_code VARCHAR(32),
    reset_code VARCHAR(32),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- C. Products Table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(128) PRIMARY KEY,
    name VARCHAR(256) NOT NULL,
    description TEXT,
    brand VARCHAR(128),
    image TEXT,
    category VARCHAR(128) DEFAULT 'Retail',
    retail_price NUMERIC(10,2) NOT NULL,
    marketplace_price NUMERIC(10,2) NOT NULL,
    stock_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    rating NUMERIC(3,2) DEFAULT 5.00,
    reviews_count INTEGER DEFAULT 0,
    specs JSONB DEFAULT '{}'::jsonb,
    reviews JSONB DEFAULT '[]'::jsonb,
    estimated_delivery VARCHAR(128) DEFAULT 'Instant Digital Delivery',
    retailer_id VARCHAR(128) DEFAULT 'amazon',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- D. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(128) PRIMARY KEY,
    wallet_address VARCHAR(128) NOT NULL,
    customer_details JSONB NOT NULL,
    shipping_address JSONB,
    items JSONB NOT NULL,
    retailer_id VARCHAR(128) DEFAULT 'amazon',
    retail_price_usd NUMERIC(10,2) NOT NULL,
    paid_sol NUMERIC(16,8) NOT NULL,
    received_usdc NUMERIC(10,2) NOT NULL,
    tx_hash VARCHAR(256) NOT NULL,
    swap_tx_hash VARCHAR(256),
    status VARCHAR(64) DEFAULT 'pending',
    gift_card_code VARCHAR(256),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- E. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(128) PRIMARY KEY,
    order_id VARCHAR(128) REFERENCES orders(id) ON DELETE CASCADE,
    wallet_address VARCHAR(128) NOT NULL,
    type VARCHAR(64) NOT NULL, -- 'payment' or 'swap'
    amount NUMERIC(16,8) NOT NULL,
    token VARCHAR(32) NOT NULL, -- 'SOL' or 'USDC'
    status VARCHAR(64) DEFAULT 'success',
    tx_hash VARCHAR(256) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- F. Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
    id VARCHAR(128) PRIMARY KEY,
    customer VARCHAR(256) NOT NULL,
    email VARCHAR(256) NOT NULL,
    subject VARCHAR(256) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(64) DEFAULT 'open',
    comments JSONB DEFAULT '[]'::jsonb,
    assigned_to VARCHAR(256),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- G. Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR(128) PRIMARY KEY,
    action VARCHAR(128) NOT NULL,
    details TEXT NOT NULL,
    type VARCHAR(64) DEFAULT 'info', -- 'info', 'warning', 'security'
    user_id VARCHAR(128) REFERENCES users(id) ON DELETE SET NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. SEED INITIAL DATA

-- Seed Settings
INSERT INTO settings (id, marketplace_markup, tax_rate)
VALUES ('default', 0.00, 0.00)
ON CONFLICT (id) DO NOTHING;

-- Seed Products
INSERT INTO products (id, name, description, brand, image, category, retail_price, marketplace_price, stock_count, is_featured, rating, reviews_count, specs, reviews, estimated_delivery, retailer_id)
VALUES (
    'p-uhj4n2e39',
    'Gift Card (UAE)',
    'Buy now $50 USD worth of Amazon Gift Card for UAE region only.',
    'Amazon',
    'https://images.unsplash.com/photo-1704204656144-3dd12c110dd8?q=80&w=1618&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'Retail',
    50.00,
    50.00,
    1,
    false,
    4.50,
    1,
    '{"Retailer Sourced": "amazon"}'::jsonb,
    '[{"date": "2026-07-24", "rating": 4.5, "author": "Mohammed Ridhwan", "comment": "Great delivery speed!"}]'::jsonb,
    'Instant Digital Delivery',
    'amazon'
)
ON CONFLICT (id) DO NOTHING;

-- Seed Users (Hashed password for user is 'test' or simulated empty for staff bypass)
INSERT INTO users (id, email, name, password_hash, role, is_verified, created_at)
VALUES 
  ('usr-1784936770112-441', 'rxdhwann@gmail.com', 'Mohammed Ridhwan', 'e1c1c14d10acaece79894914c2a97e29cf061e8021e4890f8e631f9926cd289a', 'customer', true, '2026-07-24T23:46:10.112Z'),
  ('staff-1', 'owner@solcart.io', 'Sarah Owner', '', 'Owner', true, '2025-01-10T12:00:00Z'),
  ('staff-2', 'superadmin@solcart.io', 'Alex SuperAdmin', '', 'Super Admin', true, '2025-01-11T12:00:00Z'),
  ('staff-3', 'finance@solcart.io', 'Fred Finance', '', 'Finance Manager', true, '2025-01-12T12:00:00Z'),
  ('staff-4', 'ops@solcart.io', 'Olivia Operations', '', 'Operations Manager', true, '2025-01-13T12:00:00Z'),
  ('staff-5', 'support@solcart.io', 'Steve Support', '', 'Customer Support', true, '2025-01-14T12:00:00Z'),
  ('staff-6', 'fulfillment@solcart.io', 'Frank Fulfillment', '', 'Fulfillment Manager', true, '2025-01-15T12:00:00Z'),
  ('staff-7', 'analyst@solcart.io', 'Ana Analyst', '', 'Read-Only Analyst', true, '2025-01-16T12:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Seed Order
INSERT INTO orders (id, wallet_address, customer_details, shipping_address, items, retailer_id, retail_price_usd, paid_sol, received_usdc, tx_hash, swap_tx_hash, status, gift_card_code, timestamp)
VALUES (
    'ord-363862',
    'GpTU73xt6bWcPisc9Lt8mUZBva92oF8DUoM2bUmo8yWA',
    '{"name": "Mohammed Ridhwan", "email": "rxdhwann@gmail.com", "phone": "N/A"}'::jsonb,
    '{"id": "addr-digital", "name": "Mohammed Ridhwan", "city": "N/A", "state": "N/A", "country": "Global", "isDefault": true, "postalCode": "N/A", "streetAddress": "Digital Delivery"}'::jsonb,
    '[{"image": "https://images.unsplash.com/photo-1704204656144-3dd12c110dd8?q=80&w=1618&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", "brand": "Amazon", "quantity": 1, "productId": "p-uhj4n2e39", "productName": "Gift Card (UAE)", "retailerId": "amazon", "retailPriceUSD": 50, "marketplacePriceUSD": 50}]'::jsonb,
    'amazon',
    50.75,
    0.68680000,
    50.75,
    '5B7APMuCAX3DmEvaJ6PtfhJLHiuQrWrCfqMv4QuvxQkdAytw4rQvQioCPydM3k16BKpq1vEprn5NH6FsuEA4RF6a',
    'mock_jupiter_swap_m543mjjd1p',
    'delivered',
    'AMZN-111-111-11-1111',
    '2026-07-24T23:53:55.353Z'
)
ON CONFLICT (id) DO NOTHING;

-- Seed Transactions
INSERT INTO transactions (id, order_id, wallet_address, type, amount, token, status, tx_hash, timestamp)
VALUES 
  ('tx-nb4bnphsc', 'ord-363862', 'GpTU73xt6bWcPisc9Lt8mUZBva92oF8DUoM2bUmo8yWA', 'swap', 50.75000000, 'USDC', 'success', 'mock_jupiter_swap_m543mjjd1p', '2026-07-24T23:53:55.359Z'),
  ('tx-efc2rxm2w', 'ord-363862', 'GpTU73xt6bWcPisc9Lt8mUZBva92oF8DUoM2bUmo8yWA', 'payment', 0.68680000, 'SOL', 'success', '5B7APMuCAX3DmEvaJ6PtfhJLHiuQrWrCfqMv4QuvxQkdAytw4rQvQioCPydM3k16BKpq1vEprn5NH6FsuEA4RF6a', '2026-07-24T23:53:55.357Z')
ON CONFLICT (id) DO NOTHING;
