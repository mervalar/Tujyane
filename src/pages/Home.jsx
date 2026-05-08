import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/search/SearchBar';
import TripCard from '../components/trip/TripCard';
import Spinner from '../components/common/Spinner';
import { getTrips } from '../services/tripsService';
import styles from './Home.module.css';

export default function Home() {
  const [trips, setTrips]           = useState([]);
  const [tripsLoading, setTripsLoading] = useState(true);

  useEffect(() => {
    getTrips()
      .then((data) => setTrips(data.slice(0, 6)))
      .catch(() => {})
      .finally(() => setTripsLoading(false));
  }, []);

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              Travel across Rwanda <span>together</span>
            </h1>
            <p className={styles.heroSub}>
              Book a seat in a carpool or catch the next bus. Fast, affordable, and simple.
            </p>
          </div>
          <div className={styles.searchWrap}>
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Popular routes */}
      <section className={`container ${styles.section}`}>
        <h2 className={styles.sectionTitle}>Popular routes</h2>
        <div className={styles.routes}>
          {[
            { from: 'Kigali', to: 'Musanze',  emoji: '🏔' },
            { from: 'Kigali', to: 'Butare',   emoji: '🎓' },
            { from: 'Kigali', to: 'Gisenyi',  emoji: '🌊' },
            { from: 'Kigali', to: 'Rwamagana', emoji: '🌿' },
          ].map((r) => (
            <a
             
              className={styles.routeCard}
            >
              <span className={styles.routeEmoji}>{r.emoji}</span>
              <div>
                <p className={styles.routeName}>{r.from} → {r.to}</p>
                <p className={styles.routePrice}>{r.price}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Upcoming trips */}
      <section className={`container ${styles.section}`}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionHeadTitle}>Upcoming trips</h2>
          <Link to="/results" className={styles.seeAll}>See all →</Link>
        </div>
        {tripsLoading ? (
          <Spinner />
        ) : trips.length === 0 ? (
          <p className={styles.empty}>No upcoming trips at the moment. Check back soon.</p>
        ) : (
          <div className={styles.tripsGrid}>
            {trips.map((trip) => (
              <TripCard key={trip._id} trip={trip} />
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className={styles.howSection}>
        <div className={`container ${styles.section}`}>
          <h2 className={styles.sectionTitle}>How it works</h2>
          <div className={styles.steps}>
            {[
              { icon: '🔍', title: 'Search', desc: 'Enter your departure city, destination, and travel date.' },
              { icon: '🪑', title: 'Choose', desc: 'Pick a carpool or bus that fits your time and budget.' },
              { icon: '✅', title: 'Book', desc: 'Confirm your seat in seconds.' },
              { icon: '🚀', title: 'Travel', desc: 'Enjoy your trip. Driver contacts you before departure.' },
            ].map((s) => (
              <div key={s.title} className={styles.step}>
                <span className={styles.stepIcon}>{s.icon}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
