import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
    setMenuOpen(false);
    setDropdownOpen(false);
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const firstName = (user?.fullname || user?.name || '').split(' ')[0];
  const initial = firstName.charAt(0).toUpperCase();
  const dashboardPath = user?.role === 'driver' ? '/driver/dashboard'
    : user?.role === 'admin' ? '/admin/dashboard'
    : '/dashboard';
  const profilePath = user?.role === 'driver' ? '/driver/profile' : '/dashboard/profile';

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

          <NavLink to="/trips" className={({ isActive }) => isActive ? styles.active : ''} onClick={() => setMenuOpen(false)}>
            Find Trips
          </NavLink>

          {isAuthenticated ? (
            <div className={styles.userMenu} ref={dropdownRef}>
              <button
                className={styles.avatarBtn}
                onClick={() => setDropdownOpen((o) => !o)}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <span className={styles.avatar}>{initial}</span>
                <span className={styles.userName}>{firstName}</span>
                <span className={[styles.chevron, dropdownOpen ? styles.chevronUp : ''].join(' ')}>▾</span>
              </button>

              {dropdownOpen && (
                <div className={styles.dropdown}>
                  <Link
                    to={dashboardPath}
                    className={styles.dropdownItem}
                    onClick={() => { setDropdownOpen(false); setMenuOpen(false); }}
                  >
                    📋 Dashboard
                  </Link>
                  <Link
                    to={profilePath}
                    className={styles.dropdownItem}
                    onClick={() => { setDropdownOpen(false); setMenuOpen(false); }}
                  >
                    👤 Profile
                  </Link>
                  <div className={styles.dropdownDivider} />
                  <button className={styles.dropdownItem} onClick={handleLogout}>
                    🚪 Logout
                  </button>
                </div>
              )}
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
