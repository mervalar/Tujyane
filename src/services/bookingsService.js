import api from './api';

export async function bookTrip({ tripId, seats }) {
  const { data } = await api.post('/bookings', { tripId, seatsBooked: seats });
  return data;
}

export async function getUserTrips() {
  const { data } = await api.get('/bookings/me');
  return data.bookings;
}

export async function cancelBooking(bookingId) {
  const { data } = await api.delete(`/bookings/${bookingId}`);
  return data;
}
