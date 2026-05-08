import api from './api';

export async function getAdminStats() {
  const { data } = await api.get('/admin/stats');
  return data;
}

export async function getUsers({ search = '', role = '', status = '' } = {}) {
  const { data } = await api.get('/admin/users', { params: { search, role, status } });
  return data.users ?? data;
}

export async function banUser(userId) {
  const { data } = await api.patch(`/admin/users/${userId}/ban`);
  return data;
}

export async function unbanUser(userId) {
  const { data } = await api.patch(`/admin/users/${userId}/unban`);
  return data;
}

export async function getDriverVerifications({ status = '' } = {}) {
  const { data } = await api.get('/admin/drivers', { params: { status } });
  return data.drivers ?? data;
}

export async function approveDriver(driverId) {
  const { data } = await api.patch(`/admin/drivers/${driverId}/approve`);
  return data;
}

export async function rejectDriver(driverId, reason) {
  const { data } = await api.patch(`/admin/drivers/${driverId}/reject`, { reason });
  return data;
}

export async function getAllTrips({ search = '', type = '', status = '' } = {}) {
  const { data } = await api.get('/admin/trips', { params: { search, type, status } });
  return data.trips ?? data;
}

export async function cancelAdminTrip(tripId) {
  const { data } = await api.patch(`/admin/trips/${tripId}/cancel`);
  return data;
}

export async function getAllBookings({ search = '', status = '' } = {}) {
  const { data } = await api.get('/admin/bookings', { params: { search, status } });
  return data.bookings ?? data;
}

export async function cancelAdminBooking(bookingId) {
  const { data } = await api.patch(`/admin/bookings/${bookingId}/cancel`);
  return data;
}
