import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import { auditLogsApi } from '../services/api';
import Badge from '../components/Badge';

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    auditLogsApi.getAll({ size: 100 })
      .then((res) => {
        if (res.data?.content) setLogs(res.data.content);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--primary)' }}>Security & Compliance Audit Logs</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Immutable log of all user logins, role assignments, inventory alterations, approvals, and financial transactions
        </p>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Target Entity</th>
              <th>Entity ID</th>
              <th>Details / Audit Trail</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>Loading audit records...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No audit events logged.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td><code>{log.actorUsername}</code></td>
                  <td>
                    <Badge variant={
                      log.action.includes('DELETE') || log.action.includes('REJECT') ? 'danger' :
                      log.action.includes('APPROVE') || log.action.includes('COMPLETE') ? 'success' : 'info'
                    }>
                      {log.action}
                    </Badge>
                  </td>
                  <td>{log.entityName}</td>
                  <td>{log.entityId}</td>
                  <td style={{ fontSize: '12.5px' }}>{log.details}</td>
                  <td style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{log.ipAddress}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogs;
