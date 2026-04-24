import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import styles from './DashboardLayout.module.css';

const passengerLinks = [
  { to: '/dashboard',          label: '🗓 My Bookings' },
  { to: '/dashboard/profile',  label: '👤 Profile' },
];

const driverLinks = [
  { to: '/driver/dashboard',         label: '🚗 My Trips' },
  { to: '/driver/create',            label: '➕ Create Trip' },
  { to: '/driver/dashboard/profile', label: '👤 Profile' },
];

export default function DashboardLayout() {
  const { user } = useAuth();
  const links = user?.role === 'driver' ? driverLinks : passengerLinks;

  return (
    <div className={styles.wrapper}>
      <Navbar />
      <div className={`container ${styles.body}`}>
        <aside className={styles.sidebar}>
          <p className={styles.greeting}>Hi, {user?.name?.split(' ')[0]} 👋</p>
          <nav className={styles.nav}>
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end
                className={({ isActive }) => [styles.link, isActive ? styles.active : ''].join(' ')}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
