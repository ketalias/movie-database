import { useState, useEffect } from 'react';

export default function useCardsPerPage() {
  const getCount = () => {
    const w = window.innerWidth;
    if (w > 1200) return 5;
    if (w > 900) return 4;
    if (w > 600) return 3;
    if (w > 580) return 1;
    return 1;
  };

  const [count, setCount] = useState(getCount);

  useEffect(() => {
    let timer;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setCount(getCount()), 150);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return count;
}
