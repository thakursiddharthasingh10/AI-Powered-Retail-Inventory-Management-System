import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, Truck, PackageCheck, AlertCircle } from 'lucide-react';
import { transfersApi, warehousesApi, productsApi } from '../services/api';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

export const Transfers = () => {
  const [transfers, setTransfers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Request Transfer Modal
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    sourceWarehouseId: '',
    destinationWarehouseId: '',
    notes: '',
    items: [{ productId: '', quantityRequested: 5 }],
  });
  const [error, setError] = useState('');

  const loadData = () => {
    setLoading(true);
    Promise.all([
      transfersApi.getAll({ size: 50 }),
      warehousesApi.getActive(),
      productsApi.getActive()
    ]).then(([trRes, whRes, prodRes]) => {
      if (trRes.data?.content) setTransfers(trRes.data.content);
      if (whRes.data) setWarehouses(whRes.data);
      if (prodRes.data) setProducts(prodRes.data);
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenRequest = () => {
    setForm({
      sourceWarehouseId: warehouses[0]?.id || '',
      destinationWarehouseId: warehouses[1]?.id || '',
      notes: '',
      items: [{ productId: products[0]?.id || '', quantityRequested: 5 }],
    });
    setError('');
    setIsOpen(true);
  };

  const handleSaveTransfer = async (e) => {
    e.preventDefault();
    if (form.sourceWarehouseId === form.destinationWarehouseId) {
      setError('Source and destination warehouses must be different');
      return;
    }
    setError('');
    try {
      await transfersApi.request({
        sourceWarehouseId: Number(form.sourceWarehouseId),
        destinationWarehouseId: Number(form.destinationWarehouseId),
        notes: form.notes,
        items: form.items.map(it => ({
          productId: Number(it.productId),
          quantityRequested: Number(it.quantityRequested),
        }))
      });
      setIsOpen(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to request stock transfer');
    }
  };

  const handleAction = async (actionFn, id) => {
    try {
      await actionFn(id);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to complete action');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--primary)' }}>Inter-Warehouse Stock Transfers</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Workflow: Request → Manager Approval → Dispatch (Source stock decr) → Receive (Destination stock incr)
          </p>
        </div>
        <button onClick={handleOpenRequest} className="btn btn-primary">
          <Plus size={16} /> Request Transfer
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Transfer Number</th>
              <th>Source Facility</th>
              <th>Destination Facility</th>
              <th>Items & Quantities</th>
              <th>Status</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>Loading transfers...</td></tr>
            ) : transfers.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No stock transfers recorded.</td></tr>
            ) : (
              transfers.map(tr => {
                let badgeVar = 'neutral';
                if (tr.status === 'RECEIVED') badgeVar = 'success';
                else if (tr.status === 'DISPATCHED') badgeVar = 'warning';
                else if (tr.status === 'APPROVED') badgeVar = 'info';

                return (
                  <tr key={tr.id}>
                    <td><code>{tr.transferNumber}</code></td>
                    <td style={{ fontWeight: 600 }}>{tr.sourceWarehouse?.name}</td>
                    <td style={{ fontWeight: 600 }}>{tr.destinationWarehouse?.name}</td>
                    <td>
                      {tr.items?.map(it => (
                        <div key={it.id} style={{ fontSize: '12.5px' }}>
                          {it.product?.name}: <strong>{it.quantityRequested} units</strong>
                        </div>
                      ))}
                    </td>
                    <td><Badge variant={badgeVar}>{tr.status}</Badge></td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(tr.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {tr.status === 'REQUESTED' && (
                          <button onClick={() => handleAction(transfersApi.approve, tr.id)} className="btn btn-secondary btn-sm" title="Approve">
                            <CheckCircle size={13} /> Approve
                          </button>
                        )}
                        {(tr.status === 'APPROVED' || tr.status === 'REQUESTED') && (
                          <button onClick={() => handleAction(transfersApi.dispatch, tr.id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--warning)' }} title="Dispatch">
                            <Truck size={13} /> Dispatch
                          </button>
                        )}
                        {tr.status === 'DISPATCHED' && (
                          <button onClick={() => handleAction(transfersApi.receive, tr.id)} className="btn btn-primary btn-sm" title="Receive Stock">
                            <PackageCheck size={13} /> Receive
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

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Request Stock Transfer" maxWidth="620px">
        {error && <div style={{ padding: '8px', background: 'var(--danger-bg)', color: 'var(--danger)', marginBottom: '12px' }}>{error}</div>}
        <form onSubmit={handleSaveTransfer}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Source Warehouse *</label>
              <select className="form-select" value={form.sourceWarehouseId} onChange={e => setForm({ ...form, sourceWarehouseId: e.target.value })} required>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name} ({w.code})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Destination Warehouse *</label>
              <select className="form-select" value={form.destinationWarehouseId} onChange={e => setForm({ ...form, destinationWarehouseId: e.target.value })} required>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name} ({w.code})</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label className="form-label">Transfer Products</label>
            {form.items.map((row, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '10px', marginBottom: '8px' }}>
                <select
                  className="form-select"
                  value={row.productId}
                  onChange={e => {
                    const copy = [...form.items];
                    copy[idx].productId = e.target.value;
                    setForm({ ...form, items: copy });
                  }}
                  required
                >
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} [{p.sku}]</option>)}
                </select>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  placeholder="Quantity"
                  value={row.quantityRequested}
                  onChange={e => {
                    const copy = [...form.items];
                    copy[idx].quantityRequested = Number(e.target.value);
                    setForm({ ...form, items: copy });
                  }}
                  required
                />
              </div>
            ))}
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-input" rows="2" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Reason for transfer" />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <button type="button" onClick={() => setIsOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Submit Transfer Request</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Transfers;
