import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import styles from './AuthForm.module.css';

export default function RegisterForm() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'passenger' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate(form.role === 'driver' ? '/driver/dashboard' : '/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Create account</h1>
        <p className={styles.sub}>Join Tujyane and start travelling</p>

        {error && <div className={styles.alert}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <Input id="name" label="Full name" type="text" name="name" value={form.name} onChange={handleChange} placeholder="Your full name" required icon="👤" />
          <Input id="email" label="Email address" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required icon="✉️" />
          <Input id="phone" label="Phone number" type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+250 7XX XXX XXX" icon="📞" />
          <Input id="password" label="Password" type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" required icon="🔒" />

          <div className={styles.roleGroup}>
            <p className={styles.roleLabel}>I want to:</p>
            <div className={styles.roleCards}>
              <label className={[styles.roleCard, form.role === 'passenger' ? styles.roleSelected : ''].join(' ')}>
                <input type="radio" name="role" value="passenger" checked={form.role === 'passenger'} onChange={handleChange} className="sr-only" />
                <span className={styles.roleIcon}>🧳</span>
                <span className={styles.roleName}>Book trips</span>
                <span className={styles.roleDesc}>Passenger</span>
              </label>
              <label className={[styles.roleCard, form.role === 'driver' ? styles.roleSelected : ''].join(' ')}>
                <input type="radio" name="role" value="driver" checked={form.role === 'driver'} onChange={handleChange} className="sr-only" />
                <span className={styles.roleIcon}>🚗</span>
                <span className={styles.roleName}>Offer rides</span>
                <span className={styles.roleDesc}>Driver</span>
              </label>
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
            Create account
          </Button>
        </form>

        <p className={styles.footer}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
