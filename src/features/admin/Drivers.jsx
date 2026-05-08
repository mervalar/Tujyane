import { useEffect, useState } from 'react';
import { getDriverVerifications, approveDriver, rejectDriver } from '../../services/adminService';
import Spinner from '../../components/common/Spinner';
import { formatDate } from '../../utils/format';
import styles from './Drivers.module.css';

const TABS = [
  { value: '',          label: 'All' },
  { value: 'pending',   label: 'Pending' },
  { value: 'approved',  label: 'Approved' },
  { value: 'rejected',  label: 'Rejected' },
];

// Derive a display status from the MongoDB fields
function driverStatus(d) {
  if (d.isVerified) return 'approved';
  if (d.rejectionReason) return 'rejected';
  return 'pending';
}

function RejectModal({ driver, onConfirm, onClose }) {
  const [reason, setReason] = useState('');
  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>Reject Driver Application</h3>
        <p className={styles.modalSub}>
          You are about to reject <strong>{driver.fullname}</strong>'s application.
        </p>
        <textarea
          className={styles.modalTextarea}
          placeholder="Reason for rejection (required)…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
        />
        <div className={styles.modalActions}>
          <button className={styles.cancelModalBtn} onClick={onClose}>Cancel</button>
          <button
            className={styles.rejectModalBtn}
            onClick={() => reason.trim() && onConfirm(reason.trim())}
            disabled={!reason.trim()}
          >
            Reject Application
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDrivers() {
  const [tab, setTab]         = useState('');
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);

  useEffect(() => {
    setLoading(true);
    getDriverVerifications({ status: tab })
      .then(setDrivers)
      .finally(() => setLoading(false));
  }, [tab]);

  async function handleApprove(driverId) {
    setActionId(driverId);
    await approveDriver(driverId);
    setDrivers((prev) =>
      prev.map((d) => d._id === driverId ? { ...d, isVerified: true, rejectionReason: '' } : d)
    );
    setActionId(null);
  }

  async function handleReject(reason) {
    const driverId = rejectTarget._id;
    setActionId(driverId);
    setRejectTarget(null);
    await rejectDriver(driverId, reason);
    setDrivers((prev) =>
      prev.map((d) => d._id === driverId ? { ...d, isVerified: false, rejectionReason: reason } : d)
    );
    setActionId(null);
  }

  return (
    <div className={styles.page}>
      {rejectTarget && (
        <RejectModal
          driver={rejectTarget}
          onConfirm={handleReject}
          onClose={() => setRejectTarget(null)}
        />
      )}

      <div className={styles.header}>
        <h1 className={styles.title}>Driver Verifications</h1>
      </div>

      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t.value}
            className={`${styles.tab} ${tab === t.value ? styles.tabActive : ''}`}
            onClick={() => setTab(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : drivers.length === 0 ? (
        <div className={styles.empty}>No drivers in this category.</div>
      ) : (
        <div className={styles.cards}>
          {drivers.map((d) => {
            const status = driverStatus(d);
            return (
              <div key={d._id} className={styles.card}>
                <div className={styles.cardHead}>
                  <div className={styles.driverAvatar}>{d.fullname?.[0]?.toUpperCase() ?? '?'}</div>
                  <div className={styles.driverMeta}>
                    <span className={styles.driverName}>{d.fullname ?? '—'}</span>
                    <span className={styles.driverEmail}>{d.email}</span>
                  </div>
                  <span className={`${styles.statusBadge} ${styles[status]}`}>
                    {status}
                  </span>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Phone</span>
                      <span className={styles.infoValue}>{d.phone}</span>
                    </div>
                    {d.vehicle?.licenseNumber && (
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>License</span>
                        <span className={styles.infoValue}>{d.vehicle.licenseNumber}</span>
                      </div>
                    )}
                    {d.vehicle && (
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Vehicle</span>
                        <span className={styles.infoValue}>
                          {[d.vehicle.year, d.vehicle.make, d.vehicle.model, d.vehicle.color && `(${d.vehicle.color})`]
                            .filter(Boolean).join(' ')}
                        </span>
                      </div>
                    )}
                    {d.vehicle?.plateNumber && (
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Plate</span>
                        <span className={`${styles.infoValue} ${styles.plate}`}>{d.vehicle.plateNumber}</span>
                      </div>
                    )}
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Applied</span>
                      <span className={styles.infoValue}>{formatDate(d.createdAt)}</span>
                    </div>
                  </div>

                  {d.rejectionReason && (
                    <div className={styles.rejectedNote}>
                      <strong>Rejection reason:</strong> {d.rejectionReason}
                    </div>
                  )}
                </div>

                {status === 'pending' && (
                  <div className={styles.cardActions}>
                    <button
                      className={styles.approveBtn}
                      onClick={() => handleApprove(d._id)}
                      disabled={actionId === d._id}
                    >
                      {actionId === d._id ? 'Approving…' : '✓ Approve'}
                    </button>
                    <button
                      className={styles.rejectBtn}
                      onClick={() => setRejectTarget(d)}
                      disabled={actionId === d._id}
                    >
                      ✕ Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
