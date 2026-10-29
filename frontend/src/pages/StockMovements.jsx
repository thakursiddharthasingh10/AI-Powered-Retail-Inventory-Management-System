import React, { useState, useEffect } from 'react';
import { inventoryApi } from '../services/api';
import Badge from '../components/Badge';

export const StockMovements = () => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    inventoryApi.getMovements({ size: 100 })
      .then((res) => {
        if (res.data?.content) setMovements(res.data.content);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--primary)' }}>Stock Movement Ledger</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Immutable double-entry inventory audit trail recording all receipts, sales deductions, transfers, and adjustments
        </p>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Product SKU</th>
              <th>Product Name</th>
              <th>Warehouse Facility</th>
              <th>Movement Type</th>
              <th>Quantity Changed</th>
              <th>Balance After</th>
              <th>Reference Type</th>
              <th>Reason / Memo</th>
              <th>Authorized Actor</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="10" style={{ textAlign: 'center', padding: '30px' }}>Loading movement ledger...</td></tr>
            ) : movements.length === 0 ? (
              <tr><td colSpan="10" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No movements recorded.</td></tr>
            ) : (
              movements.map((m) => {
                const isPositive = m.quantityChanged > 0;
                let badgeVariant = 'info';
                if (m.movementType === 'IN' || m.movementType === 'TRANSFER_IN') badgeVariant = 'success';
                else if (m.movementType === 'SALE' || m.movementType === 'OUT' || m.movementType === 'TRANSFER_OUT') badgeVariant = 'danger';

                return (
                  <tr key={m.id}>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(m.createdAt).toLocaleString()}
                    </td>
                    <td><code>{m.productSku}</code></td>
                    <td style={{ fontWeight: 600 }}>{m.productName}</td>
                    <td>{m.warehouseName}</td>
                    <td><Badge variant={badgeVariant}>{m.movementType}</Badge></td>
                    <td style={{ fontWeight: 700, color: isPositive ? 'var(--success)' : 'var(--danger)' }}>
                      {isPositive ? `+${m.quantityChanged}` : m.quantityChanged}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{m.balanceAfter}</td>
                    <td><span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{m.referenceType || '—'}</span></td>
                    <td style={{ fontSize: '12.5px' }}>{m.reason}</td>
                    <td style={{ fontSize: '12px' }}><code>{m.actorUsername}</code></td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockMovements;
