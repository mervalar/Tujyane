import api from './api';

export async function login({ email, password }) {
  const { data } = await api.post('/users/login', { email, password });
  return {
    token: data.token,
    user: data.loginuser,
  };
}

export async function register({ fullname, email, password, phone, role }) {
  await api.post('/users/register', { fullname, email, password, phone, role });
  // Backend doesn't issue a token on register, so log in immediately
  return login({ email, password });
}

export async function getMe() {
  try {
    const { data } = await api.get('/users/profile');
    return data.user;
  } catch (error) {
    const cachedUser = localStorage.getItem('tujyane_user');
    if (cachedUser) return JSON.parse(cachedUser);
    throw error;
  }

}

