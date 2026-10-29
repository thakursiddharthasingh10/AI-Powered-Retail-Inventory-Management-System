-- ====================================================================
-- Enterprise Retail Management, Inventory Control & AI Intelligence System
-- 03_seed_demo_data.sql - Realistic Demo Seed Data
-- ====================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Insert Roles
INSERT INTO roles (id, name, description) VALUES
(1, 'ROLE_ADMIN', 'System Administrator with full operational & configuration privileges'),
(2, 'ROLE_MANAGER', 'Store Manager supervising store inventory, purchase approvals & analytics'),
(3, 'ROLE_INVENTORY_STAFF', 'Inventory Staff handling warehouse receipts, counts & transfers'),
(4, 'ROLE_CASHIER', 'Point of Sale Cashier handling billing, invoices & sales returns')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Insert Users (Default Password: Password@123)
-- BCrypt hash for 'Password@123': $2a$10$7EzI2XzV4gXqBfZ8v0K.1eJkG1wP5mXbI6p3O.2t1z3qU.m1Xm7eq (will be updated on boot)
INSERT INTO users (id, username, email, password_hash, full_name, phone, is_active) VALUES
(1, 'admin', 'admin@retailcorp.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Aarav Sharma (Admin)', '+91-9876543210', TRUE),
(2, 'manager', 'manager.delhi@retailcorp.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Priya Patel (Store Manager)', '+91-9876543211', TRUE),
(3, 'inventory', 'staff.cdc@retailcorp.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Rohan Gupta (Inventory Lead)', '+91-9876543212', TRUE),
(4, 'cashier', 'cashier.pos1@retailcorp.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Neha Verma (POS Cashier)', '+91-9876543213', TRUE)
ON DUPLICATE KEY UPDATE username=VALUES(username);

-- 3. Map Users to Roles
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1), -- admin -> ROLE_ADMIN
(2, 2), -- manager -> ROLE_MANAGER
(3, 3), -- inventory -> ROLE_INVENTORY_STAFF
(4, 4)  -- cashier -> ROLE_CASHIER
ON DUPLICATE KEY UPDATE role_id=VALUES(role_id);

-- 4. Insert Stores
INSERT INTO stores (id, code, name, address, city, state, phone, is_active) VALUES
(1, 'STR-DEL-01', 'Delhi Flagship MegaStore', 'Sector 18, Connaught Place', 'New Delhi', 'Delhi', '+91-11-23456789', TRUE),
(2, 'STR-NOI-02', 'Noida CyberCity Hub', 'Plot 4, Sector 62', 'Noida', 'Uttar Pradesh', '+91-120-4567890', TRUE)
ON DUPLICATE KEY UPDATE code=VALUES(code);

-- 5. User Store Assignments
INSERT INTO user_store_assignments (user_id, store_id, is_primary) VALUES
(1, 1, TRUE),
(1, 2, FALSE),
(2, 1, TRUE),
(3, 1, TRUE),
(4, 1, TRUE)
ON DUPLICATE KEY UPDATE is_primary=VALUES(is_primary);

-- 6. Insert Warehouses
INSERT INTO warehouses (id, store_id, code, name, location, capacity, is_active) VALUES
(1, 1, 'WH-CDC-01', 'Central Distribution Center (CDC)', 'Okhla Industrial Area Phase-III, New Delhi', 50000, TRUE),
(2, 1, 'WH-RET-01', 'Store Floor Warehouse Delhi', 'Connaught Place Backroom, New Delhi', 8000, TRUE),
(3, 2, 'WH-NOI-01', 'Noida Store Fulfillment Warehouse', 'Sector 62 Basement Bay, Noida', 12000, TRUE)
ON DUPLICATE KEY UPDATE code=VALUES(code);

-- 7. Insert Categories
INSERT INTO categories (id, code, name, description, is_active) VALUES
(1, 'CAT-ELEC', 'Consumer Electronics', 'Smartphones, audio, smart watches, accessories', TRUE),
(2, 'CAT-GROC', 'Packaged Groceries', 'Packaged organic foods, beverages, grains', TRUE),
(3, 'CAT-APPR', 'Apparel & Fashion', 'Men, women, and kids apparel & activewear', TRUE),
(4, 'CAT-HOME', 'Home & Kitchen Appliances', 'Blenders, electric kettles, cookware, storage', TRUE),
(5, 'CAT-CARE', 'Personal Care & Wellness', 'Skin care, hair care, grooming essentials', TRUE)
ON DUPLICATE KEY UPDATE code=VALUES(code);

-- 8. Insert Suppliers
INSERT INTO suppliers (id, code, name, contact_person, email, phone, address, lead_time_days, is_active) VALUES
(1, 'SUP-TECH', 'Zenith Tech Distributors Ltd', 'Rajesh Malhotra', 'orders@zenithtech.in', '+91-9811002233', 'Nehru Place, New Delhi', 3, TRUE),
(2, 'SUP-AGRO', 'GreenEarth Organics & Agro Corp', 'Sunita Rao', 'procurement@greenearth.com', '+91-9822334455', 'Karnal Industrial Area, Haryana', 2, TRUE),
(3, 'SUP-FASH', 'Vogue Apparel Supply Chain', 'Amit Singhania', 'b2b@vogueapparel.in', '+91-9833445566', 'Ludhiana Textile Park, Punjab', 5, TRUE),
(4, 'SUP-APPL', 'Prestige Home Innovations', 'Kavita Menon', 'sales@prestigeappliances.com', '+91-9844556677', 'Peenya Industrial Estate, Bengaluru', 4, TRUE)
ON DUPLICATE KEY UPDATE code=VALUES(code);

-- 9. Insert Products
INSERT INTO products (id, category_id, sku, barcode, name, brand, description, unit, cost_price, selling_price, reorder_level, safety_stock, is_active) VALUES
(1, 1, 'SKU-ELEC-001', '8901234001', 'Wireless Noise-Canceling Headphones', 'SoundMaster', 'Over-ear active noise cancellation with 40h battery life', 'PCS', 2200.00, 3999.00, 15, 5, TRUE),
(2, 1, 'SKU-ELEC-002', '8901234002', 'Fast Charging Power Bank 20000mAh', 'PowerGrid', '22.5W dual USB output with Type-C Power Delivery', 'PCS', 850.00, 1699.00, 20, 8, TRUE),
(3, 1, 'SKU-ELEC-003', '8901234003', 'Smart Fitness Watch Series 5', 'PulseFit', 'Heart rate, SpO2, GPS tracking, AMOLED display', 'PCS', 1800.00, 3299.00, 12, 5, TRUE),
(4, 2, 'SKU-GROC-001', '8901234004', 'Organic Royal Basmati Rice 5kg', 'NaturePurity', 'Aged premium long-grain aromatic basmati rice', 'BAG', 480.00, 699.00, 30, 10, TRUE),
(5, 2, 'SKU-GROC-002', '8901234005', 'Cold Pressed Virgin Coconut Oil 1L', 'NaturePurity', '100% pure cold-pressed edible coconut oil', 'BTL', 280.00, 420.00, 25, 8, TRUE),
(6, 2, 'SKU-GROC-003', '8901234006', 'Premium California Almonds 500g', 'NutriBites', 'Hand-picked supreme California whole almonds', 'PAC', 350.00, 549.00, 20, 5, TRUE),
(7, 3, 'SKU-APPR-001', '8901234007', 'Classic Crewneck Cotton T-Shirt', 'UrbanThread', '100% bio-washed combed cotton breathable t-shirt', 'PCS', 220.00, 599.00, 40, 15, TRUE),
(8, 3, 'SKU-APPR-002', '8901234008', 'Slim-Fit Stretch Denim Jeans', 'UrbanThread', 'Comfortable denim with 2% elastane for daily wear', 'PCS', 650.00, 1499.00, 25, 10, TRUE),
(9, 4, 'SKU-HOME-001', '8901234009', 'Stainless Steel Electric Kettle 1.8L', 'KitchenPro', '1500W rapid boil with auto shut-off safety feature', 'PCS', 520.00, 999.00, 15, 5, TRUE),
(10, 4, 'SKU-HOME-002', '8901234010', 'High-Speed 3-Jar Mixer Grinder 750W', 'KitchenPro', 'Heavy-duty copper motor with stainless steel blades', 'PCS', 1650.00, 2899.00, 10, 4, TRUE),
(11, 5, 'SKU-CARE-001', '8901234011', 'Herbal Aloe Vera Hydrating Gel 250ml', 'Botanica', 'Paraben-free pure soothing skin hydrator', 'TUB', 110.00, 249.00, 30, 10, TRUE),
(12, 5, 'SKU-CARE-002', '8901234012', 'Argan Oil Anti-Hairfall Shampoo 300ml', 'Botanica', 'Enriched with vitamin E and moroccan argan oil', 'BTL', 190.00, 399.00, 25, 8, TRUE)
ON DUPLICATE KEY UPDATE sku=VALUES(sku);

-- 10. Insert Inventory Quantities (Across Warehouses)
INSERT INTO inventory (id, product_id, warehouse_id, quantity, reserved_quantity, last_counted_at) VALUES
(1, 1, 1, 45, 2, CURRENT_TIMESTAMP), -- Headphones @ CDC
(2, 1, 2, 8, 0, CURRENT_TIMESTAMP),  -- Headphones @ Retail Delhi (Low Stock!)
(3, 2, 1, 80, 5, CURRENT_TIMESTAMP), -- Powerbank @ CDC
(4, 2, 2, 18, 0, CURRENT_TIMESTAMP), -- Powerbank @ Retail Delhi
(5, 3, 1, 25, 1, CURRENT_TIMESTAMP), -- Smartwatch @ CDC
(6, 3, 2, 4, 0, CURRENT_TIMESTAMP),  -- Smartwatch @ Retail Delhi (Low Stock!)
(7, 4, 1, 120, 0, CURRENT_TIMESTAMP),-- Basmati Rice @ CDC
(8, 4, 2, 35, 0, CURRENT_TIMESTAMP), -- Basmati Rice @ Retail Delhi
(9, 5, 1, 90, 0, CURRENT_TIMESTAMP), -- Coconut Oil @ CDC
(10, 5, 2, 22, 0, CURRENT_TIMESTAMP),-- Coconut Oil @ Retail Delhi
(11, 6, 1, 65, 0, CURRENT_TIMESTAMP),-- Almonds @ CDC
(12, 6, 2, 12, 0, CURRENT_TIMESTAMP),-- Almonds @ Retail Delhi (Low Stock!)
(13, 7, 1, 150, 0, CURRENT_TIMESTAMP),-- T-Shirt @ CDC
(14, 7, 2, 45, 0, CURRENT_TIMESTAMP), -- T-Shirt @ Retail Delhi
(15, 8, 1, 85, 0, CURRENT_TIMESTAMP), -- Jeans @ CDC
(16, 8, 2, 20, 0, CURRENT_TIMESTAMP), -- Jeans @ Retail Delhi
(17, 9, 1, 35, 0, CURRENT_TIMESTAMP), -- Kettle @ CDC
(18, 9, 2, 5, 0, CURRENT_TIMESTAMP),  -- Kettle @ Retail Delhi (Low Stock!)
(19, 10, 1, 22, 0, CURRENT_TIMESTAMP),-- Mixer Grinder @ CDC
(20, 10, 2, 2, 0, CURRENT_TIMESTAMP), -- Mixer Grinder @ Retail Delhi (Critical Low!)
(21, 11, 1, 140, 0, CURRENT_TIMESTAMP),-- Aloe Vera @ CDC
(22, 11, 2, 28, 0, CURRENT_TIMESTAMP),-- Aloe Vera @ Retail Delhi
(23, 12, 1, 75, 0, CURRENT_TIMESTAMP), -- Shampoo @ CDC
(24, 12, 2, 15, 0, CURRENT_TIMESTAMP)  -- Shampoo @ Retail Delhi (Low Stock!)
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);

-- 11. Initial Stock Movements Ledger
INSERT INTO stock_movements (product_id, warehouse_id, movement_type, quantity_changed, balance_after, reference_type, reference_id, reason, created_by_user_id, created_at) VALUES
(1, 1, 'IN', 50, 50, 'PURCHASE_ORDER', 1, 'Initial PO goods received from Zenith Tech', 3, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 20 DAY)),
(1, 1, 'TRANSFER_OUT', -5, 45, 'TRANSFER', 1, 'Stock transfer dispatched to Retail Delhi WH-RET-01', 3, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 15 DAY)),
(1, 2, 'TRANSFER_IN', 5, 5, 'TRANSFER', 1, 'Stock transfer received at Retail Delhi', 3, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 14 DAY)),
(1, 2, 'IN', 5, 10, 'MANUAL_ADJUSTMENT', NULL, 'Physical cycle count adjustment reconciliation', 2, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 10 DAY)),
(1, 2, 'SALE', -2, 8, 'SALE', 1, 'POS Sale billing deduction invoice #INV-202610-0001', 4, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 2 DAY));

-- 12. Insert Purchase Orders
INSERT INTO purchase_orders (id, po_number, supplier_id, destination_warehouse_id, status, total_amount, notes, created_by_user_id, approved_by_user_id, created_at, approved_at) VALUES
(1, 'PO-2026-0001', 1, 1, 'RECEIVED', 110000.00, 'Initial procurement batch of premium headphones', 3, 2, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 25 DAY), DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 24 DAY)),
(2, 'PO-2026-0002', 2, 1, 'APPROVED', 57600.00, 'Replenishment for Basmati Rice and Coconut Oil', 3, 2, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 5 DAY), DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 4 DAY)),
(3, 'PO-2026-0003', 4, 1, 'SUBMITTED', 49500.00, 'Seasonal replenishment for Home Appliances', 3, NULL, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 DAY), NULL)
ON DUPLICATE KEY UPDATE po_number=VALUES(po_number);

-- 13. Purchase Order Items
INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity_ordered, quantity_received, unit_cost, total_cost) VALUES
(1, 1, 50, 50, 2200.00, 110000.00),
(2, 4, 60, 0, 480.00, 28800.00),
(2, 5, 60, 0, 280.00, 28800.00),
(3, 9, 30, 0, 520.00, 15600.00),
(3, 10, 20, 0, 1650.00, 33000.00);

-- 14. Customers
INSERT INTO customers (id, name, phone, email, address, loyalty_points) VALUES
(1, 'Vikram Malhotra', '+91-9988776655', 'vikram.m@gmail.com', 'A-45, Vasant Vihar, New Delhi', 150),
(2, 'Ananya Sharma', '+91-9877665544', 'ananya.sharma@yahoo.com', 'Flat 302, ATS Village, Noida', 220),
(3, 'Rahul Kapoor', '+91-9766554433', 'rahul.k@outlook.com', 'B-12, Greater Kailash-I, New Delhi', 85)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 15. Historical Sales for Time-Series Forecasting & Analytics
-- Generates daily sales across the past 30 days
INSERT INTO sales (id, store_id, warehouse_id, invoice_number, cashier_user_id, customer_id, customer_name, customer_phone, subtotal, tax_rate, tax_amount, discount_amount, total_amount, payment_method, payment_status, sale_date, created_at) VALUES
(1, 1, 2, 'INV-202610-0001', 4, 1, 'Vikram Malhotra', '+91-9988776655', 7998.00, 18.00, 1439.64, 0.00, 9437.64, 'CARD', 'PAID', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 28 DAY), DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 28 DAY)),
(2, 1, 2, 'INV-202610-0002', 4, 2, 'Ananya Sharma', '+91-9877665544', 3398.00, 18.00, 611.64, 200.00, 3809.64, 'UPI', 'PAID', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 25 DAY), DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 25 DAY)),
(3, 1, 2, 'INV-202610-0003', 4, 3, 'Rahul Kapoor', '+91-9766554433', 1998.00, 12.00, 239.76, 0.00, 2237.76, 'CASH', 'PAID', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 22 DAY), DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 22 DAY)),
(4, 1, 2, 'INV-202610-0004', 4, 1, 'Vikram Malhotra', '+91-9988776655', 3999.00, 18.00, 719.82, 150.00, 4568.82, 'CARD', 'PAID', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 18 DAY), DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 18 DAY)),
(5, 1, 2, 'INV-202610-0005', 4, NULL, 'Walk-in Customer', NULL, 1539.00, 5.00, 76.95, 0.00, 1615.95, 'UPI', 'PAID', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 15 DAY), DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 15 DAY)),
(6, 1, 2, 'INV-202610-0006', 4, 2, 'Ananya Sharma', '+91-9877665544', 5798.00, 18.00, 1043.64, 300.00, 6541.64, 'CARD', 'PAID', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 12 DAY), DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 12 DAY)),
(7, 1, 2, 'INV-202610-0007', 4, 3, 'Rahul Kapoor', '+91-9766554433', 2899.00, 18.00, 521.82, 0.00, 3420.82, 'UPI', 'PAID', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 8 DAY), DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 8 DAY)),
(8, 1, 2, 'INV-202610-0008', 4, NULL, 'Walk-in Customer', NULL, 4097.00, 12.00, 491.64, 100.00, 4488.64, 'CASH', 'PAID', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 4 DAY), DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 4 DAY)),
(9, 1, 2, 'INV-202610-0009', 4, 1, 'Vikram Malhotra', '+91-9988776655', 7998.00, 18.00, 1439.64, 400.00, 9037.64, 'CARD', 'PAID', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 DAY), DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 DAY))
ON DUPLICATE KEY UPDATE invoice_number=VALUES(invoice_number);

-- 16. Sale Items (Snapshots)
INSERT INTO sale_items (sale_id, product_id, product_name_snapshot, sku_snapshot, quantity, unit_cost_snapshot, unit_price_snapshot, tax_rate_snapshot, subtotal) VALUES
(1, 1, 'Wireless Noise-Canceling Headphones', 'SKU-ELEC-001', 2, 2200.00, 3999.00, 18.00, 7998.00),
(2, 2, 'Fast Charging Power Bank 20000mAh', 'SKU-ELEC-002', 2, 850.00, 1699.00, 18.00, 3398.00),
(3, 9, 'Stainless Steel Electric Kettle 1.8L', 'SKU-HOME-001', 2, 520.00, 999.00, 12.00, 1998.00),
(4, 1, 'Wireless Noise-Canceling Headphones', 'SKU-ELEC-001', 1, 2200.00, 3999.00, 18.00, 3999.00),
(5, 4, 'Organic Royal Basmati Rice 5kg', 'SKU-GROC-001', 1, 480.00, 699.00, 5.00, 699.00),
(5, 5, 'Cold Pressed Virgin Coconut Oil 1L', 'SKU-GROC-002', 2, 280.00, 420.00, 5.00, 840.00),
(6, 3, 'Smart Fitness Watch Series 5', 'SKU-ELEC-003', 1, 1800.00, 3299.00, 18.00, 3299.00),
(6, 8, 'Slim-Fit Stretch Denim Jeans', 'SKU-APPR-002', 1, 650.00, 1499.00, 12.00, 1499.00),
(7, 10, 'High-Speed 3-Jar Mixer Grinder 750W', 'SKU-HOME-002', 1, 1650.00, 2899.00, 18.00, 2899.00),
(8, 7, 'Classic Crewneck Cotton T-Shirt', 'SKU-APPR-001', 3, 220.00, 599.00, 5.00, 1797.00),
(8, 2, 'Fast Charging Power Bank 20000mAh', 'SKU-ELEC-002', 1, 850.00, 1699.00, 18.00, 1699.00),
(8, 11, 'Herbal Aloe Vera Hydrating Gel 250ml', 'SKU-CARE-001', 2, 110.00, 249.00, 5.00, 498.00),
(9, 1, 'Wireless Noise-Canceling Headphones', 'SKU-ELEC-001', 2, 2200.00, 3999.00, 18.00, 7998.00);

-- 17. Invoices Table
INSERT INTO invoices (sale_id, invoice_number, issue_date, pdf_url, qr_code_data) VALUES
(1, 'INV-202610-0001', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 28 DAY), '/invoices/INV-202610-0001.pdf', 'RETAIL|INV-202610-0001|9437.64|CARD'),
(2, 'INV-202610-0002', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 25 DAY), '/invoices/INV-202610-0002.pdf', 'RETAIL|INV-202610-0002|3809.64|UPI'),
(3, 'INV-202610-0003', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 22 DAY), '/invoices/INV-202610-0003.pdf', 'RETAIL|INV-202610-0003|2237.76|CASH'),
(4, 'INV-202610-0004', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 18 DAY), '/invoices/INV-202610-0004.pdf', 'RETAIL|INV-202610-0004|4568.82|CARD'),
(5, 'INV-202610-0005', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 15 DAY), '/invoices/INV-202610-0005.pdf', 'RETAIL|INV-202610-0005|1615.95|UPI'),
(6, 'INV-202610-0006', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 12 DAY), '/invoices/INV-202610-0006.pdf', 'RETAIL|INV-202610-0006|6541.64|CARD'),
(7, 'INV-202610-0007', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 8 DAY), '/invoices/INV-202610-0007.pdf', 'RETAIL|INV-202610-0007|3420.82|UPI'),
(8, 'INV-202610-0008', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 4 DAY), '/invoices/INV-202610-0008.pdf', 'RETAIL|INV-202610-0008|4488.64|CASH'),
(9, 'INV-202610-0009', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 DAY), '/invoices/INV-202610-0009.pdf', 'RETAIL|INV-202610-0009|9037.64|CARD')
ON DUPLICATE KEY UPDATE invoice_number=VALUES(invoice_number);

-- 18. Stock Transfers
INSERT INTO stock_transfers (id, transfer_number, source_warehouse_id, destination_warehouse_id, status, notes, requested_by_user_id, dispatched_by_user_id, received_by_user_id, created_at, dispatched_at, received_at) VALUES
(1, 'TRF-2026-0001', 1, 2, 'RECEIVED', 'Routine weekly replenishment to Delhi Retail Floor', 2, 3, 3, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 15 DAY), DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 15 DAY), DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 14 DAY)),
(2, 'TRF-2026-0002', 1, 3, 'DISPATCHED', 'Inter-city replenishment to Noida Warehouse', 2, 3, NULL, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 2 DAY), DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 DAY), NULL)
ON DUPLICATE KEY UPDATE transfer_number=VALUES(transfer_number);

INSERT INTO stock_transfer_items (stock_transfer_id, product_id, quantity_requested, quantity_dispatched, quantity_received) VALUES
(1, 1, 5, 5, 5),
(2, 2, 10, 10, 0);

-- 19. Notifications
INSERT INTO notifications (title, message, type, is_read, target_role, target_user_id) VALUES
('Low Stock Alert: Headphones', 'Wireless Noise-Canceling Headphones is at 8 units in Store Floor Warehouse Delhi (Reorder level: 15)', 'LOW_STOCK', FALSE, 'ROLE_MANAGER', 2),
('Critical Low Stock: Mixer Grinder', 'High-Speed 3-Jar Mixer Grinder 750W is at 2 units in Store Floor Warehouse Delhi (Reorder level: 10)', 'LOW_STOCK', FALSE, 'ROLE_MANAGER', 2),
('Purchase Order Awaiting Approval', 'Purchase Order PO-2026-0003 for Prestige Home Innovations requires Manager approval', 'PO_PENDING', FALSE, 'ROLE_MANAGER', 2),
('In-Transit Stock Transfer', 'Stock Transfer TRF-2026-0002 dispatched to Noida Warehouse', 'TRANSFER_PENDING', FALSE, 'ROLE_INVENTORY_STAFF', 3);

-- 20. Audit Logs
INSERT INTO audit_logs (actor_username, action, entity_name, entity_id, details, ip_address) VALUES
('system', 'INITIALIZE', 'SYSTEM', '0', 'Initial database schema and demo seed data loaded successfully', '127.0.0.1'),
('admin', 'USER_ROLE_ASSIGN', 'USER', '2', 'Assigned ROLE_MANAGER to user manager.delhi@retailcorp.com', '127.0.0.1'),
('manager', 'PO_APPROVE', 'PURCHASE_ORDER', '1', 'Approved PO-2026-0001 for Zenith Tech Distributors Ltd', '127.0.0.1'),
('inventory', 'GOODS_RECEIPT', 'GOODS_RECEIPT', '1', 'Received 50 units of SKU-ELEC-001 against PO-2026-0001', '127.0.0.1'),
('cashier', 'SALE_COMPLETE', 'SALE', '9', 'Completed sale INV-202610-0009 total 9037.64 via CARD', '127.0.0.1');

SET FOREIGN_KEY_CHECKS = 1;
