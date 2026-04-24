import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTripById } from '../services/tripsService';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import { formatPrice, formatDate, durationLabel } from '../utils/format';
import styles from './TripDetail.module.css';

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getTripById(id)
      .then(setTrip)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (error || !trip)
    return (
      <div className={styles.errorState}>
        <span>⚠️</span>
        <p>{error || 'Trip not found.'}</p>
        <Button onClick={() => navigate(-1)}>Go back</Button>
      </div>
    );

  const isBus    = trip.type === 'bus';
  const isFull   = trip.seatsAvailable === 0;
  const provider = isBus ? trip.operator : trip.driver;

  function handleBook() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/trips/${id}` } });
      return;
    }
    navigate(`/book/${id}`);
  }

  return (
    <div className={`container ${styles.page}`}>
      <button className={styles.back} onClick={() => navigate(-1)}>← Back</button>

      <div className={styles.grid}>
        {/* Main info */}
        <article className={styles.main}>
          <div className={styles.topRow}>
            <Badge variant={isBus ? 'bus' : 'carpool'}>
              {isBus ? '🚌 Bus' : '🚗 Carpool'}
            </Badge>
            {isFull && <Badge variant="error">Fully booked</Badge>}
          </div>

          <div className={styles.route}>
            <div className={styles.point}>
              <span className={styles.time}>{trip.departureTime}</span>
              <span className={styles.city}>{trip.from.city}</span>
              <span className={styles.address}>{trip.from.address}</span>
            </div>
            <div className={styles.line}>
              <span className={styles.dur}>{durationLabel(trip.departureTime, trip.arrivalTime)}</span>
              <div className={styles.track} />
            </div>
            <div className={`${styles.point} ${styles.pointEnd}`}>
              <span className={styles.time}>{trip.arrivalTime}</span>
              <span className={styles.city}>{trip.to.city}</span>
              <span className={styles.address}>{trip.to.address}</span>
            </div>
          </div>

          <p className={styles.date}>📅 {formatDate(trip.date)}</p>

          {trip.description && (
            <p className={styles.description}>{trip.description}</p>
          )}

          {trip.amenities?.length > 0 && (
            <div className={styles.amenities}>
              <h3>Included</h3>
              <div className={styles.amenityList}>
                {trip.amenities.map((a) => (
                  <span key={a} className={styles.amenityTag}>{a}</span>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Booking sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.priceBox}>
            <span className={styles.priceLabel}>Price per seat</span>
            <span className={styles.price}>{formatPrice(trip.price, trip.currency)}</span>
          </div>

          <div className={styles.seatsInfo}>
            <span>{isFull ? '😔 No seats left' : `${trip.seatsAvailable} of ${trip.seatsTotal} seats available`}</span>
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={isFull}
            onClick={handleBook}
          >
            {isFull ? 'Fully booked' : 'Book this trip'}
          </Button>

          {!isAuthenticated && !isFull && (
            <p className={styles.loginHint}>You need to <button className={styles.linkBtn} onClick={() => navigate('/login')}>sign in</button> to book.</p>
          )}

          {/* Provider info */}
          <div className={styles.providerCard}>
            <div className={styles.providerAvatar}>
              {provider?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p className={styles.providerName}>{provider?.name}</p>
              {!isBus && trip.driver?.rating && (
                <p className={styles.providerMeta}>⭐ {trip.driver.rating} · {trip.driver.trips} trips</p>
              )}
              {isBus && <p className={styles.providerMeta}>Registered operator</p>}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
