import { useEffect, useState, useCallback } from 'react';
import { getAllBookings, cancelAdminBooking } from '../../services/adminService';
import Spinner from '../../components/common/Spinner';
import { formatPrice, formatDate } from '../../utils/format';
import styles from './Bookings.module.css';

const STATUS_OPTS = ['', 'confirmed', 'pending', 'cancelled'];

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [status, setStatus]     = useState('');
  const [actionId, setActionId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllBookings({ search, status });
      setBookings(data);
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => { load(); }, [load]);

  async function handleCancel(bookingId) {
    if (!window.confirm('Cancel this booking?')) return;
    setActionId(bookingId);
    await cancelAdminBooking(bookingId);
    setBookings((prev) =>
      prev.map((b) => b._id === bookingId ? { ...b, status: 'cancelled' } : b)
    );
    setActionId(null);
  }

  const total = bookings.reduce((sum, b) => (b.status !== 'cancelled' ? sum + (b.totalPrice ?? 0) : sum), 0);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Bookings</h1>
          <p className={styles.count}>{bookings.length} result{bookings.length !== 1 ? 's' : ''}</p>
        </div>
        <div className={styles.totalCard}>
          <span className={styles.totalLabel}>Showing revenue</span>
          <span className={styles.totalValue}>{formatPrice(total, 'RWF')}</span>
        </div>
      </div>

      <div className={styles.filters}>
        <input
          className={styles.search}
          type="search"
          placeholder="Search passenger or route…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className={styles.select} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUS_OPTS.filter(Boolean).map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : bookings.length === 0 ? (
        <div className={styles.empty}>No bookings match your filters.</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Passenger</th>
                <th>Route</th>
                <th>Date</th>
                <th>Seats</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Booked</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id} className={b.status === 'cancelled' ? styles.rowCancelled : ''}>
                  <td>
                    <div className={styles.passengerCell}>
                      <div className={styles.avatar}>
                        {b.passenger?.fullname?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <span className={styles.passengerName}>{b.passenger?.fullname ?? '—'}</span>
                    </div>
                  </td>
                  <td className={styles.route}>
                    {b.trip?.from?.city ?? '?'} → {b.trip?.to?.city ?? '?'}
                  </td>
                  <td className={styles.muted}>{formatDate(b.trip?.date)}</td>
                  <td className={styles.center}>{b.seatsBooked}</td>
                  <td className={styles.amount}>{formatPrice(b.totalPrice, 'RWF')}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[b.status]}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className={styles.muted}>{formatDate(b.createdAt)}</td>
                  <td>
                    {b.status !== 'cancelled' && (
                      <button
                        className={styles.cancelBtn}
                        onClick={() => handleCancel(b._id)}
                        disabled={actionId === b._id}
                      >
                        {actionId === b._id ? '…' : 'Cancel'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
