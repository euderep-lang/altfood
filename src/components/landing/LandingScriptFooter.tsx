/**
 * Rodapé da landing (roteiro): última frase + CTA + legal.
 */
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const T = {
  navy: '#152b36',
  lime: '#c8f044',
  mute: '#8fa8a0',
} as const;

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

export function LandingScriptFooter() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <footer ref={ref} className="font-sans" style={{ background: T.navy }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55, ease }}
        className="mx-auto max-w-2xl px-5 py-16 text-center md:py-20"
      >
        <p className="text-xl font-semibold leading-snug text-white md:text-2xl">
          O próximo nível do seu atendimento custa menos que um café por semana. Comece agora.
        </p>
        <Link
          to="/register"
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-full px-10 py-4 text-base font-bold transition-transform hover:scale-[1.03] active:scale-[0.98]"
          style={{ background: T.lime, color: T.navy }}
        >
          Assinar Altfood agora
          <ArrowRight className="h-5 w-5" aria-hidden />
        </Link>
        <p className="mt-10 text-sm" style={{ color: T.mute }}>
          Altfood © {new Date().getFullYear()} – Todos os direitos reservados.
        </p>
      </motion.div>
    </footer>
  );
}

export default LandingScriptFooter;
