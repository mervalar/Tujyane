import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTrips } from '../context/TripContext';
import { useSearchTrips } from '../hooks/useSearchTrips';
import SearchBar from '../components/search/SearchBar';
import TripCard from '../components/trip/TripCard';
import FilterPanel from '../components/trip/FilterPanel';
import Spinner from '../components/common/Spinner';
import styles from './Results.module.css';

export default function Results() {
  const [searchParams] = useSearchParams();
  const { filteredResults, filters, setFilters, loading, error } = useTrips();
  const { search } = useSearchTrips();
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    const params = {
      from: searchParams.get('from') || '',
      to:   searchParams.get('to')   || '',
      date: searchParams.get('date') || '',
    };
    search(params);
  }, [searchParams.toString()]);

  const from = searchParams.get('from');
  const to   = searchParams.get('to');
  const date = searchParams.get('date');

  const activeFilterCount = [filters.type, filters.maxPrice].filter(Boolean).length;

  return (
    <div className={styles.page}>
      {/* Compact search bar */}
      <div className={styles.searchStrip}>
        <div className="container">
          <SearchBar compact />
        </div>
      </div>

      <div className={`container ${styles.body}`}>
        {/* Heading */}
        <div className={styles.heading}>
          {from && to ? (
            <h1>{from} → {to}</h1>
          ) : (
            <h1>All trips</h1>
          )}
          {date && (
            <p className={styles.dateLabel}>
              {new Date(date).toLocaleDateString('en-RW', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          )}
          {!loading && !error && (
            <p className={styles.count}>
              {filteredResults.length} trip{filteredResults.length !== 1 ? 's' : ''} found
            </p>
          )}
        </div>

        {/* Sort + filter bar */}
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
        </div>

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
                <p>Try different dates or remove filters.</p>
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
