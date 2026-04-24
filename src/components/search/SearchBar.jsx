import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrips } from '../../context/TripContext';
import Button from '../common/Button';
import styles from './SearchBar.module.css';

const CITIES = ['Kigali', 'Musanze', 'Butare', 'Gisenyi', 'Rwamagana', 'Nyamata', 'Kibungo', 'Cyangugu'];

export default function SearchBar({ compact = false }) {
  const { searchParams, setSearchParams } = useTrips();
  const [form, setForm] = useState({
    from: searchParams.from || '',
    to:   searchParams.to   || '',
    date: searchParams.date || '',
  });
  const navigate = useNavigate();

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSearchParams(form);
    navigate(`/results?from=${encodeURIComponent(form.from)}&to=${encodeURIComponent(form.to)}&date=${form.date}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={[styles.form, compact ? styles.compact : ''].join(' ')}
      aria-label="Search trips"
    >
      <div className={styles.fields}>
        <div className={styles.field}>
          <label htmlFor="from" className={styles.label}>From</label>
          <div className={styles.selectWrap}>
            <span className={styles.icon}>📍</span>
            <select id="from" name="from" value={form.from} onChange={handleChange} required className={styles.select}>
              <option value="">Select city</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <button
          type="button"
          className={styles.swapBtn}
          aria-label="Swap cities"
          onClick={() => setForm((f) => ({ ...f, from: f.to, to: f.from }))}
        >
          ⇄
        </button>

        <div className={styles.field}>
          <label htmlFor="to" className={styles.label}>To</label>
          <div className={styles.selectWrap}>
            <span className={styles.icon}>🏁</span>
            <select id="to" name="to" value={form.to} onChange={handleChange} required className={styles.select}>
              <option value="">Select city</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="date" className={styles.label}>Date</label>
          <div className={styles.selectWrap}>
            <span className={styles.icon}>📅</span>
            <input
              type="date"
              id="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
              className={styles.select}
            />
          </div>
        </div>
      </div>

      <Button type="submit" variant="primary" size="lg" fullWidth={!compact}>
        Search trips
      </Button>
    </form>
  );
}
