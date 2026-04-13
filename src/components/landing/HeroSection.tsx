/** Hero — roteiro Altfood: headline, subhead, CTA, micro-preço, iPhone central com marca fictícia. */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PatientPagePhoneMockup } from '@/components/landing/PatientPagePhoneMockup';
import { BRAND_MARK_SRC } from '@/components/AltfoodLogo';

const NAVY = '#152b36';
const LIME = '#c8f044';
const MUTE = '#a8bdb4';

/** Verde oliva / azul marinho no app do paciente (exemplo white label) */
const CLINIC_BRAND = {
  primaryColor: '#2d4a52',
  brandName: 'Clínica Saúde & Bem-Estar',
  brandSubtitle: 'White label · Consultoria integrativa',
  initials: 'CS',
} as const;

export function HeroSection() {
  return (
    <section className="relative flex flex-col font-sans text-white" style={{ background: `linear-gradient(180deg, ${NAVY} 0%, #0f1a20 100%)` }}>
      <nav className="relative z-10 flex items-center justify-between px-5 py-4 md:px-12" aria-label="Navegação">
        <Link to="/" className="flex items-center gap-2.5" aria-label="Altfood — início">
          <img
            src={BRAND_MARK_SRC}
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 rounded-2xl object-cover ring-1 ring-white/20"
            decoding="async"
          />
          <span className="text-xl font-bold tracking-tight">Altfood</span>
        </Link>
        <Link to="/login" className="text-sm font-semibold text-white/85 transition-colors hover:text-white">
          Entrar
        </Link>
      </nav>

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-5 pb-16 pt-6 text-center md:pb-20 md:pt-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="text-3xl font-extrabold leading-[1.12] tracking-tight sm:text-4xl md:text-5xl"
        >
          Sua consultoria no bolso do seu paciente.
          <br />
          <span style={{ color: LIME }}>Sua marca em cada substituição.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.08 }}
          className="mt-6 max-w-2xl text-base leading-relaxed sm:text-lg"
          style={{ color: MUTE }}
        >
          O Altfood é o Web App White Label que dá autonomia total para seus pacientes trocarem alimentos em segundos.
          Elimine as dúvidas no WhatsApp e profissionalize seu atendimento por um valor simbólico.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease, delay: 0.14 }}
          className="mt-8 flex flex-col items-center gap-3"
        >
          <Link
            to="/register"
            className="inline-flex min-h-[52px] min-w-[min(100%,320px)] items-center justify-center rounded-full px-8 py-3.5 text-center text-sm font-black uppercase tracking-wide shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] sm:text-base"
            style={{ background: LIME, color: NAVY }}
          >
            Quero meu web app personalizado
          </Link>
          <p className="text-sm font-medium" style={{ color: MUTE }}>
            Apenas R$ 19,90/mês. Pacientes ilimitados.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease, delay: 0.2 }}
          className="mt-12 w-full max-w-[300px]"
        >
          <PatientPagePhoneMockup brand={CLINIC_BRAND} />
          <p className="mt-4 text-center text-xs leading-relaxed" style={{ color: MUTE }}>
            Exemplo visual: página do paciente com a identidade da sua clínica — cores, logo e link exclusivos.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;
