import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';

function Confetti() {
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1.5 + Math.random() * 2,
    color: ['#22c55e', '#0F766E', '#eab308', '#3b82f6', '#f43f5e'][Math.floor(Math.random() * 5)],
    size: 6 + Math.random() * 6,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, backgroundColor: p.color }}
          initial={{ top: -20, opacity: 1, rotate: 0 }}
          animate={{ top: '110%', opacity: 0, rotate: 360 + Math.random() * 360 }}
          transition={{ delay: p.delay, duration: p.duration, ease: 'easeIn' }}
        />
      ))}
    </div>
  );
}

export default function SubscriptionSuccess() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(timer);
          navigate('/dashboard');
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Confetti />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6 max-w-sm"
      >
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Check className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Você agora é Pro! 🎉
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Parabéns! Todos os recursos premium estão desbloqueados.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Redirecionando para o dashboard em {countdown}s...
        </p>
      </motion.div>
    </div>
  );
}
