import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTrip } from '../services/tripsService';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import styles from './CreateTrip.module.css';

const CITIES = ['Kigali', 'Musanze', 'Butare', 'Gisenyi', 'Rwamagana', 'Nyamata', 'Kibungo', 'Cyangugu'];

const initialForm = {
  fromCity: '', fromAddress: '',
  toCity: '',   toAddress: '',
  date: '', departureTime: '', arrivalTime: '',
  price: '', seatsAvailable: '',
  description: '',
};

export default function CreateTrip() {
  const navigate = useNavigate();
  const [form, setForm]       = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.fromCity || !form.toCity) { setError('Please select departure and destination cities.'); return; }
    if (form.fromCity === form.toCity)  { setError('Departure and destination must be different.'); return; }
    if (Number(form.price) <= 0)        { setError('Price must be greater than 0.'); return; }
    if (Number(form.seatsAvailable) <= 0) { setError('Seats must be at least 1.'); return; }

    setLoading(true);
    try {
      await createTrip({
        type: 'carpool',
        from: { city: form.fromCity, address: form.fromAddress },
        to:   { city: form.toCity,   address: form.toAddress },
        date: form.date,
        departureTime: form.departureTime,
        arrivalTime:   form.arrivalTime,
        price: Number(form.price),
        currency: 'RWF',
        seatsAvailable: Number(form.seatsAvailable),
        seatsTotal:     Number(form.seatsAvailable),
        description: form.description,
      });
      navigate('/driver/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create trip.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => navigate(-1)}>← Back</button>
      <h1 className={styles.title}>Create a new trip</h1>

      {error && <div className={styles.alert}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {/* Route */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Route</h2>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="fromCity">From (city)</label>
              <select id="fromCity" name="fromCity" value={form.fromCity} onChange={handleChange} required className={styles.select}>
                <option value="">Select city</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <Input id="fromAddress" label="Pick-up address (optional)" name="fromAddress" value={form.fromAddress} onChange={handleChange} placeholder="e.g. Nyabugogo Bus Terminal" />
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="toCity">To (city)</label>
              <select id="toCity" name="toCity" value={form.toCity} onChange={handleChange} required className={styles.select}>
                <option value="">Select city</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <Input id="toAddress" label="Drop-off address (optional)" name="toAddress" value={form.toAddress} onChange={handleChange} placeholder="e.g. Town center" />
          </div>
        </section>

        {/* Schedule */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Schedule</h2>
          <div className={styles.row}>
            <Input id="date" label="Date" type="date" name="date" value={form.date} onChange={handleChange} required min={new Date().toISOString().split('T')[0]} />
            <Input id="departureTime" label="Departure time" type="time" name="departureTime" value={form.departureTime} onChange={handleChange} required />
            <Input id="arrivalTime" label="Arrival time" type="time" name="arrivalTime" value={form.arrivalTime} onChange={handleChange} required />
          </div>
        </section>

        {/* Pricing */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Seats & Price</h2>
          <div className={styles.row}>
            <Input
              id="seatsAvailable"
              label="Available seats"
              type="number"
              name="seatsAvailable"
              value={form.seatsAvailable}
              onChange={handleChange}
              placeholder="e.g. 3"
              min={1} max={8}
              required
            />
            <Input
              id="price"
              label="Price per seat (RWF)"
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="e.g. 3500"
              min={1}
              required
            />
          </div>
        </section>

        {/* Description */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Additional info</h2>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="description">Notes for passengers (optional)</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="e.g. Direct trip, no stops. Luggage space available."
              rows={3}
              className={styles.textarea}
            />
          </div>
        </section>

        <div className={styles.actions}>
          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
            Publish trip
          </Button>
        </div>
      </form>
    </div>
  );
}
