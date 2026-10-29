-- ====================================================================
-- Enterprise Retail Management, Inventory Control & AI Intelligence System
-- 04_demo_queries.sql - Key Analytical, Operational & Viva SQL Queries
-- ====================================================================

-- 1. Low-Stock Alert Query (Products at or below reorder level in any warehouse)
SELECT 
    p.id AS product_id,
    p.sku,
    p.name AS product_name,
    c.name AS category_name,
    w.name AS warehouse_name,
    i.quantity AS current_stock,
    p.reorder_level,
    p.safety_stock,
    (p.reorder_level - i.quantity) AS stock_deficit
FROM inventory i
JOIN products p ON i.product_id = p.id
JOIN categories c ON p.category_id = c.id
JOIN warehouses w ON i.warehouse_id = w.id
WHERE p.is_active = TRUE
  AND i.quantity <= p.reorder_level
ORDER BY (p.reorder_level - i.quantity) DESC;

-- 2. Out-of-Stock Alert Query (Products with zero available stock)
SELECT 
    p.id AS product_id,
    p.sku,
    p.name AS product_name,
    c.name AS category_name,
    w.name AS warehouse_name,
    i.quantity AS current_stock,
    p.reorder_level
FROM inventory i
JOIN products p ON i.product_id = p.id
JOIN categories c ON p.category_id = c.id
JOIN warehouses w ON i.warehouse_id = w.id
WHERE p.is_active = TRUE
  AND i.quantity = 0;

-- 3. Top-Selling Products by Revenue & Quantity
SELECT 
    p.id AS product_id,
    p.sku,
    si.product_name_snapshot AS product_name,
    c.name AS category_name,
    SUM(si.quantity) AS total_units_sold,
    SUM(si.subtotal) AS gross_sales_value,
    SUM(si.quantity * si.unit_cost_snapshot) AS total_cogs,
    (SUM(si.subtotal) - SUM(si.quantity * si.unit_cost_snapshot)) AS estimated_gross_profit,
    ROUND(((SUM(si.subtotal) - SUM(si.quantity * si.unit_cost_snapshot)) / NULLIF(SUM(si.subtotal), 0)) * 100, 2) AS profit_margin_pct
FROM sale_items si
JOIN products p ON si.product_id = p.id
JOIN categories c ON p.category_id = c.id
GROUP BY p.id, p.sku, si.product_name_snapshot, c.name
ORDER BY gross_sales_value DESC;

-- 4. Monthly Sales, Tax, Discount & Net Revenue Summary
SELECT 
    DATE_FORMAT(s.sale_date, '%Y-%m') AS sales_month,
    COUNT(s.id) AS total_invoices,
    SUM(s.subtotal) AS gross_merchandise_value,
    SUM(s.discount_amount) AS total_discounts_given,
    SUM(s.tax_amount) AS total_tax_collected,
    SUM(s.total_amount) AS net_revenue_collected,
    AVG(s.total_amount) AS average_order_value
FROM sales s
WHERE s.payment_status = 'PAID'
GROUP BY DATE_FORMAT(s.sale_date, '%Y-%m')
ORDER BY sales_month DESC;

-- 5. Inventory Valuation by Warehouse (Based on Cost Price Basis)
SELECT 
    w.code AS warehouse_code,
    w.name AS warehouse_name,
    COUNT(DISTINCT i.product_id) AS distinct_sku_count,
    SUM(i.quantity) AS total_inventory_units,
    SUM(i.quantity * p.cost_price) AS total_inventory_cost_value,
    SUM(i.quantity * p.selling_price) AS total_inventory_retail_value,
    (SUM(i.quantity * p.selling_price) - SUM(i.quantity * p.cost_price)) AS potential_gross_margin
FROM inventory i
JOIN products p ON i.product_id = p.id
JOIN warehouses w ON i.warehouse_id = w.id
WHERE p.is_active = TRUE
GROUP BY w.id, w.code, w.name;

-- 6. Supplier Purchase Performance & Order Lead Times
SELECT 
    sup.id AS supplier_id,
    sup.code AS supplier_code,
    sup.name AS supplier_name,
    sup.lead_time_days AS configured_lead_time_days,
    COUNT(po.id) AS total_pos_issued,
    SUM(CASE WHEN po.status = 'RECEIVED' THEN 1 ELSE 0 END) AS pos_received,
    SUM(CASE WHEN po.status = 'APPROVED' THEN 1 ELSE 0 END) AS pos_pending_receipt,
    SUM(po.total_amount) AS total_spend_committed
FROM suppliers sup
LEFT JOIN purchase_orders po ON sup.id = po.supplier_id
GROUP BY sup.id, sup.code, sup.name, sup.lead_time_days
ORDER BY total_spend_committed DESC;

-- 7. Complete Stock Movement Audit Trail for a Given Product (e.g., Headphones)
SELECT 
    sm.id AS movement_id,
    sm.created_at AS movement_timestamp,
    w.name AS warehouse_name,
    sm.movement_type,
    sm.quantity_changed,
    sm.balance_after,
    sm.reference_type,
    sm.reference_id,
    sm.reason,
    u.username AS actor_username
FROM stock_movements sm
JOIN warehouses w ON sm.warehouse_id = w.id
LEFT JOIN users u ON sm.created_by_user_id = u.id
WHERE sm.product_id = 1
ORDER BY sm.created_at ASC;

-- 8. Smart Replenishment Formula (Grounded Data for AI Reorder Recommendation)
-- Daily demand = (Total units sold in last 30 days / 30)
-- Lead time demand = Daily demand * Supplier Lead Time (Days)
-- Reorder point = Lead time demand + Safety Stock
-- Recommended Reorder Qty = GREATEST(0, (Reorder point - Current Available Stock))
SELECT 
    p.id AS product_id,
    p.sku,
    p.name AS product_name,
    w.name AS warehouse_name,
    i.quantity AS current_stock,
    COALESCE(sup.lead_time_days, 3) AS lead_time_days,
    p.safety_stock,
    ROUND(COALESCE(sales_summary.sold_30d, 0) / 30.0, 2) AS avg_daily_demand,
    ROUND((COALESCE(sales_summary.sold_30d, 0) / 30.0) * COALESCE(sup.lead_time_days, 3), 2) AS lead_time_demand,
    ROUND(((COALESCE(sales_summary.sold_30d, 0) / 30.0) * COALESCE(sup.lead_time_days, 3)) + p.safety_stock, 0) AS calculated_reorder_point,
    GREATEST(0, ROUND((((COALESCE(sales_summary.sold_30d, 0) / 30.0) * COALESCE(sup.lead_time_days, 3)) + p.safety_stock) - i.quantity, 0)) AS recommended_order_qty,
    sup.name AS preferred_supplier
FROM inventory i
JOIN products p ON i.product_id = p.id
JOIN warehouses w ON i.warehouse_id = w.id
LEFT JOIN (
    SELECT si.product_id, SUM(si.quantity) AS sold_30d
    FROM sale_items si
    JOIN sales s ON si.sale_id = s.id
    WHERE s.sale_date >= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 30 DAY)
    GROUP BY si.product_id
) sales_summary ON p.id = sales_summary.product_id
LEFT JOIN suppliers sup ON sup.id = 1 -- primary linked vendor
WHERE p.is_active = TRUE
ORDER BY recommended_order_qty DESC;
