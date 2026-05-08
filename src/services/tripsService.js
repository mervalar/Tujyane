import api from './api';

export async function getTrips({ from, to, date, type } = {}) {
  const { data } = await api.get('/trips', { params: { from, to, date, type } });
  return data.trips ?? data;
}

export async function getTripById(id) {
  const { data } = await api.get(`/trips/${id}`);
  return data.trip ?? data;
}

export async function createTrip(tripData) {
  const { data } = await api.post('/driver/trips', tripData);
  return data.trip ?? data;
}

export async function getDriverTrips() {
  const { data } = await api.get('/driver/trips');
  return data.trips ?? data;
}
