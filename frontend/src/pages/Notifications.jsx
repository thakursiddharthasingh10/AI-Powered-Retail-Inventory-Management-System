import React, { useState, useEffect } from 'react';
import { Check, CheckCheck, Bell } from 'lucide-react';
import { notificationsApi } from '../services/api';
import Badge from '../components/Badge';

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = () => {
    setLoading(true);
    notificationsApi.getAll({ size: 50 })
      .then((res) => {
        if (res.data?.content) setNotifications(res.data.content);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    await notificationsApi.markRead(id);
    loadNotifications();
  };

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllRead();
    loadNotifications();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--primary)' }}>Notification & Alert Center</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Real-time critical stock alerts, pending procurement approvals, and operational notices
          </p>
        </div>
        <button onClick={handleMarkAllRead} className="btn btn-secondary">
          <CheckCheck size={16} /> Mark All as Read
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center' }}>Loading notification inbox...</div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Bell size={36} color="#cbd5e1" style={{ margin: '0 auto 10px' }} />
            <p>No notifications in your inbox.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notifications.map((n) => {
              let badgeVar = 'info';
              if (n.type === 'LOW_STOCK' || n.type === 'OUT_OF_STOCK') badgeVar = 'danger';
              else if (n.type === 'PO_PENDING') badgeVar = 'warning';

              return (
                <div
                  key={n.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 16px',
                    borderRadius: 'var(--radius)',
                    background: n.isRead ? '#fff' : 'var(--accent-soft)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div style={{ flex: 1, paddingRight: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <Badge variant={badgeVar}>{n.type}</Badge>
                      <strong style={{ fontSize: '14px', color: 'var(--primary)' }}>{n.title}</strong>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                      {n.message}
                    </p>
                  </div>
                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="btn btn-secondary btn-sm"
                      title="Mark as read"
                    >
                      <Check size={14} /> Mark Read
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
