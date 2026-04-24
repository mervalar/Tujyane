import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
    setMenuOpen(false);
  }

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo} onClick={() => setMenuOpen(false)}>
          🚌 Tujyane
        </Link>

        <button
          className={styles.hamburger}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span /><span /><span />
        </button>

        <nav className={[styles.nav, menuOpen ? styles.open : ''].join(' ')}>
          <NavLink to="/" end className={({ isActive }) => isActive ? styles.active : ''} onClick={() => setMenuOpen(false)}>
            Home
          </NavLink>

          {isAuthenticated && user?.role === 'driver' && (
            <NavLink to="/driver/dashboard" className={({ isActive }) => isActive ? styles.active : ''} onClick={() => setMenuOpen(false)}>
              My Trips
            </NavLink>
          )}

          {isAuthenticated && user?.role !== 'driver' && (
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? styles.active : ''} onClick={() => setMenuOpen(false)}>
              My Bookings
            </NavLink>
          )}

          {isAuthenticated ? (
            <div className={styles.userMenu}>
              <span className={styles.userName}>{user?.name?.split(' ')[0]}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>Logout</Button>
            </div>
          ) : (
            <div className={styles.authButtons}>
              <Button variant="ghost" size="sm" onClick={() => { navigate('/login'); setMenuOpen(false); }}>
                Login
              </Button>
              <Button variant="primary" size="sm" onClick={() => { navigate('/register'); setMenuOpen(false); }}>
                Sign up
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
