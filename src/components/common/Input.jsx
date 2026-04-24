import styles from './Input.module.css';

export default function Input({
  label,
  id,
  error,
  helper,
  icon,
  ...props
}) {
  return (
    <div className={styles.field}>
      {label && <label htmlFor={id} className={styles.label}>{label}</label>}
      <div className={styles.inputWrap}>
        {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
        <input
          id={id}
          className={[styles.input, icon ? styles.withIcon : '', error ? styles.hasError : ''].join(' ')}
          {...props}
        />
      </div>
      {error  && <p className={styles.error}>{error}</p>}
      {helper && !error && <p className={styles.helper}>{helper}</p>}
    </div>
  );
}
