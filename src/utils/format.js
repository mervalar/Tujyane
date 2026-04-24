export function formatPrice(amount, currency = 'RWF') {
  return `${Number(amount).toLocaleString()} ${currency}`;
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-RW', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function formatTime(timeStr) {
  return timeStr; // already "HH:MM" from API
}

export function durationLabel(departure, arrival) {
  const [dh, dm] = departure.split(':').map(Number);
  const [ah, am] = arrival.split(':').map(Number);
  const diff = (ah * 60 + am) - (dh * 60 + dm);
  if (diff <= 0) return '';
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return h > 0 ? `${h}h${m > 0 ? ` ${m}min` : ''}` : `${m}min`;
}

export function statusColor(status) {
  const map = {
    confirmed: 'var(--color-success)',
    pending:   'var(--color-warning)',
    cancelled: 'var(--color-error)',
  };
  return map[status] || 'var(--color-text-muted)';
}
