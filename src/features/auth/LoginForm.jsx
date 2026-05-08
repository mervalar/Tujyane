import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import styles from './AuthForm.module.css';
import { useAuth } from '../../context/AuthContext';



export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
 

  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validateForm(values) {
    const errors = {};
    const email = values.email.trim();
    const password = values.password.trim();

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

    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const user = await login({
        email: form.email.trim(),
        password: form.password.trim(),
      });

      if (user?.role === 'driver') {
        navigate('/driver/dashboard', { replace: true });
        return;
      }
      if (user?.role === 'passenger') {
        navigate('/dashboard',{replace:true});
        return;
      }
      if (user?.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
        return;
      }
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.sub}>Sign in to your Tujyane account</p>

        {error && <div className={styles.alert}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <Input
            id="email"
            label="Email address"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            error={fieldErrors.email}
            placeholder="you@example.com"
            required
            autoComplete="email"
            icon="✉️"
          />
          <Input
            id="password"
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            error={fieldErrors.password}
            placeholder="Enter your password"
            required
            autoComplete="current-password"
            icon="🔒"
          />
          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
            Sign in
          </Button>
        </form>

        <p className={styles.footer}>
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
