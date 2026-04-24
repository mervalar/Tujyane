import SearchBar from '../components/search/SearchBar';
import styles from './Home.module.css';

const CITIES = ['Kigali', 'Musanze', 'Butare', 'Gisenyi', 'Rwamagana', 'Cyangugu'];

export default function Home() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              Travel across Rwanda — <span>together</span>
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
            { from: 'Kigali', to: 'Musanze', price: 'From 3,500 RWF', emoji: '🏔' },
            { from: 'Kigali', to: 'Butare',  price: 'From 2,000 RWF', emoji: '🎓' },
            { from: 'Kigali', to: 'Gisenyi', price: 'From 4,000 RWF', emoji: '🌊' },
            { from: 'Kigali', to: 'Rwamagana', price: 'From 2,500 RWF', emoji: '🌿' },
          ].map((r) => (
            <a
              key={r.from + r.to}
              href={`/results?from=${r.from}&to=${r.to}&date=${new Date().toISOString().split('T')[0]}`}
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

      {/* How it works */}
      <section className={styles.howSection}>
        <div className={`container ${styles.section}`}>
          <h2 className={styles.sectionTitle}>How it works</h2>
          <div className={styles.steps}>
            {[
              { icon: '🔍', title: 'Search', desc: 'Enter your departure city, destination, and travel date.' },
              { icon: '🪑', title: 'Choose', desc: 'Pick a carpool or bus that fits your time and budget.' },
              { icon: '✅', title: 'Book', desc: 'Confirm your seat in seconds. No cash needed.' },
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
