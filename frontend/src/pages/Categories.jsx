import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { categoriesApi } from '../services/api';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

export const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ code: '', name: '', description: '', isActive: true });
  const [error, setError] = useState('');

  const loadCategories = () => {
    setLoading(true);
    categoriesApi.getAll()
      .then((res) => {
        if (res.data) setCategories(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({ code: 'CAT-' + Math.floor(100 + Math.random() * 900), name: '', description: '', isActive: true });
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({ code: cat.code, name: cat.name, description: cat.description || '', isActive: cat.isActive });
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, formData);
      } else {
        await categoriesApi.create(formData);
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (err) {
      setError(err.message || 'Failed to save category');
    }
  };

  const handleDeactivate = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this category?')) {
      try {
        await categoriesApi.deactivate(id);
        loadCategories();
      } catch (err) {
        alert(err.message || 'Failed to deactivate category');
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--primary)' }}>Product Categories</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Classify merchandise, organize inventory tracking, and manage product families
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Category Code</th>
              <th>Category Name</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px' }}>Loading categories...</td></tr>
            ) : (
              categories.map((c) => (
                <tr key={c.id}>
                  <td><code>{c.code}</code></td>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{c.description || '—'}</td>
                  <td>
                    <Badge variant={c.isActive ? 'success' : 'neutral'}>
                      {c.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </Badge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => handleOpenEdit(c)} className="btn btn-secondary btn-sm" title="Edit">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => handleDeactivate(c.id)} className="btn btn-secondary btn-sm" title="Deactivate" style={{ color: 'var(--danger)' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
      >
        {error && (
          <div style={{ padding: '10px 14px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Category Code *</label>
            <input
              type="text"
              className="form-input"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Category Name *</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">{editingCategory ? 'Save Changes' : 'Create Category'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Categories;
