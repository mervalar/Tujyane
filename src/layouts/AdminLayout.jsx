import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './AdminLayout.module.css';

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: '▣', label: 'Dashboard' },
  { to: '/admin/users',     icon: '👥', label: 'Users' },
  { to: '/admin/drivers',   icon: '🚗', label: 'Drivers' },
  { to: '/admin/trips',     icon: '🗺', label: 'Trips' },
  { to: '/admin/bookings',  icon: '📋', label: 'Bookings' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className={styles.shell}>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>T</span>
          <span className={styles.brandName}>Tujyane Admin</span>
        </div>

        <nav className={styles.nav} aria-label="Admin navigation">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.adminInfo}>
            <div className={styles.adminAvatar}>
              {user?.fullname?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className={styles.adminMeta}>
              <span className={styles.adminName}>{user?.fullname || 'Admin'}</span>
              <span className={styles.adminRole}>Administrator</span>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            ↩ Logout
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className={styles.main}>
        {/* Top bar */}
        <header className={styles.topbar}>
          <button
            className={styles.menuBtn}
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <span className={styles.menuBar} />
            <span className={styles.menuBar} />
            <span className={styles.menuBar} />
          </button>

          <div className={styles.topbarRight}>
            <span className={styles.topbarUser}>
              <span className={styles.topbarAvatar}>
                {user?.fullname?.[0]?.toUpperCase() || 'A'}
              </span>
              <span className={styles.topbarName}>{user?.fullname || 'Admin'}</span>
            </span>
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
