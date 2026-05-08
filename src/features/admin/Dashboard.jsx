import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats, getDriverVerifications, getAllBookings } from '../../services/adminService';
import Spinner from '../../components/common/Spinner';
import { formatPrice, formatDate } from '../../utils/format';
import styles from './Dashboard.module.css';

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div className={styles.statCard}>
      <div className={`${styles.statIcon} ${styles[`icon${color}`]}`}>{icon}</div>
      <div className={styles.statBody}>
        <span className={styles.statValue}>{value}</span>
        <span className={styles.statLabel}>{label}</span>
        {sub && <span className={styles.statSub}>{sub}</span>}
      </div>
    </div>
  );
}

const STATUS_CLASS = { confirmed: 'confirmed', pending: 'pending', cancelled: 'cancelled' };

export default function AdminDashboard() {
  const [stats, setStats]       = useState(null);
  const [pending, setPending]   = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    Promise.all([
      getAdminStats(),
      getDriverVerifications({ status: 'pending' }),
      getAllBookings(),
    ]).then(([s, d, b]) => {
      setStats(s);
      setPending(Array.isArray(d) ? d : []);
      setBookings((Array.isArray(b) ? b : []).slice(0, 6));
    }).catch((err) => {
      setError(err.message || 'Failed to load dashboard data');
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error)   return <p className={styles.empty}>{error}</p>;
  if (!stats)  return <p className={styles.empty}>No data available.</p>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>Welcome back — here's what's happening on Tujyane today.</p>
      </div>

      {/* Stat cards */}
      <div className={styles.statsGrid}>
        <StatCard label="Total Users" value={stats.totalUsers.toLocaleString()} icon="👥" color="Blue" sub={`+${stats.monthlyGrowth.users}% this month`} />
        <StatCard label="Active Drivers" value={stats.activeDrivers.toLocaleString()} icon="🚗" color="Green" sub={`${stats.pendingDrivers} pending review`} />
        <StatCard label="Active Trips" value={stats.activeTrips.toLocaleString()} icon="🗺" color="Purple" sub={`${stats.totalTrips.toLocaleString()} total`} />
        <StatCard label="Total Bookings" value={stats.totalBookings.toLocaleString()} icon="📋" color="Orange" sub={`+${stats.monthlyGrowth.bookings}% this month`} />
        <StatCard label="Total Revenue" value={formatPrice(stats.totalRevenue, stats.currency)} icon="💰" color="Teal" sub={`+${stats.monthlyGrowth.revenue}% this month`} />
      </div>

      <div className={styles.panels}>
        {/* Pending driver verifications */}
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>Pending Driver Approvals</h2>
            <Link to="/admin/drivers" className={styles.panelLink}>View all →</Link>
          </div>
          {pending.length === 0 ? (
            <p className={styles.empty}>No pending approvals.</p>
          ) : (
            <ul className={styles.driverList}>
              {pending.map((d) => (
                <li key={d._id} className={styles.driverItem}>
                  <div className={styles.driverAvatar}>{d.fullname?.[0]}</div>
                  <div className={styles.driverInfo}>
                    <span className={styles.driverName}>{d.fullname}</span>
                    <span className={styles.driverMeta}>
                      {d.vehicle
                        ? `${d.vehicle.make} ${d.vehicle.model} · ${d.vehicle.plateNumber}`
                        : 'No vehicle on file'}
                    </span>
                    <span className={styles.driverMeta}>Applied {formatDate(d.createdAt)}</span>
                  </div>
                  <Link to="/admin/drivers" className={styles.reviewBtn}>Review</Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent bookings */}
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>Recent Bookings</h2>
            <Link to="/admin/bookings" className={styles.panelLink}>View all →</Link>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Passenger</th>
                  <th>Route</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td>{b.passenger?.fullname}</td>
                    <td className={styles.route}>{b.trip?.from?.city} → {b.trip?.to?.city}</td>
                    <td>{formatDate(b.trip?.date)}</td>
                    <td>{formatPrice(b.totalPrice, 'RWF')}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[STATUS_CLASS[b.status] || 'pending']}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
