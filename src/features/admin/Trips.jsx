import { useEffect, useState, useCallback } from 'react';
import { getAllTrips, cancelAdminTrip } from '../../services/adminService';
import Spinner from '../../components/common/Spinner';
import { formatPrice, formatDate } from '../../utils/format';
import styles from './Trips.module.css';

export default function AdminTrips() {
  const [trips, setTrips]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [type, setType]       = useState('');
  const [status, setStatus]   = useState('');
  const [actionId, setActionId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllTrips({ search, type, status });
      setTrips(data);
    } finally {
      setLoading(false);
    }
  }, [search, type, status]);

  useEffect(() => { load(); }, [load]);

  async function handleCancel(tripId) {
    if (!window.confirm('Cancel this trip? All bookings will be notified.')) return;
    setActionId(tripId);
    await cancelAdminTrip(tripId);
    setTrips((prev) =>
      prev.map((t) => t._id === tripId ? { ...t, status: 'cancelled' } : t)
    );
    setActionId(null);
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Trips</h1>
        <p className={styles.count}>{trips.length} result{trips.length !== 1 ? 's' : ''}</p>
      </div>

      <div className={styles.filters}>
        <input
          className={styles.search}
          type="search"
          placeholder="Search by city…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className={styles.select} value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All types</option>
          <option value="carpool">Carpool</option>
          <option value="bus">Bus</option>
        </select>
        <select className={styles.select} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : trips.length === 0 ? (
        <div className={styles.empty}>No trips match your filters.</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Route</th>
                <th>Type</th>
                <th>Provider</th>
                <th>Date</th>
                <th>Time</th>
                <th>Seats</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((t) => (
                <tr key={t._id} className={t.status === 'cancelled' ? styles.rowCancelled : ''}>
                  <td>
                    <div className={styles.route}>
                      <span className={styles.routeFrom}>{t.from.city}</span>
                      <span className={styles.routeArrow}>→</span>
                      <span className={styles.routeTo}>{t.to.city}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.typeBadge} ${t.type === 'bus' ? styles.typeBus : styles.typeCarpool}`}>
                      {t.type === 'bus' ? '🚌 Bus' : '🚗 Carpool'}
                    </span>
                  </td>
                  <td className={styles.muted}>
                    {t.driver?.fullname ?? '—'}
                  </td>
                  <td className={styles.muted}>{formatDate(t.date)}</td>
                  <td className={styles.muted}>{t.departureTime}</td>
                  <td>
                    <div className={styles.seatsCell}>
                      <div
                        className={styles.seatsBar}
                        style={{ '--pct': `${((t.seatsTotal - t.seatsAvailable) / t.seatsTotal) * 100}%` }}
                      />
                      <span>{t.seatsAvailable}/{t.seatsTotal}</span>
                    </div>
                  </td>
                  <td className={styles.price}>{formatPrice(t.price, t.currency)}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${t.status === 'active' ? styles.active : styles.cancelled}`}>
                      {t.status}
                    </span>
                  </td>
                  <td>
                    {t.status === 'active' && (
                      <button
                        className={styles.cancelBtn}
                        onClick={() => handleCancel(t._id)}
                        disabled={actionId === t._id}
                      >
                        {actionId === t._id ? '…' : 'Cancel'}
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
