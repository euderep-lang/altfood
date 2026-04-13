import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { AltfoodLogoFooterDark } from '@/components/AltfoodLogo';

const T = {
  forest:     '#1a3c2e',
  lime:       '#c8f044',
  offWhite:   '#f5f0e8',
  textDark:   '#111a14',
  bodyOnDark: '#b0c4b8',
  mutedOnDark:'#6b9080',
  cardOnDark: 'rgba(255,255,255,0.06)',
  borderDark: 'rgba(255,255,255,0.1)',
  dividerDark:'rgba(255,255,255,0.08)',
} as const;

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const platformLinks = ['Para Nutricionistas', 'Para Pacientes', 'Banco de Dados', 'App Mobile', 'Integrações'];
const companyLinks  = ['Sobre Nós', 'Blog', 'Imprensa', 'Carreiras', 'Contato', 'LGPD & Privacidade'];

function SocialButton({ children }: { children: React.ReactNode }) {
  return (
    <a
      href="#"
      className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:opacity-80 hover:scale-110"
      style={{ background: T.cardOnDark, border: `1px solid ${T.borderDark}`, color: '#fff' }}
      aria-label="Social link"
    >
      {children}
    </a>
  );
}

function FooterCol({ header, links }: { header: string; links: string[] }) {
  return (
    <div className="flex flex-col gap-4">
      <h4
        className="text-xs font-semibold uppercase tracking-[0.12em]"
        style={{ color: T.lime }}
      >
        {header}
      </h4>
      <ul className="flex flex-col gap-3">
        {links.map((link) => (
          <li key={link}>
            <a
              href="#"
              className="text-sm transition-colors hover:text-white"
              style={{ color: T.bodyOnDark }}
            >
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FooterNewsletter() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  }

  return (
    <footer ref={ref} className="relative overflow-hidden font-sans" style={{ background: T.forest }}>
      {/* Subtle top glow */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(to right, transparent, ${T.lime}40, transparent)` }}
        aria-hidden
      />

      <div className="max-w-7xl mx-auto px-6 md:px-16 py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12"
        >
          {/* Col 1 — Brand */}
          <div className="flex flex-col gap-5">
            <AltfoodLogoFooterDark className="h-11 max-w-[220px]" />
            <p className="text-sm leading-relaxed" style={{ color: T.bodyOnDark }}>
              Substituições com base na Tabela TACO, no link com a sua marca — para o paciente consultar quando a dúvida
              aparecer, sem depender do seu WhatsApp a toda hora.
            </p>
            <div className="flex gap-2">
              {/* LinkedIn */}
              <SocialButton>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
              </SocialButton>
              {/* Instagram */}
              <SocialButton>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/></svg>
              </SocialButton>
              {/* YouTube */}
              <SocialButton>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>
              </SocialButton>
              {/* X / Twitter */}
              <SocialButton>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </SocialButton>
            </div>
            <p className="text-xs mt-auto" style={{ color: T.mutedOnDark }}>
              © 2025 Altfood Tecnologia Ltda.
            </p>
          </div>

          {/* Col 2 — Platform */}
          <FooterCol header="Plataforma" links={platformLinks} />

          {/* Col 3 — Company */}
          <FooterCol header="Empresa" links={companyLinks} />

          {/* Col 4 — Newsletter */}
          <div className="flex flex-col gap-4">
            <h4
              className="text-xs font-semibold uppercase tracking-[0.12em]"
              style={{ color: T.lime }}
            >
              Fique por Dentro
            </h4>
            <p className="text-sm leading-relaxed" style={{ color: T.bodyOnDark }}>
              Receba novidades sobre nutrição baseada em evidências e atualizações da plataforma.
            </p>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 text-sm font-medium"
                style={{ color: T.lime }}
              >
                <span>✓</span> Inscrição confirmada!
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 transition-all"
                  style={{
                    background: '#ffffff',
                    color: T.textDark,
                    border: 'none',
                  }}
                />
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 w-full rounded-lg px-4 py-2.5 text-sm font-bold transition-all hover:opacity-90 hover:scale-[1.02] active:scale-95"
                  style={{ background: T.lime, color: T.textDark }}
                >
                  Inscrever
                  <ArrowRight size={14} />
                </button>
              </form>
            )}

            <p className="text-xs" style={{ color: T.mutedOnDark }}>
              Sem spam. Cancele quando quiser.
            </p>
          </div>
        </motion.div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, ease, delay: 0.3 }}
          className="mt-14 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
          style={{
            borderTop: `1px solid ${T.dividerDark}`,
            color: T.mutedOnDark,
          }}
        >
          <span>Feito com ♥ no Brasil</span>
          <div className="flex items-center gap-4">
            {['Termos de Uso', 'Política de Privacidade', 'Cookies'].map((item, i, arr) => (
              <span key={item} className="flex items-center gap-4">
                <a href="#" className="hover:text-white transition-colors">{item}</a>
                {i < arr.length - 1 && <span style={{ color: T.dividerDark }}>·</span>}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

export default FooterNewsletter;
