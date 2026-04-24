import { useTrips } from '../../context/TripContext';
import Button from '../common/Button';
import styles from './FilterPanel.module.css';

export default function FilterPanel() {
  const { filters, setFilters, results } = useTrips();

  const maxPossiblePrice = results.length
    ? Math.max(...results.map((t) => t.price))
    : 10000;

  function reset() {
    setFilters({ type: '', maxPrice: '', sortBy: 'time' });
  }

  return (
    <aside className={styles.panel} aria-label="Filter trips">
      <div className={styles.header}>
        <h3>Filter</h3>
        <button className={styles.resetBtn} onClick={reset}>Reset</button>
      </div>

      <section className={styles.group}>
        <h4>Trip type</h4>
        <label className={styles.radio}>
          <input type="radio" name="type" value="" checked={filters.type === ''} onChange={() => setFilters({ type: '' })} />
          All
        </label>
        <label className={styles.radio}>
          <input type="radio" name="type" value="carpool" checked={filters.type === 'carpool'} onChange={() => setFilters({ type: 'carpool' })} />
          🚗 Carpool
        </label>
        <label className={styles.radio}>
          <input type="radio" name="type" value="bus" checked={filters.type === 'bus'} onChange={() => setFilters({ type: 'bus' })} />
          🚌 Bus
        </label>
      </section>

      <section className={styles.group}>
        <h4>Max price</h4>
        <div className={styles.rangeRow}>
          <span>0 RWF</span>
          <span>{filters.maxPrice ? `${Number(filters.maxPrice).toLocaleString()} RWF` : 'Any'}</span>
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
      </section>

      <section className={styles.group}>
        <h4>Sort by</h4>
        <label className={styles.radio}>
          <input type="radio" name="sort" value="time" checked={filters.sortBy === 'time'} onChange={() => setFilters({ sortBy: 'time' })} />
          Earliest departure
        </label>
        <label className={styles.radio}>
          <input type="radio" name="sort" value="price" checked={filters.sortBy === 'price'} onChange={() => setFilters({ sortBy: 'price' })} />
          Lowest price
        </label>
      </section>
    </aside>
  );
}
