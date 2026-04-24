import { useState } from 'react';
import { bookTrip } from '../services/bookingsService';

export function useBooking() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [result, setResult]   = useState(null);

  async function book({ tripId, seats }) {
    setLoading(true);
    setError(null);
    try {
      const data = await bookTrip({ tripId, seats });
      setResult(data);
      return data;
    } catch (err) {
      setError(err.message || 'Booking failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { book, loading, error, result };
}
