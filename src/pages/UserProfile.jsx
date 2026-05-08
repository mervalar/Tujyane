import { useAuth } from '../context/AuthContext';
import styles from './UserProfile.module.css';

const ROLE_LABEL = { passenger: 'Passenger', driver: 'Driver', admin: 'Admin' };

export default function UserProfile() {
  const { user } = useAuth();
  if (!user) return null;

  const name = user.fullname || user.name || '—';
  const initial = name.charAt(0).toUpperCase();
  const role = ROLE_LABEL[user.role] ?? user.role;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>My Profile</h1>

      <div className={styles.card}>
        <div className={styles.avatarWrap}>
          <span className={styles.avatar}>{initial}</span>
        </div>

        <div className={styles.fields}>
          <div className={styles.field}>
            <span className={styles.label}>Full name</span>
            <span className={styles.value}>{name}</span>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Email</span>
            <span className={styles.value}>{user.email || '—'}</span>
          </div>

          {user.phone && (
            <div className={styles.field}>
              <span className={styles.label}>Phone</span>
              <span className={styles.value}>{user.phone}</span>
            </div>
          )}

          <div className={styles.field}>
            <span className={styles.label}>Account type</span>
            <span className={styles.value}>{role}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
