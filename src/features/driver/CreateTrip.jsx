import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTrip } from '../../services/driverService';
import styles from './CreateTrip.module.css';

const CITIES = [
  'Kigali', 'Musanze', 'Butare (Huye)', 'Gisenyi (Rubavu)',
  'Rwamagana', 'Nyamata', 'Kibungo (Ngoma)', 'Cyangugu (Rusizi)',
  'Byumba (Gicumbi)', 'Kibuye (Karongi)',
];

const EMPTY = {
  fromCity:      '',
  fromAddress:   '',
  toCity:        '',
  toAddress:     '',
  date:          '',
  departureTime: '',
  arrivalTime:   '',
  seatsTotal:    '',
  price:         '',
  currency:      'RWF',
  description:   '',
  type:          'carpool',
};

export default function CreateTrip() {
  const navigate = useNavigate();
  const [form,   setForm]   = useState(EMPTY);
  const [error,  setError]  = useState(null);
  const [saving, setSaving] = useState(false);

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function validate() {
    if (!form.fromCity)      return 'Please select a departure city.';
    if (!form.toCity)        return 'Please select a destination city.';
    if (form.fromCity === form.toCity) return 'Departure and destination must differ.';
    if (!form.date)          return 'Please choose a date.';
    if (form.date < new Date().toISOString().slice(0, 10)) return 'Date cannot be in the past.';
    if (!form.departureTime) return 'Please enter a departure time.';
    if (!form.seatsTotal || Number(form.seatsTotal) < 1) return 'At least 1 seat is required.';
    if (form.price === '' || Number(form.price) < 0)    return 'Price must be 0 or more.';
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    setError(null);
    setSaving(true);
    try {
      await createTrip({
        from: { city: form.fromCity, address: form.fromAddress },
        to:   { city: form.toCity,   address: form.toAddress   },
        date:          form.date,
        departureTime: form.departureTime,
        arrivalTime:   form.arrivalTime,
        seatsTotal:    Number(form.seatsTotal),
        price:         Number(form.price),
        currency:      form.currency,
        description:   form.description,
        type:          form.type,
      });
      navigate('/driver/trips');
    } catch (err) {
      setError(err.message || 'Failed to create trip. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.page}>

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Create New Trip</h1>
          <p className={styles.pageSubtitle}>Fill in the route details and let passengers find you.</p>
        </div>
        <button className={styles.cancelBtn} type="button" onClick={() => navigate('/driver/trips')}>
          ✕ Cancel
        </button>
      </div>

      <form className={styles.formGrid} onSubmit={handleSubmit} noValidate>

        {error && (
          <div className={styles.errorBanner}>
            ⚠️ {error}
          </div>
        )}

        {/* Route card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}>📍</span>
            <h2 className={styles.cardTitle}>Route</h2>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.routeRow}>
              <div className={styles.routeStop}>
                <div className={styles.stopDot} style={{ background: '#28a745' }} />
                <div className={styles.stopFields}>
                  <div className={styles.field}>
                    <label className={styles.label}>Departure city *</label>
                    <select
                      className={styles.input}
                      value={form.fromCity}
                      onChange={e => set('fromCity', e.target.value)}
                      required
                    >
                      <option value="">Select city…</option>
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Pick-up address <span className={styles.opt}>(optional)</span></label>
                    <input
                      className={styles.input}
                      type="text"
                      value={form.fromAddress}
                      onChange={e => set('fromAddress', e.target.value)}
                      placeholder="Street, landmark…"
                    />
                  </div>
                </div>
              </div>

              <div className={styles.routeConnector}>
                <span className={styles.connectorLine} />
                <span className={styles.connectorArrow}>↓</span>
                <span className={styles.connectorLine} />
              </div>

              <div className={styles.routeStop}>
                <div className={styles.stopDot} style={{ background: '#dc3545' }} />
                <div className={styles.stopFields}>
                  <div className={styles.field}>
                    <label className={styles.label}>Destination city *</label>
                    <select
                      className={styles.input}
                      value={form.toCity}
                      onChange={e => set('toCity', e.target.value)}
                      required
                    >
                      <option value="">Select city…</option>
                      {CITIES.filter(c => c !== form.fromCity).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Drop-off address <span className={styles.opt}>(optional)</span></label>
                    <input
                      className={styles.input}
                      type="text"
                      value={form.toAddress}
                      onChange={e => set('toAddress', e.target.value)}
                      placeholder="Street, landmark…"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}>📅</span>
            <h2 className={styles.cardTitle}>Schedule</h2>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>Date *</label>
                <input
                  className={styles.input}
                  type="date"
                  value={form.date}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={e => set('date', e.target.value)}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Departure time *</label>
                <input
                  className={styles.input}
                  type="time"
                  value={form.departureTime}
                  onChange={e => set('departureTime', e.target.value)}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Estimated arrival <span className={styles.opt}>(optional)</span></label>
                <input
                  className={styles.input}
                  type="time"
                  value={form.arrivalTime}
                  onChange={e => set('arrivalTime', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Seats & price */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}>🪑</span>
            <h2 className={styles.cardTitle}>Seats & Price</h2>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>Available seats *</label>
                <input
                  className={styles.input}
                  type="number"
                  min={1}
                  max={14}
                  value={form.seatsTotal}
                  onChange={e => set('seatsTotal', e.target.value)}
                  placeholder="e.g. 3"
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Price per seat *</label>
                <div className={styles.priceGroup}>
                  <input
                    className={`${styles.input} ${styles.priceInput}`}
                    type="number"
                    min={0}
                    step={100}
                    value={form.price}
                    onChange={e => set('price', e.target.value)}
                    placeholder="e.g. 3000"
                    required
                  />
                  <select
                    className={styles.currencySelect}
                    value={form.currency}
                    onChange={e => set('currency', e.target.value)}
                  >
                    <option value="RWF">RWF</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Trip type</label>
                <select
                  className={styles.input}
                  value={form.type}
                  onChange={e => set('type', e.target.value)}
                >
                  <option value="carpool">Carpool</option>
                  <option value="bus">Bus</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}>📝</span>
            <h2 className={styles.cardTitle}>Additional Notes</h2>
          </div>
          <div className={styles.cardBody}>
            <textarea
              className={`${styles.input} ${styles.textarea}`}
              rows={3}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="e.g. No smoking. Luggage allowed. Stopping in Muhanga."
            />
          </div>
        </div>

        {/* Submit */}
        <div className={styles.submitRow}>
          <button type="button" className={styles.cancelBtn} onClick={() => navigate('/driver/trips')}>
            Cancel
          </button>
          <button type="submit" className={styles.submitBtn} disabled={saving}>
            {saving ? 'Creating…' : '🚗 Publish Trip'}
          </button>
        </div>
      </form>
    </div>
  );
}
