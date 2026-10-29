import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, PackageCheck, AlertCircle, Eye } from 'lucide-react';
import { purchaseOrdersApi, suppliersApi, warehousesApi, productsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

export const PurchaseOrders = () => {
  const { isManager, isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create PO Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [poForm, setPoForm] = useState({
    supplierId: '',
    destinationWarehouseId: '',
    notes: '',
    items: [{ productId: '', quantityOrdered: 10, unitCost: 100 }],
  });

  // Receive Goods Modal
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [selectedPo, setSelectedPo] = useState(null);
  const [receiveData, setReceiveData] = useState([]);
  const [receiveNotes, setReceiveNotes] = useState('');

  const [error, setError] = useState('');

  const loadData = () => {
    setLoading(true);
    Promise.all([
      purchaseOrdersApi.getAll({ size: 50 }),
      suppliersApi.getActive(),
      warehousesApi.getActive(),
      productsApi.getActive()
    ])
      .then(([ordersRes, supRes, whRes, prodRes]) => {
        if (ordersRes.data?.content) setOrders(ordersRes.data.content);
        if (supRes.data) setSuppliers(supRes.data);
        if (whRes.data) setWarehouses(whRes.data);
        if (prodRes.data) setProducts(prodRes.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setPoForm({
      supplierId: suppliers[0]?.id || '',
      destinationWarehouseId: warehouses[0]?.id || '',
      notes: '',
      items: [{ productId: products[0]?.id || '', quantityOrdered: 20, unitCost: products[0]?.costPrice || 100 }],
    });
    setError('');
    setIsCreateOpen(true);
  };

  const handleAddItemRow = () => {
    setPoForm({
      ...poForm,
      items: [
        ...poForm.items,
        { productId: products[0]?.id || '', quantityOrdered: 10, unitCost: products[0]?.costPrice || 100 }
      ]
    });
  };

  const handleRemoveItemRow = (idx) => {
    const updated = poForm.items.filter((_, i) => i !== idx);
    setPoForm({ ...poForm, items: updated });
  };

  const handleItemChange = (idx, field, val) => {
    const updated = [...poForm.items];
    updated[idx][field] = val;
    if (field === 'productId') {
      const prod = products.find(p => p.id === Number(val));
      if (prod) updated[idx].unitCost = prod.costPrice;
    }
    setPoForm({ ...poForm, items: updated });
  };

  const handleSavePO = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        supplierId: Number(poForm.supplierId),
        destinationWarehouseId: Number(poForm.destinationWarehouseId),
        notes: poForm.notes,
        items: poForm.items.map(it => ({
          productId: Number(it.productId),
          quantityOrdered: Number(it.quantityOrdered),
          unitCost: Number(it.unitCost),
        })),
      };

      await purchaseOrdersApi.create(payload);
      setIsCreateOpen(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to create purchase order');
    }
  };

  const handleApprovePO = async (id) => {
    try {
      await purchaseOrdersApi.approve(id);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to approve purchase order');
    }
  };

  const handleOpenReceive = (po) => {
    setSelectedPo(po);
    setReceiveNotes('');
    const items = po.items.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      ordered: item.quantityOrdered,
      alreadyReceived: item.quantityReceived || 0,
      quantityReceived: Math.max(0, item.quantityOrdered - (item.quantityReceived || 0)),
    }));
    setReceiveData(items);
    setError('');
    setIsReceiveOpen(true);
  };

  const handleSaveReceive = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        purchaseOrderId: selectedPo.id,
        warehouseId: selectedPo.destinationWarehouse.id,
        notes: receiveNotes,
        items: receiveData.map(d => ({
          productId: d.productId,
          quantityReceived: Number(d.quantityReceived),
        })),
      };

      await purchaseOrdersApi.receiveGoods(payload);
      setIsReceiveOpen(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to record goods receipt');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--primary)' }}>Procurement & Purchase Orders</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            PO lifecycle: Draft → Submit → Manager Approval → Goods Receipt & Automated Stock Increment
          </p>
        </div>
        <button onClick={handleOpenCreate} className="btn btn-primary">
          <Plus size={16} /> Create Purchase Order
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>PO Number</th>
              <th>Supplier</th>
              <th>Destination Warehouse</th>
              <th>Total Value</th>
              <th>Status</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>Loading purchase orders...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No purchase orders recorded.</td></tr>
            ) : (
              orders.map((po) => {
                let badgeVar = 'neutral';
                if (po.status === 'RECEIVED') badgeVar = 'success';
                else if (po.status === 'APPROVED') badgeVar = 'info';
                else if (po.status === 'PARTIALLY_RECEIVED') badgeVar = 'warning';

                return (
                  <tr key={po.id}>
                    <td><code>{po.poNumber}</code></td>
                    <td style={{ fontWeight: 600 }}>{po.supplier?.name}</td>
                    <td>{po.destinationWarehouse?.name}</td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      ₹{Number(po.totalAmount).toLocaleString()}
                    </td>
                    <td><Badge variant={badgeVar}>{po.status}</Badge></td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(po.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {(isManager() || isAdmin()) && (po.status === 'SUBMITTED' || po.status === 'DRAFT') && (
                          <button
                            onClick={() => handleApprovePO(po.id)}
                            className="btn btn-primary btn-sm"
                          >
                            <CheckCircle size={13} /> Approve
                          </button>
                        )}
                        {(po.status === 'APPROVED' || po.status === 'PARTIALLY_RECEIVED') && (
                          <button
                            onClick={() => handleOpenReceive(po)}
                            className="btn btn-secondary btn-sm"
                            style={{ borderColor: 'var(--success)', color: 'var(--success)' }}
                          >
                            <PackageCheck size={13} /> Receive Stock
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create PO Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Purchase Order"
        maxWidth="680px"
      >
        {error && (
          <div style={{ padding: '10px 14px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSavePO}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Vendor / Supplier *</label>
              <select
                className="form-select"
                value={poForm.supplierId}
                onChange={(e) => setPoForm({ ...poForm, supplierId: e.target.value })}
                required
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Destination Warehouse *</label>
              <select
                className="form-select"
                value={poForm.destinationWarehouseId}
                onChange={(e) => setPoForm({ ...poForm, destinationWarehouseId: e.target.value })}
                required
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span className="form-label" style={{ margin: 0 }}>Purchase Line Items</span>
              <button type="button" onClick={handleAddItemRow} className="btn btn-secondary btn-sm">
                + Add Another Product
              </button>
            </div>

            {poForm.items.map((row, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                <select
                  className="form-select"
                  value={row.productId}
                  onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                  required
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} [{p.sku}]</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  placeholder="Quantity"
                  value={row.quantityOrdered}
                  onChange={(e) => handleItemChange(idx, 'quantityOrdered', e.target.value)}
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  placeholder="Unit Cost"
                  value={row.unitCost}
                  onChange={(e) => handleItemChange(idx, 'unitCost', e.target.value)}
                  required
                />
                {poForm.items.length > 1 && (
                  <button type="button" onClick={() => handleRemoveItemRow(idx)} className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)' }}>
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              className="form-input"
              rows="2"
              value={poForm.notes}
              onChange={(e) => setPoForm({ ...poForm, notes: e.target.value })}
              placeholder="e.g. Urgent seasonal replenishment"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" onClick={() => setIsCreateOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Submit Purchase Order</button>
          </div>
        </form>
      </Modal>

      {/* Receive Goods Modal */}
      <Modal
        isOpen={isReceiveOpen}
        onClose={() => setIsReceiveOpen(false)}
        title={`Receive Goods Against ${selectedPo?.poNumber}`}
        maxWidth="620px"
      >
        {error && (
          <div style={{ padding: '10px 14px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSaveReceive}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Delivered to: <strong>{selectedPo?.destinationWarehouse?.name}</strong>. Entering received quantities will immediately update physical inventory balances.
          </p>

          <table style={{ marginBottom: '16px' }}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Ordered</th>
                <th>Prior Receipts</th>
                <th>Now Receiving</th>
              </tr>
            </thead>
            <tbody>
              {receiveData.map((item, idx) => (
                <tr key={item.productId}>
                  <td style={{ fontWeight: 600 }}>{item.productName}</td>
                  <td>{item.ordered}</td>
                  <td>{item.alreadyReceived}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      max={item.ordered - item.alreadyReceived}
                      className="form-input"
                      style={{ width: '90px' }}
                      value={item.quantityReceived}
                      onChange={(e) => {
                        const copy = [...receiveData];
                        copy[idx].quantityReceived = Number(e.target.value);
                        setReceiveData(copy);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="form-group">
            <label className="form-label">Receipt Inspection Notes</label>
            <textarea
              className="form-input"
              rows="2"
              value={receiveNotes}
              onChange={(e) => setReceiveNotes(e.target.value)}
              placeholder="e.g. All packaging verified in sound condition"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" onClick={() => setIsReceiveOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Confirm & Update Stock</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PurchaseOrders;
