import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsFetching } from '@tanstack/react-query';

export default function GlobalLoadingBar() {
  const isFetching = useIsFetching();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isFetching > 0) {
      setShow(true);
    } else {
      const timer = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isFetching]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed top-0 left-0 right-0 h-[2px] bg-primary z-[100] origin-left"
        />
      )}
    </AnimatePresence>
  );
}
