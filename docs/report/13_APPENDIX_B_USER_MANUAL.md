# Appendix B: System Operator & User Manual

---

## B.1 Getting Started & Authentication

1. Open your web browser and navigate to the application URL (Default: `http://localhost:5173`).
2. The login interface appears:
   - Enter your assigned enterprise **Username** and **Password**.
   - For demo / evaluation purposes, quick-fill buttons are provided for **Admin**, **Manager**, **Cashier**, and **Staff**.
3. Click **Sign In**. The system authenticates your credentials, receives a JWT token, and redirects you to the role-specific dashboard.

---

## B.2 Administrator Guide

### B.2.1 Provisioning New User Accounts
1. In the sidebar, navigate to **System Administration -> Users**.
2. Click **Register New User**.
3. Fill in the employee's **Full Name**, **Username**, **Email**, temporary **Password**, and select one or more **Security Roles** (`ROLE_ADMIN`, `ROLE_MANAGER`, `ROLE_INVENTORY_STAFF`, `ROLE_CASHIER`).
4. Select the user's primary retail store branch and click **Save**.

### B.2.2 Inspecting Audit Logs
1. Navigate to **System Administration -> Audit Logs**.
2. Review the chronological audit trail:
   - Filter by date, user, or action type (e.g. `STOCK_ADJUSTMENT`, `PO_APPROVE`, `SALE_CREATE`).
   - Click any entry to inspect the captured JSON change payload and client IP address.

---

## B.3 Store Manager Guide

### B.3.1 Creating & Approving Purchase Orders
1. Navigate to **Procurement -> Purchase Orders**.
2. Click **Create Purchase Order**:
   - Select the vendor from the supplier dropdown.
   - Select the receiving warehouse facility.
   - Add product items, enter order quantities, and specify agreed unit purchase costs.
   - Click **Save Purchase Order** (created in `DRAFT` status).
3. In the PO table, locate the drafted PO and click **Approve PO**. The status updates to `APPROVED`, authorizing the vendor to dispatch goods.

### B.3.2 Acting on AI Replenishment Recommendations
1. Navigate to **AI Intelligence -> Replenishment**.
2. Review the table of products flagged for restock:
   - Inspect the **Urgency** badge (`CRITICAL`, `MEDIUM`, `NORMAL`).
   - Click the **Help/Formula** icon to view the exact math: Average Daily Demand ($d$), Lead Time ($L$), and Safety Stock ($SS$).
3. Click **Draft PO** next to any item:
   - A pre-filled purchase order modal opens with suggested order quantities and default vendor assignments.
   - Review and click **Generate Purchase Order**.

---

## B.4 Cashier Guide: Point of Sale (POS) Billing

### B.4.1 Counter Checkout Workflow
1. Navigate to **Point of Sale -> POS Billing**.
2. Adding Items:
   - Type a product name or SKU into the search bar, or use a USB barcode scanner to scan the item barcode.
   - Click the product card to add it to the active cart.
   - Adjust quantities using the `+` / `-` buttons.
3. Review Customer & Discounts:
   - Enter customer name and phone number (optional).
   - Apply any approved counter discount.
4. Select Payment Tender:
   - Choose **Cash**, **Card**, or **UPI**.
5. Click **Complete Checkout**:
   - The system deducts stock balances atomically from the primary warehouse.
   - An invoice preview appears with a sequential invoice number.
   - Click **Print Receipt** to send the receipt to an 80mm thermal receipt printer.

### B.4.2 Processing Sales Returns
1. Navigate to **Point of Sale -> Sales History**.
2. Locate the original sale record by invoice number or customer phone.
3. Click **Process Return**:
   - Select the returned line items and enter the return quantity.
   - Check the **Restock Inventory** checkbox if the goods are unopened and resellable.
   - Enter the reason for return and click **Submit Return**.
   - The system generates a return credit record and restores inventory balances accordingly.

---

## B.5 Inventory Staff Guide

### B.5.1 Receiving Goods from Purchase Orders
1. Navigate to **Procurement -> Purchase Orders**.
2. Locate the `APPROVED` purchase order matching the vendor delivery manifest.
3. Click **Receive Goods**:
   - Enter the physically counted received quantity for each line item.
   - Enter inspection notes (e.g. *"All cartons intact, batch QC passed"*).
   - Click **Confirm Receipt**.
4. The system updates the PO status to `RECEIVED`, increments physical warehouse stock balances, and records an immutable `PURCHASE_RECEIPT` entry in the movement ledger.

### B.5.2 Inter-Warehouse Stock Transfers
1. Navigate to **Warehouses -> Stock Transfers**.
2. Initiating a Transfer:
   - Click **New Transfer Request**.
   - Select Origin Warehouse and Destination Warehouse.
   - Add items and quantities, then click **Submit Request** (`REQUESTED` status).
3. Dispatching Goods:
   - Origin warehouse staff inspect the transfer manifest and click **Dispatch Stock**.
   - Origin inventory is decremented and marked `TRANSFER_OUT`.
4. Receiving at Destination:
   - Upon truck arrival at the destination facility, staff click **Receive Transfer**.
   - Destination stock is incremented and marked `TRANSFER_IN`.
