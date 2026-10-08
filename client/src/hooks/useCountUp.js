import { useEffect, useState } from 'react';

export default function useCountUp(target, duration = 1600) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target === value) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target]);

  return value;
}