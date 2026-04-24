import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTripById } from '../services/tripsService';
import { useBooking } from '../hooks/useBooking';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import { formatPrice, formatDate, durationLabel } from '../utils/format';
import styles from './Booking.module.css';

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { book, loading: booking, error: bookingError } = useBooking();

  const [trip, setTrip]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [seats, setSeats]     = useState(1);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    getTripById(id)
      .then(setTrip)
      .catch(() => navigate(-1))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleBook() {
    try {
      await book({ tripId: id, seats });
      setConfirmed(true);
    } catch (_) {}
  }

  if (loading) return <Spinner />;
  if (!trip)   return null;

  if (confirmed) {
    return (
      <div className={styles.success}>
        <span className={styles.successIcon}>🎉</span>
        <h1>Booking confirmed!</h1>
        <p>
          Your {seats} seat{seats > 1 ? 's' : ''} on <strong>{trip.from.city} → {trip.to.city}</strong> on{' '}
          {formatDate(trip.date)} at {trip.departureTime} are reserved.
        </p>
        <p className={styles.total}>Total paid: <strong>{formatPrice(trip.price * seats, trip.currency)}</strong></p>
        <div className={styles.successActions}>
          <Button variant="primary" size="lg" onClick={() => navigate('/dashboard')}>
            View my bookings
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate('/')}>
            Search more trips
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`container ${styles.page}`}>
      <button className={styles.back} onClick={() => navigate(-1)}>← Back</button>
      <h1 className={styles.title}>Confirm your booking</h1>

      <div className={styles.grid}>
        {/* Trip summary */}
        <section className={styles.summary}>
          <h2>Trip summary</h2>
          <div className={styles.summaryRoute}>
            <div className={styles.summaryPoint}>
              <span className={styles.sumTime}>{trip.departureTime}</span>
              <span className={styles.sumCity}>{trip.from.city}</span>
            </div>
            <div className={styles.sumArrow}>
              <span className={styles.sumDur}>{durationLabel(trip.departureTime, trip.arrivalTime)}</span>
              <span>→</span>
            </div>
            <div className={`${styles.summaryPoint} ${styles.summaryPointEnd}`}>
              <span className={styles.sumTime}>{trip.arrivalTime}</span>
              <span className={styles.sumCity}>{trip.to.city}</span>
            </div>
          </div>
          <p className={styles.summaryDate}>📅 {formatDate(trip.date)}</p>

          <div className={styles.seatsRow}>
            <label htmlFor="seats" className={styles.seatsLabel}>Number of seats</label>
            <div className={styles.seatsPicker}>
              <button
                className={styles.seatsBtn}
                onClick={() => setSeats((s) => Math.max(1, s - 1))}
                disabled={seats <= 1}
                aria-label="Remove seat"
              >−</button>
              <span className={styles.seatsCount}>{seats}</span>
              <button
                className={styles.seatsBtn}
                onClick={() => setSeats((s) => Math.min(trip.seatsAvailable, s + 1))}
                disabled={seats >= trip.seatsAvailable}
                aria-label="Add seat"
              >+</button>
            </div>
          </div>
        </section>

        {/* Payment summary */}
        <aside className={styles.payment}>
          <h2>Price breakdown</h2>
          <div className={styles.priceRow}>
            <span>{formatPrice(trip.price, trip.currency)} × {seats} seat{seats > 1 ? 's' : ''}</span>
            <strong>{formatPrice(trip.price * seats, trip.currency)}</strong>
          </div>
          <div className={`${styles.priceRow} ${styles.total}`}>
            <span>Total</span>
            <strong>{formatPrice(trip.price * seats, trip.currency)}</strong>
          </div>

          {bookingError && <div className={styles.error}>{bookingError}</div>}

          <Button variant="primary" size="lg" fullWidth loading={booking} onClick={handleBook}>
            Confirm booking
          </Button>
          <p className={styles.cancelNote}>Free cancellation up to 2 hours before departure.</p>
        </aside>
      </div>
    </div>
  );
}
