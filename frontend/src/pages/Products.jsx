import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Power, AlertCircle } from 'lucide-react';
import { productsApi, categoriesApi } from '../services/api';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

export const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    sku: '',
    barcode: '',
    name: '',
    categoryId: '',
    brand: '',
    unit: 'PCS',
    costPrice: '',
    sellingPrice: '',
    reorderLevel: 10,
    safetyStock: 5,
    description: '',
  });
  const [formError, setFormError] = useState('');

  const loadData = () => {
    setLoading(true);
    Promise.all([
      productsApi.search({ query: searchQuery, categoryId: selectedCategory || null, size: 50 }),
      categoriesApi.getActive()
    ])
      .then(([prodRes, catRes]) => {
        if (prodRes.data?.content) setProducts(prodRes.data.content);
        if (catRes.data) setCategories(catRes.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, selectedCategory]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      sku: 'SKU-' + Math.floor(1000 + Math.random() * 9000),
      barcode: '890' + Math.floor(1000000 + Math.random() * 9000000),
      name: '',
      categoryId: categories[0]?.id || '',
      brand: '',
      unit: 'PCS',
      costPrice: '',
      sellingPrice: '',
      reorderLevel: 10,
      safetyStock: 5,
      description: '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setFormData({
      sku: p.sku,
      barcode: p.barcode || '',
      name: p.name,
      categoryId: p.categoryId,
      brand: p.brand || '',
      unit: p.unit || 'PCS',
      costPrice: p.costPrice,
      sellingPrice: p.sellingPrice,
      reorderLevel: p.reorderLevel,
      safetyStock: p.safetyStock,
      description: p.description || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const payload = {
        ...formData,
        categoryId: Number(formData.categoryId),
        costPrice: Number(formData.costPrice),
        sellingPrice: Number(formData.sellingPrice),
        reorderLevel: Number(formData.reorderLevel),
        safetyStock: Number(formData.safetyStock),
      };

      if (editingProduct) {
        await productsApi.update(editingProduct.id, payload);
      } else {
        await productsApi.create(payload);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setFormError(err.message || 'Failed to save product');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await productsApi.toggleStatus(id);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--primary)' }}>Product Catalog</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Manage master product details, SKUs, barcode mappings, and pricing
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={16} /> Add New Product
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px' }}
              placeholder="Search by SKU, Barcode, or Product Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          </div>

          <div style={{ width: '220px' }}>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>SKU / Barcode</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Unit</th>
              <th>Cost Price</th>
              <th>Selling Price</th>
              <th>Total Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="10" style={{ textAlign: 'center', padding: '30px' }}>Loading catalog...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan="10" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No products match your criteria.</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div><code>{p.sku}</code></div>
                    {p.barcode && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.barcode}</div>}
                  </td>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td>{p.categoryName}</td>
                  <td>{p.brand || '—'}</td>
                  <td>{p.unit}</td>
                  <td>₹{Number(p.costPrice).toFixed(2)}</td>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>₹{Number(p.sellingPrice).toFixed(2)}</td>
                  <td style={{ fontWeight: 700, color: p.totalStock <= p.reorderLevel ? 'var(--danger)' : 'var(--success)' }}>
                    {p.totalStock}
                  </td>
                  <td>
                    <Badge variant={p.isActive ? 'success' : 'neutral'}>
                      {p.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </Badge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        onClick={() => handleOpenEdit(p)} 
                        className="btn btn-secondary btn-sm"
                        title="Edit Product"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(p.id)} 
                        className="btn btn-secondary btn-sm"
                        title={p.isActive ? 'Deactivate Product' : 'Activate Product'}
                        style={{ color: p.isActive ? 'var(--danger)' : 'var(--success)' }}
                      >
                        <Power size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product Details' : 'Create New Catalog Product'}
        maxWidth="640px"
      >
        {formError && (
          <div style={{
            padding: '10px 14px',
            background: 'var(--danger-bg)',
            color: 'var(--danger)',
            borderRadius: 'var(--radius)',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <AlertCircle size={16} /> {formError}
          </div>
        )}

        <form onSubmit={handleSaveProduct}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">SKU (Unique Code) *</label>
              <input
                type="text"
                className="form-input"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Barcode (UPC/EAN)</label>
              <input
                type="text"
                className="form-input"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Brand</label>
              <input
                type="text"
                className="form-input"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Cost Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Selling Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unit of Measure</label>
              <input
                type="text"
                className="form-input"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Reorder Level Threshold</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Configured Safety Stock</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={formData.safetyStock}
                onChange={(e) => setFormData({ ...formData, safetyStock: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Products;
