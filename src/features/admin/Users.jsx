import { useEffect, useState, useCallback } from 'react';
import { getUsers, banUser, unbanUser } from '../../services/adminService';
import Spinner from '../../components/common/Spinner';
import { formatDate } from '../../utils/format';
import styles from './Users.module.css';

const ROLES   = ['', 'passenger', 'driver'];
// backend filters: status=active → isActive:true, status=inactive → isActive:false
const STATUSES = ['', 'active', 'inactive'];

export default function AdminUsers() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [role, setRole]       = useState('');
  const [status, setStatus]   = useState('');
  const [actionId, setActionId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsers({ search, role, status });
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }, [search, role, status]);

  useEffect(() => { load(); }, [load]);

  async function handleBan(userId) {
    setActionId(userId);
    await banUser(userId);
    setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, isActive: false } : u));
    setActionId(null);
  }

  async function handleUnban(userId) {
    setActionId(userId);
    await unbanUser(userId);
    setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, isActive: true } : u));
    setActionId(null);
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Users</h1>
        <p className={styles.count}>{users.length} result{users.length !== 1 ? 's' : ''}</p>
      </div>

      <div className={styles.filters}>
        <input
          className={styles.search}
          type="search"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className={styles.select} value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          {ROLES.filter(Boolean).map((r) => (
            <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
          ))}
        </select>
        <select className={styles.select} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.filter(Boolean).map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : users.length === 0 ? (
        <div className={styles.empty}>No users match your filters.</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.avatar}>{u.fullname?.[0]?.toUpperCase() ?? '?'}</div>
                      <div>
                        <div className={styles.userName}>{u.fullname ?? '—'}</div>
                        <div className={styles.userEmail}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className={styles.muted}>{u.phone}</td>
                  <td>
                    <span className={`${styles.roleBadge} ${styles[`role_${u.role}`]}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className={styles.muted}>{formatDate(u.createdAt)}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${u.isActive ? styles.active : styles.banned}`}>
                      {u.isActive ? 'active' : 'banned'}
                    </span>
                  </td>
                  <td>
                    {u.isActive ? (
                      <button
                        className={`${styles.actionBtn} ${styles.banBtn}`}
                        onClick={() => handleBan(u._id)}
                        disabled={actionId === u._id}
                      >
                        {actionId === u._id ? '…' : 'Ban'}
                      </button>
                    ) : (
                      <button
                        className={`${styles.actionBtn} ${styles.unbanBtn}`}
                        onClick={() => handleUnban(u._id)}
                        disabled={actionId === u._id}
                      >
                        {actionId === u._id ? '…' : 'Unban'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
