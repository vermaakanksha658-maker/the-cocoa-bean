import { useEffect, useState } from 'react';

export const HOURS = [
  { days: [1, 2, 3, 4, 5], open: 8, close: 21.5, label: 'Monday – Friday' },
  { days: [6], open: 9, close: 23, label: 'Saturday' },
  { days: [0], open: 9, close: 22, label: 'Sunday' },
];

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function formatHour(x) {
  const hh = Math.floor(x);
  const mm = Math.round((x - hh) * 60);
  const ampm = hh >= 12 ? 'PM' : 'AM';
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}:${String(mm).padStart(2, '0')} ${ampm}`;
}

export default function useOpenStatus() {
  const [status, setStatus] = useState({
    open: false,
    text: '',
    sub: '',
    day: new Date().getDay(),
  });

  useEffect(() => {
    const compute = () => {
      const now = new Date();
      const mins = now.getHours() + now.getMinutes() / 60;
      const day = now.getDay();
      const today = HOURS.find((h) => h.days.includes(day));

      if (today && mins >= today.open && mins < today.close) {
        setStatus({
          open: true,
          text: 'Open now',
          sub: `${formatHour(today.open)} – ${formatHour(today.close)}`,
          day,
        });
        return;
      }

      for (let d = 0; d < 8; d++) {
        const checkDay = (day + d) % 7;
        const slot = HOURS.find((h) => h.days.includes(checkDay));
        if (!slot) continue;
        if (d === 0 && mins >= slot.close) continue;

        const inMinutes = d * 1440 + slot.open * 60 - Math.round(mins * 60);
        const label = DAY_NAMES[checkDay];
        setStatus({
          open: false,
          text:
            d === 0
              ? 'Closed now'
              : `Closed · opens ${label}`,
          sub:
            inMinutes < 60
              ? `Opens in ${inMinutes} min`
              : d === 0
                ? `Opens today at ${formatHour(slot.open)}`
                : `Opens ${label} at ${formatHour(slot.open)}`,
          day,
        });
        return;
      }

      setStatus({ open: false, text: 'Hours vary', sub: 'Check our socials for holiday hours', day });
    };

    compute();
    const t = setInterval(compute, 30000);
    return () => clearInterval(t);
  }, []);

  return status;
}
