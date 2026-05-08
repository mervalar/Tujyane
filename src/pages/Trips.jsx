import { useEffect, useState } from 'react';
import { useTrips } from '../context/TripContext';
import { useSearchTrips } from '../hooks/useSearchTrips';
import TripCard from '../components/trip/TripCard';
import FilterPanel from '../components/trip/FilterPanel';
import Spinner from '../components/common/Spinner';
import styles from './Trips.module.css';

const CITIES = ['Kigali', 'Musanze', 'Butare', 'Gisenyi', 'Rwamagana', 'Nyamata', 'Kibungo', 'Cyangugu'];
const today = new Date().toISOString().split('T')[0];

export default function Trips() {
  const { filteredResults, filters, setFilters, loading, error } = useTrips();
  const { search } = useSearchTrips();
  const [filterOpen, setFilterOpen] = useState(false);
  const [form, setForm] = useState({ from: '', to: '', date: '' });

  useEffect(() => {
    search({});
  }, []);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSwap() {
    setForm((f) => ({ ...f, from: f.to, to: f.from }));
  }

  function handleSearch(e) {
    e.preventDefault();
    search(form);
  }

  const activeFilterCount = [filters.type, filters.maxPrice].filter(Boolean).length;

  return (
    <div className={styles.page}>

      {/* ── Search header ── */}
      <div className={styles.searchHeader}>
        <div className="container">
          <h1 className={styles.title}>Find your next trip</h1>
          <p className={styles.subtitle}>Search by destination, origin, date or browse all upcoming trips below.</p>

          <form className={styles.searchForm} onSubmit={handleSearch}>
            <div className={styles.fields}>

              <div className={styles.field}>
                <label htmlFor="tf-from" className={styles.label}>From</label>
                <div className={styles.selectWrap}>
                  <span className={styles.fieldIcon}>📍</span>
                  <select
                    id="tf-from"
                    name="from"
                    value={form.from}
                    onChange={handleChange}
                    className={styles.select}
                  >
                    <option value="">Any city</option>
                    {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <button
                type="button"
                className={styles.swapBtn}
                onClick={handleSwap}
                aria-label="Swap cities"
              >
                ⇄
              </button>

              <div className={styles.field}>
                <label htmlFor="tf-to" className={styles.label}>To</label>
                <div className={styles.selectWrap}>
                  <span className={styles.fieldIcon}>🏁</span>
                  <select
                    id="tf-to"
                    name="to"
                    value={form.to}
                    onChange={handleChange}
                    className={styles.select}
                  >
                    <option value="">Any city</option>
                    {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="tf-date" className={styles.label}>Date</label>
                <div className={styles.selectWrap}>
                  <span className={styles.fieldIcon}>📅</span>
                  <input
                    type="date"
                    id="tf-date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    min={today}
                    className={styles.select}
                  />
                </div>
              </div>
            </div>

            <button type="submit" className={styles.searchBtn}>
              Search trips
            </button>
          </form>
        </div>
      </div>

      {/* ── Results body ── */}
      <div className={`container ${styles.body}`}>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <button
            className={`${styles.filterToggle} ${filterOpen ? styles.filterToggleActive : ''}`}
            onClick={() => setFilterOpen((o) => !o)}
            aria-expanded={filterOpen}
          >
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className={styles.badge}>{activeFilterCount}</span>
            )}
          </button>

          <div className={styles.sortChips}>
            <span className={styles.sortLabel}>Sort:</span>
            <button
              className={`${styles.chip} ${filters.sortBy === 'time' ? styles.chipActive : ''}`}
              onClick={() => setFilters({ sortBy: 'time' })}
            >
              Earliest departure
            </button>
            <button
              className={`${styles.chip} ${filters.sortBy === 'price' ? styles.chipActive : ''}`}
              onClick={() => setFilters({ sortBy: 'price' })}
            >
              Lowest price
            </button>
          </div>

          {!loading && !error && (
            <span className={styles.count}>
              {filteredResults.length} trip{filteredResults.length !== 1 ? 's' : ''} found
            </span>
          )}
        </div>

        {/* Grid */}
        <div className={styles.grid}>
          <FilterPanel open={filterOpen} />

          <section className={styles.list}>
            {loading && <Spinner />}

            {!loading && error && (
              <div className={styles.empty}>
                <span>⚠️</span>
                <p>{error}</p>
              </div>
            )}

            {!loading && !error && filteredResults.length === 0 && (
              <div className={styles.empty}>
                <span>🔍</span>
                <h3>No trips found</h3>
                <p>Try a different date, route, or remove some filters.</p>
              </div>
            )}

            {!loading && filteredResults.map((trip) => (
              <TripCard key={trip._id} trip={trip} />
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
