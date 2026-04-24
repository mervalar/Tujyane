import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDriverTrips } from '../services/tripsService';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Spinner from '../components/common/Spinner';
import { formatPrice, formatDate } from '../utils/format';
import styles from './DriverDashboard.module.css';

export default function DriverDashboard() {
  const navigate = useNavigate();
  const [trips, setTrips]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDriverTrips()
      .then(setTrips)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const totalEarnings = trips.reduce((sum, t) => {
    const booked = t.seatsTotal - t.seatsAvailable;
    return sum + t.price * booked;
  }, 0);

  return (
    <div className={styles.page}>
      <div className={styles.topRow}>
        <h1 className={styles.title}>My Trips</h1>
        <Button variant="primary" onClick={() => navigate('/driver/create')}>
          + Create trip
        </Button>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statVal}>{trips.length}</span>
          <span className={styles.statLabel}>Total trips</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statVal}>
            {trips.reduce((s, t) => s + (t.bookings?.length || 0), 0)}
          </span>
          <span className={styles.statLabel}>Passengers booked</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statVal}>{formatPrice(totalEarnings, 'RWF')}</span>
          <span className={styles.statLabel}>Estimated earnings</span>
        </div>
      </div>

      {trips.length === 0 ? (
        <div className={styles.empty}>
          <span>🚗</span>
          <h3>No trips yet</h3>
          <p>Create your first trip and start earning.</p>
          <Button variant="primary" onClick={() => navigate('/driver/create')}>Create a trip</Button>
        </div>
      ) : (
        <div className={styles.list}>
          {trips.map((trip) => {
            const bookedSeats = trip.seatsTotal - trip.seatsAvailable;
            return (
              <div key={trip.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.route}>
                    <span className={styles.city}>{trip.from.city}</span>
                    <span className={styles.arrow}>→</span>
                    <span className={styles.city}>{trip.to.city}</span>
                  </div>
                  <Badge variant={trip.seatsAvailable > 0 ? 'success' : 'error'}>
                    {trip.seatsAvailable > 0 ? `${trip.seatsAvailable} seats left` : 'Full'}
                  </Badge>
                </div>

                <div className={styles.meta}>
                  <span>📅 {formatDate(trip.date)} at {trip.departureTime}</span>
                  <span>🪑 {bookedSeats}/{trip.seatsTotal} booked</span>
                  <span>💰 {formatPrice(trip.price, trip.currency)} / seat</span>
                </div>

                {trip.bookings?.length > 0 && (
                  <div className={styles.passengers}>
                    <h4>Passengers</h4>
                    <ul className={styles.passengerList}>
                      {trip.bookings.map((b) => (
                        <li key={b.id} className={styles.passenger}>
                          <span>👤 {b.passenger.name}</span>
                          <span className={styles.passengerSeats}>{b.seats} seat{b.seats > 1 ? 's' : ''}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className={styles.cardActions}>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/trips/${trip.id}`)}>
                    View details
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
