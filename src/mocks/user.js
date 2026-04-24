export const mockUser = {
  id: 'u1',
  name: 'Amina Uwase',
  email: 'amina@example.com',
  phone: '+250788000000',
  role: 'passenger', // 'passenger' | 'driver' | 'admin'
  avatar: null,
  joinedAt: '2025-01-15T08:00:00Z',
};

export const mockDriver = {
  id: 'd1',
  name: 'Jean Pierre Habimana',
  email: 'jp@example.com',
  phone: '+250788111111',
  role: 'driver',
  avatar: null,
  rating: 4.8,
  totalTrips: 42,
  vehicle: {
    make: 'Toyota',
    model: 'RAV4',
    year: 2020,
    color: 'White',
    plate: 'RAC 123 A',
    seats: 4,
  },
  joinedAt: '2024-03-10T08:00:00Z',
};
