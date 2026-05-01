import api from './api.js';
import { mockDriverTrips as MOCK_TRIPS } from '../mocks/trips.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/* ── Driver profile ─────────────────────────── */

export async function getDriverMe() {
  if (USE_MOCK) {
    await delay(300);
    const user = JSON.parse(localStorage.getItem('tujyane_user') || 'null');
    return { user, vehicle: null };
  }
  const { data } = await api.get('/driver/me');
  return data;
}

export async function updateDriverProfile(payload) {
  if (USE_MOCK) {
    await delay(400);
    const user = JSON.parse(localStorage.getItem('tujyane_user') || '{}');
    const updated = { ...user, ...payload };
    localStorage.setItem('tujyane_user', JSON.stringify(updated));
    return { user: updated };
  }
  const { data } = await api.put('/driver/profile', payload);
  return data;
}

/* ── Vehicle ─────────────────────────────────── */

export async function saveVehicle(payload) {
  if (USE_MOCK) {
    await delay(400);
    return { vehicle: { ...payload, _id: 'mock-vehicle' } };
  }
  const { data } = await api.post('/driver/vehicle', payload);
  return data;
}

/* ── Trips ───────────────────────────────────── */

export async function getDriverTrips() {
  if (USE_MOCK) {
    await delay(400);
    return MOCK_TRIPS;
  }
  const { data } = await api.get('/driver/trips');
  return data.trips ?? data;
}

export async function createTrip(payload) {
  if (USE_MOCK) {
    await delay(500);
    return { trip: { _id: 'mock-' + Date.now(), ...payload, status: 'active' } };
  }
  const { data } = await api.post('/driver/trips', payload);
  return data;
}

export async function cancelTrip(tripId) {
  if (USE_MOCK) {
    await delay(300);
    return { message: 'Cancelled (mock)' };
  }
  const { data } = await api.patch(`/driver/trips/${tripId}/cancel`);
  return data;
}

/* ── Stats ───────────────────────────────────── */

export async function getDriverStats() {
  if (USE_MOCK) {
    await delay(200);
    const trips = MOCK_TRIPS;
    return {
      totalTrips:      trips.length,
      activeTrips:     trips.filter(t => t.status === 'active').length,
      totalSeatsBooked: trips.reduce((s, t) => s + (t.seatsTotal - t.seatsAvailable), 0),
      totalEarnings:    trips.reduce((s, t) => s + t.price * (t.seatsTotal - t.seatsAvailable), 0),
    };
  }
  const { data } = await api.get('/driver/stats');
  return data;
}

/* ── Utility ─────────────────────────────────── */

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}
