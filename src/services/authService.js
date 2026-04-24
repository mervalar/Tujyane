import api from './api';
import { mockUser } from '../mocks/user';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const delay = (ms = 600) => new Promise((r) => setTimeout(r, ms));

export async function login({ email, password }) {
  if (USE_MOCK) {
    await delay();
    if (password.length < 4) throw new Error('Invalid credentials');
    return { token: 'mock-jwt-token', user: mockUser };
  }
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

export async function register({ name, email, password, phone, role }) {
  if (USE_MOCK) {
    await delay();
    return { token: 'mock-jwt-token', user: { ...mockUser, name, email, phone, role } };
  }
  const { data } = await api.post('/auth/register', { name, email, password, phone, role });
  return data;
}

export async function getMe() {
  if (USE_MOCK) {
    await delay(200);
    const token = localStorage.getItem('tujyane_token');
    if (!token) throw new Error('Not authenticated');
    return mockUser;
  }
  const { data } = await api.get('/users/me');
  return data;
}
