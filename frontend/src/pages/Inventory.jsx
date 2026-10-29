import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, AlertCircle, PlusCircle, ArrowUpDown } from 'lucide-react';
import { inventoryApi, warehousesApi, productsApi } from '../services/api';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

export const Inventory = () => {
  const [inventoryList, setInventoryList] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [loading, setLoading] = useState(true);

  // Adjustment Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adjData, setAdjData] = useState({
    productId: '',
    warehouseId: '',
    quantityChanged: '',
    movementType: 'IN',
    reason: '',
  });
  const [error, setError] = useState('');

  const loadData = () => {
    setLoading(true);
    const invPromise = selectedWarehouse 
      ? inventoryApi.getByWarehouse(selectedWarehouse)
      : inventoryApi.getAll();

    Promise.all([
      invPromise,
      warehousesApi.getActive(),
      productsApi.getActive()
    ])
      .then(([invRes, whRes, prodRes]) => {
        if (invRes.data) setInventoryList(invRes.data);
        if (whRes.data) setWarehouses(whRes.data);
        if (prodRes.data) setProducts(prodRes.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [selectedWarehouse]);

  const handleOpenAdjust = (invItem) => {
    setAdjData({
      productId: invItem?.product?.id || products[0]?.id || '',
      warehouseId: invItem?.warehouse?.id || warehouses[0]?.id || '',
      quantityChanged: 5,
      movementType: 'IN',
      reason: 'Physical inventory count adjustment',
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSaveAdjustment = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const qty = Number(adjData.quantityChanged);
      const payload = {
        productId: Number(adjData.productId),
        warehouseId: Number(adjData.warehouseId),
        quantityChanged: adjData.movementType === 'OUT' ? -Math.abs(qty) : Math.abs(qty),
        movementType: adjData.movementType,
        reason: adjData.reason,
      };

      await inventoryApi.adjustStock(payload);
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to adjust inventory');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--primary)' }}>Multi-Warehouse Inventory</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Real-time on-hand stock balances, safety reserves, and cycle count adjustments
          </p>
        </div>
        <button onClick={() => handleOpenAdjust(null)} className="btn btn-primary">
          <ArrowUpDown size={16} /> Record Stock Adjustment
        </button>
      </div>

      {/* Warehouse Selector Toolbar */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--primary)' }}>
            Filter by Warehouse Facility:
          </span>
          <select
            className="form-select"
            style={{ maxWidth: '320px' }}
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
          >
            <option value="">All Warehouses (Global Stock View)</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Product SKU</th>
              <th>Product Name</th>
              <th>Warehouse Facility</th>
              <th>On-Hand Qty</th>
              <th>Reserved Qty</th>
              <th>Available Qty</th>
              <th>Reorder Threshold</th>
              <th>Stock Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="9" style={{ textAlign: 'center', padding: '30px' }}>Loading stock levels...</td></tr>
            ) : inventoryList.length === 0 ? (
              <tr><td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No inventory records found.</td></tr>
            ) : (
              inventoryList.map((inv) => {
                const available = Math.max(0, inv.quantity - (inv.reservedQuantity || 0));
                const reorder = inv.product?.reorderLevel || 10;
                let statusVariant = 'success';
                let statusText = 'HEALTHY';

                if (inv.quantity === 0) {
                  statusVariant = 'danger';
                  statusText = 'OUT OF STOCK';
                } else if (inv.quantity <= reorder) {
                  statusVariant = 'warning';
                  statusText = 'LOW STOCK';
                }

                return (
                  <tr key={inv.id}>
                    <td><code>{inv.product?.sku}</code></td>
                    <td style={{ fontWeight: 600 }}>{inv.product?.name}</td>
                    <td>{inv.warehouse?.name}</td>
                    <td style={{ fontWeight: 700, fontSize: '14px' }}>{inv.quantity}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{inv.reservedQuantity || 0}</td>
                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{available}</td>
                    <td>{reorder}</td>
                    <td><Badge variant={statusVariant}>{statusText}</Badge></td>
                    <td>
                      <button 
                        onClick={() => handleOpenAdjust(inv)} 
                        className="btn btn-secondary btn-sm"
                        title="Adjust Stock"
                      >
                        Adjust
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Adjust Inventory Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Inventory Adjustment Ledger Entry"
      >
        {error && (
          <div style={{ padding: '10px 14px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSaveAdjustment}>
          <div className="form-group">
            <label className="form-label">Product *</label>
            <select
              className="form-select"
              value={adjData.productId}
              onChange={(e) => setAdjData({ ...adjData, productId: e.target.value })}
              required
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} [{p.sku}]</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Warehouse Facility *</label>
            <select
              className="form-select"
              value={adjData.warehouseId}
              onChange={(e) => setAdjData({ ...adjData, warehouseId: e.target.value })}
              required
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Adjustment Type *</label>
              <select
                className="form-select"
                value={adjData.movementType}
                onChange={(e) => setAdjData({ ...adjData, movementType: e.target.value })}
              >
                <option value="IN">IN (Stock Received / Positive Count)</option>
                <option value="OUT">OUT (Damaged / Shrinkage Deduction)</option>
                <option value="ADJUSTMENT">ADJUSTMENT (Cycle Count Reconciliation)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Units to Change *</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={adjData.quantityChanged}
                onChange={(e) => setAdjData({ ...adjData, quantityChanged: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reason / Authorization Notes *</label>
            <textarea
              className="form-input"
              rows="2"
              value={adjData.reason}
              onChange={(e) => setAdjData({ ...adjData, reason: e.target.value })}
              placeholder="e.g., Physical cycle count reconciliation, packaging damage, etc."
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Commit Stock Ledger Entry</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Inventory;
