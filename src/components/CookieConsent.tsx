import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Cookie } from 'lucide-react';

const COOKIE_KEY = 'altfood_cookie_consent';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, 'accepted');
    setShow(false);
  };

  const decline = () => {
    localStorage.setItem(COOKIE_KEY, 'declined');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 z-[60] md:left-auto md:max-w-md"
        >
          <div className="bg-card border border-border rounded-2xl shadow-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Cookie className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Cookies</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Usamos cookies para melhorar sua experiência.
                </p>
                <div className="flex gap-2 mt-3">
                  <Button onClick={accept} size="sm" className="rounded-xl h-8 text-xs bg-primary hover:bg-primary/90 px-4">
                    Aceitar
                  </Button>
                  <Button onClick={decline} variant="ghost" size="sm" className="rounded-xl h-8 text-xs text-muted-foreground px-4">
                    Recusar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
