import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <span className={styles.logo}>🚌 Tujyane</span>
          <p>Rwanda's transport platform — carpooling and bus booking made simple.</p>
        </div>

        <nav className={styles.links}>
          <div>
            <h4>Travel</h4>
            <Link to="/">Search trips</Link>
            <Link to="/register">Offer a ride</Link>
          </div>
          <div>
            <h4>Account</h4>
            <Link to="/login">Login</Link>
            <Link to="/register">Sign up</Link>
          </div>
        </nav>
      </div>
      <p className={styles.copy}>© {new Date().getFullYear()} Tujyane. Made in Rwanda.</p>
    </footer>
  );
}
