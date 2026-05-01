import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDriverTrips, cancelTrip } from '../../services/driverService';
import { formatPrice, formatDate } from '../../utils/format';
import styles from './Trips.module.css';

const STATUS_COLORS = { active: 'success', completed: 'info', cancelled: 'muted' };
const STATUS_LABELS = { active: 'Active', completed: 'Completed', cancelled: 'Cancelled' };

export default function Trips() {
  const navigate = useNavigate();
  const [trips,   setTrips]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    getDriverTrips()
      .then(t => setTrips(Array.isArray(t) ? t : []))
      .catch(() => setTrips([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? trips : trips.filter(t => t.status === filter);

  async function handleCancel(tripId) {
    if (!window.confirm('Cancel this trip? Passengers will be notified.')) return;
    setCancelling(tripId);
    try {
      await cancelTrip(tripId);
      setTrips(prev => prev.map(t => t._id === tripId ? { ...t, status: 'cancelled' } : t));
    } catch (err) {
      alert(err.message || 'Could not cancel trip.');
    } finally {
      setCancelling(null);
    }
  }

  const totalEarnings = trips
    .filter(t => t.status !== 'cancelled')
    .reduce((s, t) => s + t.price * (t.seatsTotal - t.seatsAvailable), 0);

  return (
    <div className={styles.page}>

      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>My Trips</h1>
          <p className={styles.pageSubtitle}>Manage all your posted trips.</p>
        </div>
        <button className={styles.createBtn} onClick={() => navigate('/driver/create')}>
          + Create Trip
        </button>
      </div>

      {/* Summary row */}
      <div className={styles.summaryRow}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryVal}>{trips.length}</span>
          <span className={styles.summaryLabel}>Total Trips</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryVal}>{trips.filter(t => t.status === 'active').length}</span>
          <span className={styles.summaryLabel}>Active</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryVal}>
            {trips.reduce((s, t) => s + (t.seatsTotal - t.seatsAvailable), 0)}
          </span>
          <span className={styles.summaryLabel}>Seats Booked</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryVal}>{formatPrice(totalEarnings, 'RWF')}</span>
          <span className={styles.summaryLabel}>Est. Earnings</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className={styles.filters}>
        {['all', 'active', 'completed', 'cancelled'].map(f => (
          <button
            key={f}
            className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
          <p>Loading trips…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>🚗</span>
          <h3>No trips found</h3>
          <p>{filter === 'all' ? 'Create your first trip to start earning.' : `No ${filter} trips.`}</p>
          {filter === 'all' && (
            <button className={styles.createBtn} onClick={() => navigate('/driver/create')}>
              Create a trip
            </button>
          )}
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map(trip => {
            const booked = trip.seatsTotal - trip.seatsAvailable;
            const earnings = trip.price * booked;
            return (
              <div key={trip._id || trip.id} className={`${styles.card} ${trip.status === 'cancelled' ? styles.cardCancelled : ''}`}>
                <div className={styles.cardTop}>
                  <div className={styles.route}>
                    <span className={styles.city}>{trip.from?.city || trip.from}</span>
                    <span className={styles.arrow}>→</span>
                    <span className={styles.city}>{trip.to?.city || trip.to}</span>
                  </div>
                  <span className={`${styles.badge} ${styles[`badge_${STATUS_COLORS[trip.status] || 'info'}`]}`}>
                    {STATUS_LABELS[trip.status] || trip.status}
                  </span>
                </div>

                <div className={styles.meta}>
                  <span className={styles.metaItem}>📅 {formatDate(trip.date)} at {trip.departureTime}</span>
                  <span className={styles.metaItem}>🪑 {booked}/{trip.seatsTotal} booked</span>
                  <span className={styles.metaItem}>💰 {formatPrice(trip.price, trip.currency || 'RWF')}/seat</span>
                  {earnings > 0 && (
                    <span className={`${styles.metaItem} ${styles.earnings}`}>
                      💵 {formatPrice(earnings, trip.currency || 'RWF')} earned
                    </span>
                  )}
                </div>

                {trip.description && (
                  <p className={styles.desc}>{trip.description}</p>
                )}

                <div className={styles.cardActions}>
                  {trip.status === 'active' && (
                    <button
                      className={styles.cancelTripBtn}
                      disabled={cancelling === (trip._id || trip.id)}
                      onClick={() => handleCancel(trip._id || trip.id)}
                    >
                      {cancelling === (trip._id || trip.id) ? 'Cancelling…' : 'Cancel trip'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
