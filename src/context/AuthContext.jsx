import { createContext, useContext, useEffect, useReducer } from 'react';
import { login, register, getMe } from '../services/authService';

const AuthContext = createContext(null);

const initialState = { user: null, token: null, loading: true, error: null };

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false, error: null };
    case 'SET_TOKEN':
      return { ...state, token: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'LOGOUT':
      return { ...initialState, loading: false };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('tujyane_token');
    const cachedUser = localStorage.getItem('tujyane_user');
    if (!token) {
      dispatch({ type: 'LOGOUT' });
      return;
    }
    dispatch({ type: 'SET_TOKEN', payload: token });
    if (cachedUser) {
      dispatch({ type: 'SET_USER', payload: JSON.parse(cachedUser) });
      return;
    }
    getMe()
      .then((user) => dispatch({ type: 'SET_USER', payload: user }))
      .catch(() => dispatch({ type: 'LOGOUT' }));
  }, []);

  async function handleLogin(credentials) {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { token, user } = await login(credentials);
      localStorage.setItem('tujyane_token', token);
      localStorage.setItem('tujyane_user', JSON.stringify(user));
      dispatch({ type: 'SET_TOKEN', payload: token });
      dispatch({ type: 'SET_USER', payload: user });
      return user;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      throw err;
    }
  }

  async function handleRegister(data) {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { token, user } = await register(data);
      localStorage.setItem('tujyane_token', token);
      localStorage.setItem('tujyane_user', JSON.stringify(user));
      dispatch({ type: 'SET_TOKEN', payload: token });
      dispatch({ type: 'SET_USER', payload: user });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      throw err;
    }
  }

  function handleLogout() {
    localStorage.removeItem('tujyane_token');
    localStorage.removeItem('tujyane_user');
    dispatch({ type: 'LOGOUT' });
  }

  function updateUser(updatedUser) {
    localStorage.setItem('tujyane_user', JSON.stringify(updatedUser));
    dispatch({ type: 'SET_USER', payload: updatedUser });
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        isAuthenticated: !!state.user,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
