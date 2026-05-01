import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDriverMe, updateDriverProfile, saveVehicle } from '../../services/driverService';
import styles from './Profile.module.css';

/* ── Compliance definition ───────────────────── */
const CHECKS = [
  { key: 'fullname',      label: 'Full name',        weight: 12, group: 'personal',  field: u => !!u?.fullname },
  { key: 'email',         label: 'Email',            weight: 12, group: 'personal',  field: u => !!u?.email    },
  { key: 'phone',         label: 'Phone number',     weight: 12, group: 'personal',  field: u => !!u?.phone    },
  { key: 'avatar',        label: 'Profile photo',    weight: 14, group: 'personal',  field: u => !!u?.avatar   },
  { key: 'licenseNumber', label: "Driver's licence", weight: 10, group: 'documents', field: (_, v) => !!v?.licenseNumber },
  { key: 'insuranceDoc',  label: 'Insurance doc',    weight:  5, group: 'documents', field: (_, v) => !!v?.insuranceDoc  },
  { key: 'make',          label: 'Car make',         weight:  7, group: 'vehicle',   field: (_, v) => !!v?.make          },
  { key: 'model',         label: 'Car model',        weight:  7, group: 'vehicle',   field: (_, v) => !!v?.model         },
  { key: 'year',          label: 'Year',             weight:  7, group: 'vehicle',   field: (_, v) => !!v?.year          },
  { key: 'plateNumber',   label: 'Plate number',     weight:  7, group: 'vehicle',   field: (_, v) => !!v?.plateNumber   },
  { key: 'color',         label: 'Car colour',       weight:  7, group: 'vehicle',   field: (_, v) => !!v?.color         },
];

function computeCompliance(user, vehicle) {
  return CHECKS.reduce((sum, c) => sum + (c.field(user, vehicle) ? c.weight : 0), 0);
}

function complianceColor(pct) {
  if (pct >= 90) return '#28a745';
  if (pct >= 70) return '#17a2b8';
  if (pct >= 40) return '#ffc107';
  return '#dc3545';
}

function complianceLabel(pct) {
  if (pct === 100) return 'Excellent — fully compliant';
  if (pct >= 90)   return 'Almost there!';
  if (pct >= 70)   return 'Good progress';
  if (pct >= 40)   return 'Needs attention';
  return 'Profile incomplete';
}

const RWF_CITIES = [
  'Kigali', 'Musanze', 'Butare (Huye)', 'Gisenyi (Rubavu)',
  'Rwamagana', 'Nyamata', 'Kibungo (Ngoma)', 'Cyangugu (Rusizi)',
  'Byumba (Gicumbi)', 'Kibuye (Karongi)',
];

const CAR_TYPES = ['sedan', 'suv', 'minibus', 'pickup', 'van', 'other'];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => CURRENT_YEAR - i);

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [serverUser,    setServerUser]    = useState(null);
  const [vehicle,       setVehicle]       = useState(null);
  const [loading,       setLoading]       = useState(true);

  /* form state */
  const [personal,  setPersonal]  = useState({ fullname: '', phone: '', avatar: '' });
  const [vehicleForm, setVehicleForm] = useState({
    make: '', model: '', year: '', plateNumber: '',
    color: '', seats: '', type: 'sedan',
    licenseNumber: '', insuranceDoc: '',
  });

  /* UI state */
  const [saving,    setSaving]    = useState('');
  const [msg,       setMsg]       = useState({ personal: null, vehicle: null });
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    getDriverMe()
      .then(({ user: u, vehicle: v }) => {
        setServerUser(u);
        setVehicle(v);
        setPersonal({ fullname: u?.fullname || '', phone: u?.phone || '', avatar: u?.avatar || '' });
        if (v) {
          setVehicleForm({
            make:          v.make          || '',
            model:         v.model         || '',
            year:          v.year          || '',
            plateNumber:   v.plateNumber   || '',
            color:         v.color         || '',
            seats:         v.seats         || '',
            type:          v.type          || 'sedan',
            licenseNumber: v.licenseNumber || '',
            insuranceDoc:  v.insuranceDoc  || '',
          });
        }
      })
      .catch(() => {
        // fallback to cached user if API unavailable
        setServerUser(user);
      })
      .finally(() => setLoading(false));
  }, []);

  const compliance = computeCompliance(serverUser || user, vehicle);
  const color      = complianceColor(compliance);

  async function savePersonal(e) {
    e.preventDefault();
    setSaving('personal');
    setMsg(m => ({ ...m, personal: null }));
    try {
      const { user: updated } = await updateDriverProfile(personal);
      setServerUser(updated);
      updateUser?.(updated);
      setMsg(m => ({ ...m, personal: { type: 'success', text: 'Personal info saved.' } }));
    } catch (err) {
      setMsg(m => ({ ...m, personal: { type: 'error', text: err.message || 'Save failed.' } }));
    } finally {
      setSaving('');
    }
  }

  async function saveVehicleData(e) {
    e.preventDefault();
    setSaving('vehicle');
    setMsg(m => ({ ...m, vehicle: null }));
    try {
      const payload = { ...vehicleForm, year: vehicleForm.year ? Number(vehicleForm.year) : null, seats: vehicleForm.seats ? Number(vehicleForm.seats) : null };
      const { vehicle: updated } = await saveVehicle(payload);
      setVehicle(updated);
      setMsg(m => ({ ...m, vehicle: { type: 'success', text: 'Vehicle details saved.' } }));
    } catch (err) {
      setMsg(m => ({ ...m, vehicle: { type: 'error', text: err.message || 'Save failed.' } }));
    } finally {
      setSaving('');
    }
  }

  if (loading) {
    return (
      <div className={styles.loadWrap}>
        <div className={styles.spinner} />
        <p>Loading profile…</p>
      </div>
    );
  }

  const activeUser = serverUser || user;

  return (
    <div className={styles.page}>

      {/* ── Page header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>My Profile</h1>
          <p className={styles.pageSubtitle}>Manage your personal info, vehicle and documents.</p>
        </div>
      </div>

      <div className={styles.layout}>

        {/* ── Left column: compliance card ── */}
        <aside className={styles.sidebar}>

          {/* Compliance card */}
          <div className={styles.complianceCard}>
            <h2 className={styles.cardTitle}>Profile Compliance</h2>

            <div className={styles.ringWrap}>
              <div
                className={styles.ring}
                style={{ '--pct': compliance, '--clr': color }}
              >
                <div className={styles.ringInner}>
                  <span className={styles.ringPct} style={{ color }}>{compliance}%</span>
                  <span className={styles.ringLabel}>complete</span>
                </div>
              </div>
            </div>

            <p className={styles.complianceStatus} style={{ color }}>{complianceLabel(compliance)}</p>

            <div className={styles.progressBarWrap}>
              <div
                className={styles.progressBar}
                style={{ width: `${compliance}%`, background: color }}
              />
            </div>

            <ul className={styles.checkList}>
              {CHECKS.map(c => {
                const done = c.field(activeUser, vehicle);
                return (
                  <li key={c.key} className={`${styles.checkItem} ${done ? styles.checkDone : styles.checkPending}`}>
                    <span className={styles.checkIcon}>{done ? '✓' : '○'}</span>
                    <span className={styles.checkText}>{c.label}</span>
                    <span className={styles.checkWeight}>+{c.weight}%</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Avatar preview */}
          <div className={styles.avatarCard}>
            <div className={styles.avatarLg}>
              {activeUser?.avatar
                ? <img src={activeUser.avatar} alt="Avatar" />
                : (
                  <span>
                    {activeUser?.fullname?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'DV'}
                  </span>
                )
              }
            </div>
            <p className={styles.avatarName}>{activeUser?.fullname || '—'}</p>
            <p className={styles.avatarRole}>Driver</p>
            <span className={`${styles.statusBadge} ${activeUser?.isVerified ? styles.statusVerified : styles.statusPending}`}>
              {activeUser?.isVerified ? '✓ Verified' : '⏳ Pending verification'}
            </span>
          </div>
        </aside>

        {/* ── Right column: tabs ── */}
        <div className={styles.formArea}>

          {/* Tabs */}
          <div className={styles.tabs}>
            {[
              { id: 'personal',  label: '👤 Personal Info' },
              { id: 'vehicle',   label: '🚗 Vehicle Details' },
            ].map(t => (
              <button
                key={t.id}
                className={`${styles.tab} ${activeTab === t.id ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Personal info form */}
          {activeTab === 'personal' && (
            <form className={styles.formCard} onSubmit={savePersonal}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Personal Information</h2>
              </div>
              <div className={styles.cardBody}>

                {msg.personal && (
                  <div className={`${styles.alert} ${styles[`alert_${msg.personal.type}`]}`}>
                    {msg.personal.text}
                  </div>
                )}

                <div className={styles.fieldRow}>
                  <Field label="Full name *" required>
                    <input
                      className={styles.input}
                      type="text"
                      value={personal.fullname}
                      onChange={e => setPersonal(p => ({ ...p, fullname: e.target.value }))}
                      placeholder="Jean-Pierre Habimana"
                      required
                    />
                  </Field>
                  <Field label="Email address" hint="Cannot be changed here">
                    <input
                      className={`${styles.input} ${styles.inputDisabled}`}
                      type="email"
                      value={activeUser?.email || ''}
                      disabled
                    />
                  </Field>
                </div>

                <div className={styles.fieldRow}>
                  <Field label="Phone number *" required>
                    <input
                      className={styles.input}
                      type="tel"
                      value={personal.phone}
                      onChange={e => setPersonal(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+250 7XX XXX XXX"
                      required
                    />
                  </Field>
                  <Field label="Profile photo URL" hint="Paste a public image URL">
                    <input
                      className={styles.input}
                      type="url"
                      value={personal.avatar}
                      onChange={e => setPersonal(p => ({ ...p, avatar: e.target.value }))}
                      placeholder="https://..."
                    />
                  </Field>
                </div>
              </div>
              <div className={styles.cardFooter}>
                <button className={styles.saveBtn} type="submit" disabled={saving === 'personal'}>
                  {saving === 'personal' ? 'Saving…' : 'Save Personal Info'}
                </button>
              </div>
            </form>
          )}

          {/* Vehicle form */}
          {activeTab === 'vehicle' && (
            <form className={styles.formCard} onSubmit={saveVehicleData}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Vehicle & Documents</h2>
              </div>
              <div className={styles.cardBody}>

                {msg.vehicle && (
                  <div className={`${styles.alert} ${styles[`alert_${msg.vehicle.type}`]}`}>
                    {msg.vehicle.text}
                  </div>
                )}

                <p className={styles.sectionLabel}>Vehicle Details</p>

                <div className={styles.fieldRow}>
                  <Field label="Car make *" required>
                    <input
                      className={styles.input}
                      type="text"
                      value={vehicleForm.make}
                      onChange={e => setVehicleForm(v => ({ ...v, make: e.target.value }))}
                      placeholder="Toyota, Nissan, Kia…"
                      required
                    />
                  </Field>
                  <Field label="Car model *" required>
                    <input
                      className={styles.input}
                      type="text"
                      value={vehicleForm.model}
                      onChange={e => setVehicleForm(v => ({ ...v, model: e.target.value }))}
                      placeholder="Corolla, March, Sportage…"
                      required
                    />
                  </Field>
                </div>

                <div className={styles.fieldRow}>
                  <Field label="Year *" required>
                    <select
                      className={styles.input}
                      value={vehicleForm.year}
                      onChange={e => setVehicleForm(v => ({ ...v, year: e.target.value }))}
                      required
                    >
                      <option value="">Select year</option>
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </Field>
                  <Field label="Plate number *" required>
                    <input
                      className={styles.input}
                      type="text"
                      value={vehicleForm.plateNumber}
                      onChange={e => setVehicleForm(v => ({ ...v, plateNumber: e.target.value.toUpperCase() }))}
                      placeholder="RAA 123 A"
                    />
                  </Field>
                </div>

                <div className={styles.fieldRow}>
                  <Field label="Colour *" required>
                    <input
                      className={styles.input}
                      type="text"
                      value={vehicleForm.color}
                      onChange={e => setVehicleForm(v => ({ ...v, color: e.target.value }))}
                      placeholder="White, Silver, Black…"
                    />
                  </Field>
                  <Field label="Available seats (excl. driver)">
                    <input
                      className={styles.input}
                      type="number"
                      min={1}
                      max={14}
                      value={vehicleForm.seats}
                      onChange={e => setVehicleForm(v => ({ ...v, seats: e.target.value }))}
                      placeholder="4"
                    />
                  </Field>
                </div>

                <div className={styles.fieldRow}>
                  <Field label="Vehicle type">
                    <select
                      className={styles.input}
                      value={vehicleForm.type}
                      onChange={e => setVehicleForm(v => ({ ...v, type: e.target.value }))}
                    >
                      {CAR_TYPES.map(t => (
                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <hr className={styles.divider} />
                <p className={styles.sectionLabel}>Documents</p>

                <div className={styles.fieldRow}>
                  <Field label="Driver's licence number">
                    <input
                      className={styles.input}
                      type="text"
                      value={vehicleForm.licenseNumber}
                      onChange={e => setVehicleForm(v => ({ ...v, licenseNumber: e.target.value }))}
                      placeholder="e.g. RW-12345678"
                    />
                  </Field>
                  <Field label="Insurance document URL" hint="Paste a link to your insurance scan">
                    <input
                      className={styles.input}
                      type="url"
                      value={vehicleForm.insuranceDoc}
                      onChange={e => setVehicleForm(v => ({ ...v, insuranceDoc: e.target.value }))}
                      placeholder="https://drive.google.com/…"
                    />
                  </Field>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <button className={styles.saveBtn} type="submit" disabled={saving === 'vehicle'}>
                  {saving === 'vehicle' ? 'Saving…' : 'Save Vehicle & Documents'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, required, children }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
        {hint && <span className={styles.hint}> — {hint}</span>}
      </label>
      {children}
    </div>
  );
}
