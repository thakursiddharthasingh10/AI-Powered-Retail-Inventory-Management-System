import React, { useState, useEffect } from 'react';
import { Plus, Power, Shield, AlertCircle } from 'lucide-react';
import { usersApi, authApi } from '../services/api';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

export const Users = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Register Modal
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: 'Password@123',
    fullName: '',
    phone: '',
    role: 'ROLE_CASHIER',
  });
  const [error, setError] = useState('');

  const loadData = () => {
    setLoading(true);
    Promise.all([
      usersApi.getAll(),
      usersApi.getRoles()
    ]).then(([uRes, rRes]) => {
      if (uRes.data) setUsers(uRes.data);
      if (rRes.data) setRoles(rRes.data);
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await authApi.register({
        ...formData,
        roles: [formData.role]
      });
      setIsOpen(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to register user');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await usersApi.toggleStatus(id);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--primary)' }}>User Accounts & Roles</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Manage staff credentials, role-based access control (RBAC), and account activity
          </p>
        </div>
        <button onClick={() => { setError(''); setIsOpen(true); }} className="btn btn-primary">
          <Plus size={16} /> Register New Staff
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Full Name</th>
              <th>Email Address</th>
              <th>Contact Phone</th>
              <th>Assigned Roles</th>
              <th>Account Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>Loading user directory...</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td><code>{u.username}</code></td>
                  <td style={{ fontWeight: 600 }}>{u.fullName}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {u.roles?.map(r => (
                        <span key={r.id} style={{ fontSize: '11px', background: 'var(--accent-soft)', color: 'var(--accent)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                          {r.name.replace('ROLE_', '')}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <Badge variant={u.isActive ? 'success' : 'neutral'}>
                      {u.isActive ? 'ACTIVE' : 'SUSPENDED'}
                    </Badge>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleStatus(u.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ color: u.isActive ? 'var(--danger)' : 'var(--success)' }}
                    >
                      <Power size={13} /> {u.isActive ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Register Staff Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Register New Operational Staff Account">
        {error && <div style={{ padding: '8px', background: 'var(--danger-bg)', color: 'var(--danger)', marginBottom: '12px' }}>{error}</div>}
        <form onSubmit={handleRegister}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Username *</label>
              <input type="text" className="form-input" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input type="text" className="form-input" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input type="email" className="form-input" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input type="text" className="form-input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Initial Password *</label>
              <input type="password" className="form-input" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Security Role *</label>
              <select className="form-select" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                <option value="ROLE_ADMIN">ADMIN (Full Privileges)</option>
                <option value="ROLE_MANAGER">MANAGER (Approvals & Analytics)</option>
                <option value="ROLE_INVENTORY_STAFF">INVENTORY_STAFF (Warehousing)</option>
                <option value="ROLE_CASHIER">CASHIER (POS & Invoicing)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <button type="button" onClick={() => setIsOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Create User Account</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;
