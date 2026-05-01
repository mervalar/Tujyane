import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import styles from './AuthForm.module.css';

export default function RegisterForm() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({ fullname: '', email: '', phone: '', password: '', role: 'passenger' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  }
function validateForm(values) {
    const errors = {};
    const email = values.email.trim();
    const password = values.password.trim();
    const fullname = values.fullname.trim();
    const phone = values.phone.trim();
    const role = values.role.trim();

    if (!email) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }
    if (!fullname) {
      errors.fullname = "Provide your full name";
    }
    if (!phone) {
      errors.phone = "Provide your contact number";
    }
    if (!role) {
      errors.role ="Are you a driver or passenger";
    }
    

    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const errors = validateForm(form);
    if (Object.keys(errors).length >0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await register(form);
      navigate('/login');
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
          <Input id="fullname" label="Full name" type="text" name="fullname" value={form.fullname} onChange={handleChange} placeholder="Your full name" error={fieldErrors.fullname}  icon="👤" />
          <Input id="email" label="Email address" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" error={fieldErrors.email}  icon="✉️" />
          <Input id="phone" label="Phone number" type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+250 7XX XXX XXX" error={fieldErrors.phone} icon="📞" />
          <Input id="password" label="Password" type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" error={fieldErrors.password}  icon="🔒" />

          <div className={styles.roleGroup}>
            <p className={styles.roleLabel}>I want to:</p>
            <div className={styles.roleCards} >
              <label className={[styles.roleCard, form.role === 'passenger' ? styles.roleSelected : ''].join(' ')}>
                <input type="radio" name="role" value="passenger" error={fieldErrors.role} checked={form.role === 'passenger'} onChange={handleChange} className="sr-only" />
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
