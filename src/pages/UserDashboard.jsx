import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserTrips, cancelBooking } from '../services/bookingsService';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import { formatPrice, formatDate, statusColor } from '../utils/format';
import styles from './UserDashboard.module.css';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    getUserTrips()
      .then(setBookings)
      .finally(() => setLoading(false));
  }, []);

  async function handleCancel(bookingId) {
    if (!window.confirm('Cancel this booking?')) return;
    setCancelling(bookingId);
    await cancelBooking(bookingId);
    setBookings((prev) =>
      prev.map((b) => b._id === bookingId ? { ...b, status: 'cancelled' } : b)
    );
    setCancelling(null);
  }

  if (loading) return <Spinner />;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>My Bookings</h1>

      {bookings.length === 0 ? (
        <div className={styles.empty}>
          <span>🎫</span>
          <h3>No bookings yet</h3>
          <p>Find a trip and book your first ride.</p>
          <Button variant="primary" onClick={() => navigate('/')}>Search trips</Button>
        </div>
      ) : (
        <div className={styles.list}>
          {bookings.map((b) => {
            const trip = b.trip;
            return (
              <div key={b._id} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.route}>
                    <span className={styles.city}>{trip.from.city}</span>
                    <span className={styles.arrow}>→</span>
                    <span className={styles.city}>{trip.to.city}</span>
                  </div>
                  <span
                    className={styles.status}
                    style={{ color: statusColor(b.status) }}
                  >
                    {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                  </span>
                </div>

                <div className={styles.meta}>
                  <span>📅 {formatDate(trip.date)} at {trip.departureTime}</span>
                  <span>🪑 {b.seatsBooked} seat{b.seatsBooked > 1 ? 's' : ''}</span>
                  <span>💰 {formatPrice(b.totalPrice, b.currency)}</span>
                </div>

                <div className={styles.actions}>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/trips/${trip._id}`)}>
                    View trip
                  </Button>
                  {b.status !== 'cancelled' && (
                    <Button
                      variant="danger"
                      size="sm"
                      loading={cancelling === b._id}
                      onClick={() => handleCancel(b._id)}
                    >
                      Cancel
                    </Button>
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
