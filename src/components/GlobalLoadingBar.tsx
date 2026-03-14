import { useEffect, useState, useRef } from 'react';
import { useIsFetching } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';

export default function GlobalLoadingBar() {
  const isFetching = useIsFetching();
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [show, setShow] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    // Route change: flash the bar
    setShow(true);
    setProgress(30);
    const t = setTimeout(() => {
      setProgress(100);
      setTimeout(() => { setShow(false); setProgress(0); }, 300);
    }, 200);
    return () => clearTimeout(t);
  }, [location.pathname]);

  useEffect(() => {
    if (isFetching > 0) {
      setShow(true);
      setProgress(20);
      timerRef.current = setInterval(() => {
        setProgress(p => (p >= 90 ? 90 : p + Math.random() * 10));
      }, 300);
    } else {
      setProgress(100);
      const t = setTimeout(() => { setShow(false); setProgress(0); }, 300);
      if (timerRef.current) clearInterval(timerRef.current);
      return () => clearTimeout(t);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isFetching]);

  if (!show && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] h-[3px]"
      style={{ pointerEvents: 'none' }}
    >
      <div
        className="h-full transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          backgroundColor: '#16A34A',
          opacity: show ? 1 : 0,
        }}
      />
    </div>
  );
}
