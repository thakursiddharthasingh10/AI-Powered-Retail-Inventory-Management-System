import React, { useState, useEffect } from 'react';
import { Plus, Building2, Warehouse as WhIcon, AlertCircle } from 'lucide-react';
import { warehousesApi } from '../services/api';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

export const Warehouses = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Warehouse Modal
  const [isWhOpen, setIsWhOpen] = useState(false);
  const [whForm, setWhForm] = useState({ code: '', name: '', storeId: '', location: '', capacity: 10000 });

  // Add Store Modal
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [storeForm, setStoreForm] = useState({ code: '', name: '', address: '', city: '', state: '', phone: '' });

  const [error, setError] = useState('');

  const loadData = () => {
    setLoading(true);
    Promise.all([
      warehousesApi.getAll(),
      warehousesApi.getAllStores()
    ])
      .then(([whRes, storeRes]) => {
        if (whRes.data) setWarehouses(whRes.data);
        if (storeRes.data) setStores(storeRes.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveWh = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await warehousesApi.create({
        ...whForm,
        storeId: whForm.storeId ? Number(whForm.storeId) : null,
        capacity: Number(whForm.capacity)
      });
      setIsWhOpen(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to create warehouse');
    }
  };

  const handleSaveStore = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await warehousesApi.createStore(storeForm);
      setIsStoreOpen(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to create store');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--primary)' }}>Warehouses & Retail Stores</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Configure multi-location physical hubs, central distribution centers, and retail store branches
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => { setStoreForm({ code: 'STR-' + Math.floor(10 + Math.random() * 90), name: '', address: '', city: '', state: '', phone: '' }); setIsStoreOpen(true); }} className="btn btn-secondary">
            <Building2 size={16} /> Add Store Branch
          </button>
          <button onClick={() => { setWhForm({ code: 'WH-' + Math.floor(100 + Math.random() * 900), name: '', storeId: stores[0]?.id || '', location: '', capacity: 10000 }); setIsWhOpen(true); }} className="btn btn-primary">
            <Plus size={16} /> Add Warehouse Hub
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h3 className="card-title" style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <WhIcon size={18} /> Physical Warehouse Facilities
        </h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Warehouse Code</th>
                <th>Facility Name</th>
                <th>Linked Store Branch</th>
                <th>Physical Location</th>
                <th>Max Capacity</th>
                <th>Operational Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Loading warehouses...</td></tr>
              ) : (
                warehouses.map((w) => (
                  <tr key={w.id}>
                    <td><code>{w.code}</code></td>
                    <td style={{ fontWeight: 600 }}>{w.name}</td>
                    <td>{w.storeName || 'Central Hub (All Stores)'}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{w.location || '—'}</td>
                    <td>{w.capacity?.toLocaleString()} units</td>
                    <td><Badge variant={w.isActive ? 'success' : 'neutral'}>{w.isActive ? 'ACTIVE' : 'INACTIVE'}</Badge></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="card-title" style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 size={18} /> Retail Store Outlets
        </h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Store Code</th>
                <th>Store Branch Name</th>
                <th>Address</th>
                <th>City / State</th>
                <th>Contact Phone</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((s) => (
                <tr key={s.id}>
                  <td><code>{s.code}</code></td>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td>{s.address}</td>
                  <td>{s.city}, {s.state}</td>
                  <td>{s.phone}</td>
                  <td><Badge variant={s.isActive ? 'success' : 'neutral'}>{s.isActive ? 'ACTIVE' : 'INACTIVE'}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Warehouse Modal */}
      <Modal isOpen={isWhOpen} onClose={() => setIsWhOpen(false)} title="Create Warehouse Facility">
        {error && <div style={{ padding: '8px', background: 'var(--danger-bg)', color: 'var(--danger)', marginBottom: '12px' }}>{error}</div>}
        <form onSubmit={handleSaveWh}>
          <div className="form-group">
            <label className="form-label">Warehouse Code *</label>
            <input type="text" className="form-input" value={whForm.code} onChange={e => setWhForm({ ...whForm, code: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Warehouse Name *</label>
            <input type="text" className="form-input" value={whForm.name} onChange={e => setWhForm({ ...whForm, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Associated Store Branch</label>
            <select className="form-select" value={whForm.storeId} onChange={e => setWhForm({ ...whForm, storeId: e.target.value })}>
              <option value="">None (Central / Independent Hub)</option>
              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Physical Location</label>
            <input type="text" className="form-input" value={whForm.location} onChange={e => setWhForm({ ...whForm, location: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Capacity (Units)</label>
            <input type="number" className="form-input" value={whForm.capacity} onChange={e => setWhForm({ ...whForm, capacity: e.target.value })} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <button type="button" onClick={() => setIsWhOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Create Warehouse</button>
          </div>
        </form>
      </Modal>

      {/* Add Store Modal */}
      <Modal isOpen={isStoreOpen} onClose={() => setIsStoreOpen(false)} title="Create Retail Store Branch">
        {error && <div style={{ padding: '8px', background: 'var(--danger-bg)', color: 'var(--danger)', marginBottom: '12px' }}>{error}</div>}
        <form onSubmit={handleSaveStore}>
          <div className="form-group">
            <label className="form-label">Store Code *</label>
            <input type="text" className="form-input" value={storeForm.code} onChange={e => setStoreForm({ ...storeForm, code: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Store Name *</label>
            <input type="text" className="form-input" value={storeForm.name} onChange={e => setStoreForm({ ...storeForm, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <input type="text" className="form-input" value={storeForm.address} onChange={e => setStoreForm({ ...storeForm, address: e.target.value })} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">City</label>
              <input type="text" className="form-input" value={storeForm.city} onChange={e => setStoreForm({ ...storeForm, city: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input type="text" className="form-input" value={storeForm.state} onChange={e => setStoreForm({ ...storeForm, state: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Contact Phone</label>
            <input type="text" className="form-input" value={storeForm.phone} onChange={e => setStoreForm({ ...storeForm, phone: e.target.value })} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <button type="button" onClick={() => setIsStoreOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Create Store</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Warehouses;
