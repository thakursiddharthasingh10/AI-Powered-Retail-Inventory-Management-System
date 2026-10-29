-- ====================================================================
-- Enterprise Retail Management, Inventory Control & AI Intelligence System
-- 02_indexes_constraints.sql - Performance Indexes & Relational Constraints
-- RDBMS: MySQL 8.x / H2 MySQL Compatibility Mode
-- ====================================================================

-- 1. Product Lookups & Search Performance
CREATE INDEX idx_products_sku ON products (sku);
CREATE INDEX idx_products_barcode ON products (barcode);
CREATE INDEX idx_products_category ON products (category_id);
CREATE INDEX idx_products_active ON products (is_active);
CREATE INDEX idx_products_name ON products (name);

-- 2. Inventory & Stock Status Tracking
CREATE INDEX idx_inventory_lookup ON inventory (product_id, warehouse_id);
CREATE INDEX idx_inventory_quantity ON inventory (quantity);
CREATE INDEX idx_inventory_reserved ON inventory (reserved_quantity);

-- 3. Stock Movement Ledger (Audit & History)
CREATE INDEX idx_sm_product_date ON stock_movements (product_id, created_at);
CREATE INDEX idx_sm_warehouse_date ON stock_movements (warehouse_id, created_at);
CREATE INDEX idx_sm_type ON stock_movements (movement_type);
CREATE INDEX idx_sm_reference ON stock_movements (reference_type, reference_id);

-- 4. Sales & Time-Series Reporting
CREATE INDEX idx_sales_date ON sales (sale_date);
CREATE INDEX idx_sales_invoice ON sales (invoice_number);
CREATE INDEX idx_sales_store ON sales (store_id, sale_date);
CREATE INDEX idx_sales_cashier ON sales (cashier_user_id);
CREATE INDEX idx_sales_payment_status ON sales (payment_status);

-- 5. Sale Line Items Performance
CREATE INDEX idx_si_sale_id ON sale_items (sale_id);
CREATE INDEX idx_si_product_id ON sale_items (product_id);

-- 6. Purchase Order & Procurement Workflow
CREATE INDEX idx_po_number ON purchase_orders (po_number);
CREATE INDEX idx_po_supplier ON purchase_orders (supplier_id);
CREATE INDEX idx_po_status ON purchase_orders (status);
CREATE INDEX idx_po_created_at ON purchase_orders (created_at);

-- 7. Goods Receipt Lookups
CREATE INDEX idx_gr_po_id ON goods_receipts (purchase_order_id);
CREATE INDEX idx_gr_received_at ON goods_receipts (received_at);

-- 8. Stock Transfers Between Warehouses
CREATE INDEX idx_st_status ON stock_transfers (status);
CREATE INDEX idx_st_source ON stock_transfers (source_warehouse_id);
CREATE INDEX idx_st_destination ON stock_transfers (destination_warehouse_id);
CREATE INDEX idx_st_created_at ON stock_transfers (created_at);

-- 9. Sales Returns & Refunds
CREATE INDEX idx_sr_sale_id ON sales_returns (sale_id);
CREATE INDEX idx_sr_return_num ON sales_returns (return_number);
CREATE INDEX idx_sr_status ON sales_returns (status);

-- 10. Notifications & Alert Center
CREATE INDEX idx_notif_user_read ON notifications (target_user_id, is_read);
CREATE INDEX idx_notif_role_read ON notifications (target_role, is_read);
CREATE INDEX idx_notif_created ON notifications (created_at);

-- 11. Audit Logs for Security Compliance
CREATE INDEX idx_audit_actor ON audit_logs (actor_username);
CREATE INDEX idx_audit_entity ON audit_logs (entity_name, entity_id);
CREATE INDEX idx_audit_created ON audit_logs (created_at);

-- 12. AI Forecast Lookups
CREATE INDEX idx_fr_product_horizon ON forecast_results (product_id, horizon_days, forecast_date);
