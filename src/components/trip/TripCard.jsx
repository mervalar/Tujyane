import { useNavigate } from 'react-router-dom';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { formatPrice, formatTime, durationLabel } from '../../utils/format';
import styles from './TripCard.module.css';

export default function TripCard({ trip }) {
  const navigate = useNavigate();
  const isBus = trip.type === 'bus';
  const isFull = trip.seatsAvailable === 0;

  return (
    <article className={styles.card} aria-label={`Trip from ${trip.from.city} to ${trip.to.city}`}>
      <div className={styles.header}>
        <Badge variant={isBus ? 'bus' : 'carpool'}>
          {isBus ? '🚌 Bus' : '🚗 Carpool'}
        </Badge>
        {isFull && <Badge variant="error">Full</Badge>}
      </div>

      <div className={styles.route}>
        <div className={styles.point}>
          <span className={styles.time}>{formatTime(trip.departureTime)}</span>
          <span className={styles.city}>{trip.from.city}</span>
          <span className={styles.address}>{trip.from.address}</span>
        </div>

        <div className={styles.line}>
          <span className={styles.duration}>
            {durationLabel(trip.departureTime, trip.arrivalTime)}
          </span>
          <div className={styles.track} />
        </div>

        <div className={`${styles.point} ${styles.pointEnd}`}>
          <span className={styles.time}>{formatTime(trip.arrivalTime)}</span>
          <span className={styles.city}>{trip.to.city}</span>
          <span className={styles.address}>{trip.to.address}</span>
        </div>
      </div>

      <div className={styles.meta}>
        {isBus ? (
          <span className={styles.operator}>{trip.operator?.name}</span>
        ) : (
          <span className={styles.driver}>
            {trip.driver?.name} · ⭐ {trip.driver?.rating}
          </span>
        )}
        <span className={styles.seats}>
          {isFull ? 'No seats' : `${trip.seatsAvailable} seat${trip.seatsAvailable !== 1 ? 's' : ''}`}
        </span>
      </div>

      <div className={styles.footer}>
        <span className={styles.price}>{formatPrice(trip.price, trip.currency)}</span>
        <Button
          variant="primary"
          size="md"
          disabled={isFull}
          onClick={() => navigate(`/trips/${trip.id}`)}
        >
          {isFull ? 'Unavailable' : 'View & Book'}
        </Button>
      </div>
    </article>
  );
}
