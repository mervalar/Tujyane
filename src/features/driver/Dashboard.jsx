import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDriverStats, getDriverTrips } from '../../services/driverService';
import { formatPrice, formatDate } from '../../utils/format';
import styles from './Dashboard.module.css';

const STATUS_COLORS = { active: 'success', completed: 'info', cancelled: 'error' };
const STATUS_LABELS = { active: 'Active', completed: 'Completed', cancelled: 'Cancelled' };

function complianceColor(pct) {
  if (pct >= 90) return '#28a745';
  if (pct >= 70) return '#17a2b8';
  if (pct >= 40) return '#ffc107';
  return '#dc3545';
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats,  setStats]  = useState(null);
  const [trips,  setTrips]  = useState([]);
  const [loading, setLoading] = useState(true);

  const firstName = user?.fullname?.split(' ')[0] || 'Driver';

  // Compute a simple local compliance from user object
  const compliance = (() => {
    if (!user) return 0;
    let score = 0;
    if (user.fullname) score += 12;
    if (user.email)    score += 12;
    if (user.phone)    score += 12;
    if (user.avatar)   score += 14;
    return Math.min(score, 50); // rest needs vehicle data — shown as partial
  })();

  useEffect(() => {
    Promise.all([
      getDriverStats().catch(() => null),
      getDriverTrips().catch(() => []),
    ]).then(([s, t]) => {
      setStats(s);
      setTrips(Array.isArray(t) ? t.slice(0, 5) : []);
    }).finally(() => setLoading(false));
  }, []);

  const recentTrips = trips.slice(0, 5);

  return (
    <div className={styles.page}>

      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageSubtitle}>Welcome back, {firstName}! Here's your overview.</p>
        </div>
        <button className={styles.createBtn} onClick={() => navigate('/driver/create')}>
          + Create Trip
        </button>
      </div>

      {/* Compliance alert */}
      {compliance < 100 && (
        <div className={styles.alertBanner}>
          <span className={styles.alertIcon}>⚠️</span>
          <span>
            Your profile is <strong>{compliance}% complete</strong>.
            Complete your profile and car details to build passenger trust.
          </span>
          <Link to="/driver/profile" className={styles.alertAction}>Complete profile →</Link>
        </div>
      )}

      {/* Stat cards */}
      {loading ? (
        <div className={styles.statsGrid}>
          {[1,2,3,4].map(i => <div key={i} className={styles.statSkeleton} />)}
        </div>
      ) : (
        <div className={styles.statsGrid}>
          <StatCard
            icon="🚗"
            label="Total Trips"
            value={stats?.totalTrips ?? 0}
            color="#0052cc"
            sub="All time"
          />
          <StatCard
            icon="✅"
            label="Active Trips"
            value={stats?.activeTrips ?? 0}
            color="#28a745"
            sub="Currently running"
          />
          <StatCard
            icon="👥"
            label="Passengers"
            value={stats?.totalSeatsBooked ?? 0}
            color="#17a2b8"
            sub="Seats booked"
          />
          <StatCard
            icon="💰"
            label="Earnings"
            value={formatPrice(stats?.totalEarnings ?? 0, 'RWF')}
            color="#f5a623"
            sub="Estimated total"
            compact
          />
        </div>
      )}

      {/* Content row */}
      <div className={styles.row}>

        {/* Recent trips */}
        <div className={`${styles.card} ${styles.cardWide}`}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Recent Trips</h2>
            <Link to="/driver/trips" className={styles.cardAction}>View all →</Link>
          </div>
          <div className={styles.cardBody}>
            {recentTrips.length === 0 ? (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}>🚗</span>
                <p>No trips yet. <Link to="/driver/create">Create your first trip</Link>.</p>
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Route</th>
                    <th>Date</th>
                    <th>Seats</th>
                    <th>Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrips.map(trip => (
                    <tr key={trip._id || trip.id}>
                      <td>
                        <span className={styles.routeFrom}>{trip.from?.city || trip.from}</span>
                        <span className={styles.routeArrow}> → </span>
                        <span className={styles.routeTo}>{trip.to?.city || trip.to}</span>
                      </td>
                      <td className={styles.dateCell}>{formatDate(trip.date)}</td>
                      <td>{trip.seatsAvailable}/{trip.seatsTotal}</td>
                      <td>{formatPrice(trip.price, trip.currency || 'RWF')}</td>
                      <td>
                        <span className={`${styles.badge} ${styles[`badge_${STATUS_COLORS[trip.status] || 'info'}`]}`}>
                          {STATUS_LABELS[trip.status] || trip.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Profile compliance card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Profile Compliance</h2>
            <Link to="/driver/profile" className={styles.cardAction}>Edit →</Link>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.complianceCenter}>
              <div className={styles.complianceRing} style={{ '--pct': compliance, '--clr': complianceColor(compliance) }}>
                <span className={styles.compliancePct}>{compliance}%</span>
              </div>
              <p className={styles.complianceLabel}>
                {compliance === 100 ? 'Profile complete!' : 'Profile incomplete'}
              </p>
            </div>
            <div className={styles.complianceItems}>
              <ComplianceItem done={!!user?.fullname} label="Full name" />
              <ComplianceItem done={!!user?.email}    label="Email address" />
              <ComplianceItem done={!!user?.phone}    label="Phone number" />
              <ComplianceItem done={!!user?.avatar}   label="Profile photo" />
              <ComplianceItem done={false}            label="Vehicle registered" hint="Go to profile" />
              <ComplianceItem done={false}            label="Driver's licence" hint="Go to profile" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Quick Actions</h2>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.quickGrid}>
            <QuickAction icon="➕" label="Create New Trip" to="/driver/create" color="#0052cc" />
            <QuickAction icon="🗂" label="View All Trips"   to="/driver/trips"  color="#28a745" />
            <QuickAction icon="👤" label="Edit Profile"     to="/driver/profile" color="#17a2b8" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, sub, compact }) {
  return (
    <div className={styles.statCard} style={{ '--accent': color }}>
      <div className={styles.statCardAccent} />
      <div className={styles.statCardBody}>
        <div className={styles.statCardLeft}>
          <p className={styles.statValue} style={{ fontSize: compact ? '1.4rem' : undefined }}>{value}</p>
          <p className={styles.statLabel}>{label}</p>
          <p className={styles.statSub}>{sub}</p>
        </div>
        <div className={styles.statCardIcon}>{icon}</div>
      </div>
    </div>
  );
}

function ComplianceItem({ done, label, hint }) {
  return (
    <div className={styles.complianceRow}>
      <span className={done ? styles.checkDone : styles.checkPending}>
        {done ? '✓' : '○'}
      </span>
      <span className={`${styles.complianceText} ${done ? '' : styles.complianceTextPending}`}>
        {label}
        {!done && hint && <span className={styles.complianceHint}> — {hint}</span>}
      </span>
    </div>
  );
}

function QuickAction({ icon, label, to, color }) {
  const navigate = useNavigate();
  return (
    <button
      className={styles.quickCard}
      onClick={() => navigate(to)}
      style={{ '--qa-color': color }}
    >
      <span className={styles.quickIcon}>{icon}</span>
      <span className={styles.quickLabel}>{label}</span>
    </button>
  );
}
