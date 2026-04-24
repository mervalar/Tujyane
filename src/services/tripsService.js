import api from './api';
import { mockTrips, mockDriverTrips } from '../mocks/trips';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

const delay = (ms = 600) => new Promise((r) => setTimeout(r, ms));

export async function getTrips({ from, to, date, type } = {}) {
  if (USE_MOCK) {
    await delay();
    let results = [...mockTrips];
    if (from) results = results.filter((t) => t.from.city.toLowerCase().includes(from.toLowerCase()));
    if (to)   results = results.filter((t) => t.to.city.toLowerCase().includes(to.toLowerCase()));
    if (date) results = results.filter((t) => t.date === date);
    if (type) results = results.filter((t) => t.type === type);
    return results;
  }
  const { data } = await api.get('/trips', { params: { from, to, date, type } });
  return data;
}

export async function getTripById(id) {
  if (USE_MOCK) {
    await delay(300);
    const trip = mockTrips.find((t) => t.id === id) || mockDriverTrips.find((t) => t.id === id);
    if (!trip) throw new Error('Trip not found');
    return trip;
  }
  const { data } = await api.get(`/trips/${id}`);
  return data;
}

export async function createTrip(tripData) {
  if (USE_MOCK) {
    await delay();
    return { id: String(Date.now()), ...tripData };
  }
  const { data } = await api.post('/trips', tripData);
  return data;
}

export async function getDriverTrips() {
  if (USE_MOCK) {
    await delay();
    return mockDriverTrips;
  }
  const { data } = await api.get('/drivers/me/trips');
  return data;
}
