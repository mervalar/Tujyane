import { useTrips } from '../../context/TripContext';
import styles from './FilterPanel.module.css';

export default function FilterPanel({ open }) {
  const { filters, setFilters, results } = useTrips();

  const maxPossiblePrice = results.length
    ? Math.max(...results.map((t) => t.price))
    : 10000;

  const activeCount = [filters.type, filters.maxPrice].filter(Boolean).length;

  function reset() {
    setFilters({ type: '', maxPrice: '' });
  }

  return (
    <aside className={`${styles.panel} ${open ? styles.panelOpen : ''}`} aria-label="Filter trips">
      <div className={styles.header}>
        <h3>
          Filters
          {activeCount > 0 && <span className={styles.activeCount}>{activeCount}</span>}
        </h3>
        {activeCount > 0 && (
          <button className={styles.resetBtn} onClick={reset}>Clear all</button>
        )}
      </div>

      {/* Trip type */}
      <section className={styles.group}>
        <h4>Trip type</h4>
        <div className={styles.typeGrid}>
          {[
            { value: '',        label: 'All',     icon: '🗺' },
            { value: 'carpool', label: 'Carpool',  icon: '🚗' },
            { value: 'bus',     label: 'Bus',      icon: '🚌' },
          ].map(({ value, label, icon }) => (
            <button
              key={value}
              className={`${styles.typeBtn} ${filters.type === value ? styles.typeBtnActive : ''}`}
              onClick={() => setFilters({ type: value })}
            >
              <span className={styles.typeIcon}>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Max price */}
      <section className={styles.group}>
        <h4>Max price</h4>
        <div className={styles.rangeRow}>
          <span>0 RWF</span>
          <span className={styles.priceVal}>
            {filters.maxPrice
              ? `${Number(filters.maxPrice).toLocaleString()} RWF`
              : 'Any'}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={maxPossiblePrice}
          step={500}
          value={filters.maxPrice || maxPossiblePrice}
          onChange={(e) => setFilters({ maxPrice: e.target.value })}
          className={styles.range}
        />
        {filters.maxPrice && (
          <button
            className={styles.clearPrice}
            onClick={() => setFilters({ maxPrice: '' })}
          >
            Remove price limit
          </button>
        )}
      </section>
    </aside>
  );
}
