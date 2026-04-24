import api from './api';
import { mockUserBookings } from '../mocks/trips';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const delay = (ms = 600) => new Promise((r) => setTimeout(r, ms));

export async function bookTrip({ tripId, seats }) {
  if (USE_MOCK) {
    await delay();
    return {
      id: `b${Date.now()}`,
      tripId,
      seats,
      status: 'confirmed',
      bookedAt: new Date().toISOString(),
    };
  }
  const { data } = await api.post('/bookings', { tripId, seats });
  return data;
}

export async function getUserTrips() {
  if (USE_MOCK) {
    await delay();
    return mockUserBookings;
  }
  const { data } = await api.get('/bookings/me');
  return data;
}

export async function cancelBooking(bookingId) {
  if (USE_MOCK) {
    await delay(300);
    return { success: true };
  }
  const { data } = await api.delete(`/bookings/${bookingId}`);
  return data;
}
