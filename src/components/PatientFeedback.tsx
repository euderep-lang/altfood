import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

const FEEDBACK_SESSION_KEY = 'altfood_feedback_given';
const SEARCH_COUNT_KEY = 'altfood_search_count_session';

interface Props {
  doctorId: string;
  searchCount: number;
}

export default function PatientFeedback({ doctorId, searchCount }: Props) {
  const [show, setShow] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const alreadyGiven = sessionStorage.getItem(FEEDBACK_SESSION_KEY);
    if (!alreadyGiven && searchCount >= 3) {
      setShow(true);
    }
  }, [searchCount]);

  const submit = async (isPositive: boolean) => {
    setSubmitted(true);
    sessionStorage.setItem(FEEDBACK_SESSION_KEY, 'true');
    await supabase.from('patient_feedback').insert({
      doctor_id: doctorId,
      is_positive: isPositive,
    });
    setTimeout(() => setShow(false), 2000);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 z-40 md:left-auto md:right-4 md:bottom-4 md:w-80"
        >
          <Card className="rounded-2xl shadow-xl border-border/50">
            <CardContent className="p-4">
              {submitted ? (
                <p className="text-sm text-center text-foreground font-medium">Obrigado pelo feedback! 🙏</p>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-foreground font-medium">Esta página foi útil?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => submit(true)}
                      className="text-2xl hover:scale-125 transition-transform p-1"
                      aria-label="Sim, foi útil"
                    >
                      👍
                    </button>
                    <button
                      onClick={() => submit(false)}
                      className="text-2xl hover:scale-125 transition-transform p-1"
                      aria-label="Não foi útil"
                    >
                      👎
                    </button>
                  </div>
                  <button
                    onClick={() => { setShow(false); sessionStorage.setItem(FEEDBACK_SESSION_KEY, 'true'); }}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
