import api from './api.js';

export async function getDriverMe() {
  const { data } = await api.get('/driver/me');
  return data;
}

export async function updateDriverProfile(payload) {
  const { data } = await api.put('/driver/profile', payload);
  return data;
}

export async function saveVehicle(payload) {
  const { data } = await api.post('/driver/vehicle', payload);
  return data;
}

export async function getDriverTrips() {
  const { data } = await api.get('/driver/trips');
  return data.trips ?? data;
}

export async function createTrip(payload) {
  const { data } = await api.post('/driver/trips', payload);
  return data;
}

export async function cancelTrip(tripId) {
  const { data } = await api.patch(`/driver/trips/${tripId}/cancel`);
  return data;
}

export async function getDriverStats() {
  const { data } = await api.get('/driver/stats');
  return data;
}
