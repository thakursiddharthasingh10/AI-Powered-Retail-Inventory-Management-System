import React, { useState, useEffect } from 'react';
import { Eye, RotateCcw, AlertCircle, Printer } from 'lucide-react';
import { salesApi } from '../services/api';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

export const SalesHistory = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  // View Invoice Modal
  const [selectedSale, setSelectedSale] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Return Modal
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [returnSale, setReturnSale] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [returnReason, setReturnReason] = useState('');
  const [error, setError] = useState('');

  const loadSales = () => {
    setLoading(true);
    salesApi.getAll({ size: 50 })
      .then((res) => {
        if (res.data?.content) setSales(res.data.content);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSales();
  }, []);

  const handleOpenView = (sale) => {
    setSelectedSale(sale);
    setIsViewOpen(true);
  };

  const handleOpenReturn = (sale) => {
    setReturnSale(sale);
    setReturnReason('Customer returned item in original condition');
    const items = sale.items.map(item => ({
      productId: item.product.id,
      productName: item.productNameSnapshot,
      maxQty: item.quantity,
      quantity: item.quantity,
      unitPrice: item.unitPriceSnapshot,
      restockInventory: true,
      selected: true,
    }));
    setReturnItems(items);
    setError('');
    setIsReturnOpen(true);
  };

  const handleProcessReturn = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const activeItems = returnItems.filter(i => i.selected && i.quantity > 0);
      if (activeItems.length === 0) {
        setError('Please select at least one item to return');
        return;
      }

      const payload = {
        saleId: returnSale.id,
        warehouseId: returnSale.warehouse.id,
        reason: returnReason,
        items: activeItems.map(i => ({
          productId: i.productId,
          quantity: Number(i.quantity),
          restockInventory: i.restockInventory,
        })),
      };

      await salesApi.processReturn(payload);
      setIsReturnOpen(false);
      loadSales();
    } catch (err) {
      setError(err.message || 'Failed to process sales return');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--primary)' }}>Sales & Tax Invoices</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Review completed counter transactions, generate invoice reprints, and process authorized merchandise returns
        </p>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Invoice Number</th>
              <th>Date & Time</th>
              <th>Cashier</th>
              <th>Customer</th>
              <th>Subtotal</th>
              <th>GST Tax</th>
              <th>Total Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="10" style={{ textAlign: 'center', padding: '30px' }}>Loading invoices...</td></tr>
            ) : sales.length === 0 ? (
              <tr><td colSpan="10" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No sales transactions found.</td></tr>
            ) : (
              sales.map((s) => (
                <tr key={s.id}>
                  <td><code>{s.invoiceNumber}</code></td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {new Date(s.saleDate).toLocaleString()}
                  </td>
                  <td>{s.cashierUser?.fullName || 'Cashier'}</td>
                  <td style={{ fontWeight: 500 }}>{s.customerName}</td>
                  <td>₹{Number(s.subtotal).toFixed(2)}</td>
                  <td>₹{Number(s.taxAmount).toFixed(2)}</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    ₹{Number(s.totalAmount).toFixed(2)}
                  </td>
                  <td><span style={{ fontSize: '12px' }}>{s.paymentMethod}</span></td>
                  <td>
                    <Badge variant={s.paymentStatus === 'PAID' ? 'success' : 'danger'}>
                      {s.paymentStatus}
                    </Badge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => handleOpenView(s)} className="btn btn-secondary btn-sm" title="View / Print">
                        <Eye size={13} />
                      </button>
                      {s.paymentStatus === 'PAID' && (
                        <button onClick={() => handleOpenReturn(s)} className="btn btn-secondary btn-sm" title="Return / Refund" style={{ color: 'var(--warning)' }}>
                          <RotateCcw size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Invoice Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={`Invoice: ${selectedSale?.invoiceNumber}`}
        maxWidth="600px"
      >
        {selectedSale && (
          <div>
            <div style={{ fontSize: '12.5px', marginBottom: '14px', lineHeight: 1.6 }}>
              <div><strong>Fulfillment Warehouse:</strong> {selectedSale.warehouse?.name}</div>
              <div><strong>Cashier:</strong> {selectedSale.cashierUser?.fullName}</div>
              <div><strong>Customer:</strong> {selectedSale.customerName} ({selectedSale.customerPhone || 'N/A'})</div>
              <div><strong>Date:</strong> {new Date(selectedSale.saleDate).toLocaleString()}</div>
            </div>

            <table style={{ marginBottom: '16px', fontSize: '12.5px' }}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {selectedSale.items?.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600 }}>{item.productNameSnapshot}</td>
                    <td>{item.quantity}</td>
                    <td>₹{Number(item.unitPriceSnapshot).toFixed(2)}</td>
                    <td style={{ fontWeight: 600 }}>₹{Number(item.subtotal).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ textAlign: 'right', fontSize: '13px', lineHeight: 1.6, borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
              <div>Subtotal: ₹{Number(selectedSale.subtotal).toFixed(2)}</div>
              <div>GST Tax ({selectedSale.taxRate}%): +₹{Number(selectedSale.taxAmount).toFixed(2)}</div>
              {Number(selectedSale.discountAmount) > 0 && (
                <div style={{ color: 'var(--danger)' }}>Discount: -₹{Number(selectedSale.discountAmount).toFixed(2)}</div>
              )}
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary)', marginTop: '4px' }}>
                Total Paid: ₹{Number(selectedSale.totalAmount).toFixed(2)} ({selectedSale.paymentMethod})
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => window.print()} className="btn btn-secondary">
                <Printer size={15} /> Print
              </button>
              <button onClick={() => setIsViewOpen(false)} className="btn btn-primary">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Return Modal */}
      <Modal
        isOpen={isReturnOpen}
        onClose={() => setIsReturnOpen(false)}
        title={`Process Return for Invoice ${returnSale?.invoiceNumber}`}
        maxWidth="620px"
      >
        {error && (
          <div style={{ padding: '10px 14px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleProcessReturn}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Select the items being returned. Restocking inventory will return items to <strong>{returnSale?.warehouse?.name}</strong>.
          </p>

          <table style={{ marginBottom: '16px', fontSize: '12.5px' }}>
            <thead>
              <tr>
                <th>Return?</th>
                <th>Product</th>
                <th>Qty Sold</th>
                <th>Qty Returning</th>
                <th>Restock Stock?</th>
              </tr>
            </thead>
            <tbody>
              {returnItems.map((item, idx) => (
                <tr key={item.productId}>
                  <td>
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={(e) => {
                        const copy = [...returnItems];
                        copy[idx].selected = e.target.checked;
                        setReturnItems(copy);
                      }}
                    />
                  </td>
                  <td style={{ fontWeight: 600 }}>{item.productName}</td>
                  <td>{item.maxQty}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      max={item.maxQty}
                      className="form-input"
                      style={{ width: '80px', padding: '4px 8px' }}
                      value={item.quantity}
                      disabled={!item.selected}
                      onChange={(e) => {
                        const copy = [...returnItems];
                        copy[idx].quantity = Number(e.target.value);
                        setReturnItems(copy);
                      }}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={item.restockInventory}
                      disabled={!item.selected}
                      onChange={(e) => {
                        const copy = [...returnItems];
                        copy[idx].restockInventory = e.target.checked;
                        setReturnItems(copy);
                      }}
                    /> Restock
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="form-group">
            <label className="form-label">Return Reason *</label>
            <input
              type="text"
              className="form-input"
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" onClick={() => setIsReturnOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-danger">Confirm Return & Refund</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SalesHistory;
