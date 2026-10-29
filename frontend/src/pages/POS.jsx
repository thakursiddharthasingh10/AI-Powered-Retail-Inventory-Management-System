import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Trash2, Printer, CheckCircle, AlertCircle, Plus, Minus } from 'lucide-react';
import { productsApi, salesApi, warehousesApi } from '../services/api';
import Modal from '../components/Modal';

export const POS = () => {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Cart state
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [taxRate, setTaxRate] = useState(18.0);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Completed sale / Invoice modal
  const [completedSale, setCompletedSale] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      productsApi.getActive(),
      warehousesApi.getActive()
    ]).then(([prodRes, whRes]) => {
      if (prodRes.data) setProducts(prodRes.data);
      if (whRes.data && whRes.data.length > 0) {
        setWarehouses(whRes.data);
        setSelectedWarehouseId(whRes.data[1]?.id || whRes.data[0]?.id);
      }
    }).finally(() => setLoading(false));
  }, []);

  const addToCart = (product) => {
    setError('');
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      if (existing.quantity + 1 > product.totalStock) {
        setError(`Cannot add more than available stock (${product.totalStock}) for ${product.name}`);
        return;
      }
      setCart(cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      if (product.totalStock <= 0) {
        setError(`${product.name} is out of stock!`);
        return;
      }
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      setCart(cart.filter(item => item.product.id !== productId));
      return;
    }
    const item = cart.find(it => it.product.id === productId);
    if (item && newQty > item.product.totalStock) {
      setError(`Cannot exceed available stock of ${item.product.totalStock}`);
      return;
    }
    setCart(cart.map(item => item.product.id === productId ? { ...item, quantity: newQty } : item));
  };

  const removeItem = (productId) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setError('');
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.product.sellingPrice * item.quantity), 0);
  const calculatedTax = (subtotal * Number(taxRate)) / 100;
  const netTotal = Math.max(0, subtotal + calculatedTax - Number(discountAmount));

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError('Please add products to the cart before checkout.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        storeId: 1, // Default Flagship Store
        warehouseId: Number(selectedWarehouseId),
        customerName: customerName || 'Walk-in Customer',
        customerPhone: customerPhone || null,
        paymentMethod,
        taxRate: Number(taxRate),
        discountAmount: Number(discountAmount),
        items: cart.map(it => ({
          productId: it.product.id,
          quantity: it.quantity
        }))
      };

      const res = await salesApi.processSale(payload);
      setCompletedSale(res.data);
      setIsInvoiceOpen(true);
      clearCart();
    } catch (err) {
      setError(err.message || 'Checkout failed. Verify stock availability.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    (p.barcode && p.barcode.includes(search))
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--primary)' }}>Point of Sale (POS) Checkout</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Process counter sales, deduct warehouse stock transactionally, and generate printable GST invoices
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Fulfillment WH:</span>
          <select
            className="form-select"
            style={{ width: '220px' }}
            value={selectedWarehouseId}
            onChange={(e) => setSelectedWarehouseId(e.target.value)}
          >
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
        {/* Left: Product Picker */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)' }}>
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px' }}
              placeholder="Scan barcode or search product name / SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', alignContent: 'start' }}>
            {filteredProducts.map(p => (
              <div
                key={p.id}
                onClick={() => addToCart(p)}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '12px',
                  cursor: 'pointer',
                  background: p.totalStock <= 0 ? '#f8fafc' : '#fff',
                  opacity: p.totalStock <= 0 ? 0.6 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'border-color 0.15s ease'
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.sku}</div>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--primary)', marginTop: '2px', lineHeight: 1.3 }}>
                    {p.name}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent)' }}>
                    ₹{Number(p.sellingPrice).toFixed(2)}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: p.totalStock <= p.reorderLevel ? 'var(--warning-bg)' : 'var(--success-bg)',
                    color: p.totalStock <= p.reorderLevel ? 'var(--warning)' : 'var(--success)'
                  }}>
                    {p.totalStock} in stock
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Cart & Billing */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingCart size={18} /> Current Sale Cart ({cart.length})
            </h3>
            {cart.length > 0 && (
              <button onClick={clearCart} className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)' }}>
                Clear Cart
              </button>
            )}
          </div>

          {/* Cart items list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: '60px' }}>
                <ShoppingCart size={40} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
                <p style={{ fontSize: '13.5px' }}>Cart is empty</p>
                <p style={{ fontSize: '12px' }}>Click on products on the left to add items</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ flex: 1, paddingRight: '8px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{item.product.name}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                      ₹{item.product.sellingPrice} × {item.quantity} = ₹{(item.product.sellingPrice * item.quantity).toFixed(2)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="btn btn-secondary btn-sm" style={{ padding: '2px 6px' }}>
                      <Minus size={12} />
                    </button>
                    <span style={{ fontSize: '13px', fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="btn btn-secondary btn-sm" style={{ padding: '2px 6px' }}>
                      <Plus size={12} />
                    </button>
                    <button onClick={() => removeItem(item.product.id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)', padding: '2px 6px', marginLeft: '4px' }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Customer & Payment Form */}
          <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                className="form-input"
                style={{ fontSize: '12.5px', padding: '6px 10px' }}
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
              <input
                type="text"
                className="form-input"
                style={{ fontSize: '12.5px', padding: '6px 10px' }}
                placeholder="Phone (Optional)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tax Rate (GST %)</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-input"
                  style={{ fontSize: '12px', padding: '5px 8px' }}
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Discount (₹)</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  style={{ fontSize: '12px', padding: '5px 8px' }}
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
              {['CASH', 'CARD', 'UPI'].map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`btn btn-sm ${paymentMethod === method ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  {method}
                </button>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span>Subtotal:</span> <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span>Tax ({taxRate}%):</span> <span>+₹{calculatedTax.toFixed(2)}</span>
              </div>
              {Number(discountAmount) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', color: 'var(--danger)' }}>
                  <span>Discount:</span> <span>-₹{Number(discountAmount).toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 700, color: 'var(--primary)', marginTop: '4px', paddingTop: '4px', borderTop: '1px dashed var(--border)' }}>
                <span>Net Payable:</span> <span>₹{netTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={submitting || cart.length === 0}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '14.5px', fontWeight: 600 }}
            >
              {submitting ? 'Processing Transaction...' : `Complete Sale • ₹${netTotal.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>

      {/* Tax Invoice Modal */}
      <Modal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        title="Tax Invoice Generated"
        maxWidth="600px"
      >
        {completedSale && (
          <div>
            <div id="printable-invoice" style={{ padding: '10px', background: '#fff' }}>
              <div style={{ textAlign: 'center', borderBottom: '1px solid #000', paddingBottom: '10px', marginBottom: '12px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700 }}>RETAILCORP ENTERPRISE MEGASTORE</h2>
                <p style={{ fontSize: '12px' }}>Sector 18, Connaught Place, New Delhi - 110001</p>
                <p style={{ fontSize: '11px', color: '#666' }}>GSTIN: 07AAAAA0000A1Z5 | Ph: +91-11-23456789</p>
                <h4 style={{ fontSize: '14px', marginTop: '6px', textTransform: 'uppercase' }}>TAX INVOICE</h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', fontSize: '12px', marginBottom: '12px' }}>
                <div>
                  <div><strong>Invoice #:</strong> {completedSale.invoiceNumber}</div>
                  <div><strong>Date:</strong> {new Date(completedSale.saleDate).toLocaleString()}</div>
                  <div><strong>Cashier:</strong> {completedSale.cashierUser?.fullName || 'Counter Staff'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div><strong>Customer:</strong> {completedSale.customerName}</div>
                  <div><strong>Phone:</strong> {completedSale.customerPhone || 'N/A'}</div>
                  <div><strong>Payment:</strong> {completedSale.paymentMethod}</div>
                </div>
              </div>

              <table style={{ fontSize: '12px', width: '100%', marginBottom: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #000' }}>
                    <th style={{ textAlign: 'left', padding: '4px' }}>Item</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Qty</th>
                    <th style={{ textAlign: 'right', padding: '4px' }}>Price</th>
                    <th style={{ textAlign: 'right', padding: '4px' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {completedSale.items?.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px dotted #ccc' }}>
                      <td style={{ padding: '4px' }}>{item.productNameSnapshot}</td>
                      <td style={{ textAlign: 'center', padding: '4px' }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right', padding: '4px' }}>₹{Number(item.unitPriceSnapshot).toFixed(2)}</td>
                      <td style={{ textAlign: 'right', padding: '4px' }}>₹{Number(item.subtotal).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ textAlign: 'right', fontSize: '12px', borderTop: '1px solid #000', paddingTop: '6px' }}>
                <div>Subtotal: ₹{Number(completedSale.subtotal).toFixed(2)}</div>
                <div>GST ({completedSale.taxRate}%): ₹{Number(completedSale.taxAmount).toFixed(2)}</div>
                {Number(completedSale.discountAmount) > 0 && (
                  <div>Discount: -₹{Number(completedSale.discountAmount).toFixed(2)}</div>
                )}
                <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '4px' }}>
                  Grand Total: ₹{Number(completedSale.totalAmount).toFixed(2)}
                </div>
              </div>

              <div style={{ textAlign: 'center', fontSize: '11px', color: '#666', marginTop: '16px' }}>
                <p>Thank you for shopping with us! Goods once sold can be returned within 7 days.</p>
                <p style={{ marginTop: '4px' }}>Verification Hash: <code>{completedSale.invoiceNumber}-OK</code></p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => window.print()} className="btn btn-secondary">
                <Printer size={15} /> Print Invoice
              </button>
              <button onClick={() => setIsInvoiceOpen(false)} className="btn btn-primary">
                Done & New Sale
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default POS;
