import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './DriverLayout.module.css';

const navItems = [
  { section: 'MAIN', items: [
    { to: '/driver/dashboard', icon: '⊞', label: 'Dashboard', exact: true },
  ]},
  { section: 'TRIPS', items: [
    { to: '/driver/trips',  icon: '🗂', label: 'My Trips' },
    { to: '/driver/create', icon: '＋', label: 'Create Trip' },
  ]},
  { section: 'ACCOUNT', items: [
    { to: '/driver/profile',   icon: '👤', label: 'Profile' },
  ]},
];

const BREADCRUMB_MAP = {
  '/driver/dashboard': 'Dashboard',
  '/driver/trips':     'My Trips',
  '/driver/create':    'Create Trip',
  '/driver/profile':   'Profile',
};

export default function DriverLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const initials = user?.fullname
    ?.split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'DV';

  const firstName = user?.fullname?.split(' ')[0] || 'Driver';
  const currentPage = BREADCRUMB_MAP[location.pathname] || 'Driver';

  useEffect(() => {
    function handleClick(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close sidebar on small screens when navigating
  useEffect(() => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, [location.pathname]);

  async function handleLogout() {
    await logout?.();
    navigate('/login');
  }

  return (
    <div className={`${styles.wrapper} ${sidebarOpen ? styles.sidebarExpanded : styles.sidebarCollapsed}`}>

      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.logoWrap}>
          <span className={styles.logoIcon}>🚐</span>
          <div>
            <span className={styles.logoName}>Tujyane</span>
            <span className={styles.logoSub}>Driver Portal</span>
          </div>
        </div>

        <div className={styles.driverCard}>
          <div className={styles.driverAvatar}>
            {user?.avatar
              ? <img src={user.avatar} alt={firstName} />
              : initials}
          </div>
          <div className={styles.driverInfo}>
            <span className={styles.driverName}>{firstName}</span>
            <span className={styles.driverRole}>Driver</span>
          </div>
        </div>

        <nav className={styles.nav}>
          {navItems.map(({ section, items }) => (
            <div key={section}>
              <p className={styles.navSection}>{section}</p>
              {items.map(({ to, icon, label, exact }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={exact}
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                >
                  <span className={styles.navIcon}>{icon}</span>
                  <span className={styles.navLabel}>{label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <span>⏻</span> Sign out
          </button>
          <p className={styles.version}>Tujyane v1.0</p>
        </div>
      </aside>

      {/* Overlay for mobile */}
      <div
        className={`${styles.overlay} ${sidebarOpen ? styles.overlayVisible : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── Main area ── */}
      <div className={styles.main}>

        {/* Top navbar */}
        <header className={styles.topbar}>
          <button
            className={styles.menuToggle}
            onClick={() => setSidebarOpen(v => !v)}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>

          <nav className={styles.breadcrumb} aria-label="breadcrumb">
            <span className={styles.breadcrumbHome}>🏠</span>
            <span className={styles.breadcrumbSep}>/</span>
            <span className={styles.breadcrumbCurrent}>{currentPage}</span>
          </nav>

          <div className={styles.topbarSpacer} />

          <div className={styles.topbarActions}>
            <button className={styles.topbarIconBtn} title="Notifications">
              🔔
              <span className={styles.notifBadge}>3</span>
            </button>

            <div ref={userMenuRef} className={styles.userMenuWrap}>
              <button
                className={styles.userMenuTrigger}
                onClick={() => setUserMenuOpen(v => !v)}
              >
                <div className={styles.avatarSm}>
                  {user?.avatar
                    ? <img src={user.avatar} alt={firstName} />
                    : initials}
                </div>
                <span className={styles.userMenuName}>{firstName}</span>
                <span className={styles.chevron}>{userMenuOpen ? '▲' : '▼'}</span>
              </button>

              {userMenuOpen && (
                <div className={styles.dropdown}>
                  <NavLink to="/driver/profile" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                    👤 My Profile
                  </NavLink>
                  <hr className={styles.dropdownDivider} />
                  <button className={styles.dropdownItem} onClick={handleLogout}>
                    ⏻ Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
