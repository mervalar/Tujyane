import { useCallback } from 'react';
import { useTrips } from '../context/TripContext';
import { getTrips } from '../services/tripsService';

export function useSearchTrips() {
  const { setResults, setLoading, setError } = useTrips();

  const search = useCallback(async (params) => {
    setLoading(true);
    try {
      const results = await getTrips(params);
      setResults(results);
    } catch (err) {
      setError(err.message || 'Failed to load trips');
    }
  }, [setResults, setLoading, setError]);

  return { search };
}
