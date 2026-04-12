import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

/** Ícone squircle verde + folha branca — favicon, splash, nav em fundo claro, PWA */
export const BRAND_MARK_SRC = '/logo-altfood-mark.png';

/** Wordmark claro (ícone branco + “Altfood”) — fundos escuros (#1a3c2e, preto) */
export const BRAND_HORIZONTAL_SRC = '/logo-altfood-horizontal.png';

/** Mesmo ícone sobre canvas preto (referência; evitar no UI — preferir `BRAND_MARK_SRC`) */
export const BRAND_MARK_ON_DARK_BG_SRC = '/logo-altfood-mark-on-dark-bg.png';

type NavProps = { className?: string; href?: string };

const navWrap = (href: string, className: string | undefined, inner: ReactNode) => {
  const cls = cn('flex items-center gap-2.5', className);
  if (href.startsWith('http')) {
    return (
      <a href={href} className={cls} aria-label="Altfood — página inicial">
        {inner}
      </a>
    );
  }
  return (
    <Link to={href} className={cls} aria-label="Altfood — página inicial">
      {inner}
    </Link>
  );
};

/** Nav / hero em fundo claro: marca + texto em verde floresta (Raleway via `font-sans`) */
export function AltfoodLogoNavLight({ className, href = '/' }: NavProps) {
  return navWrap(
    href,
    className,
    <>
      <img
        src={BRAND_MARK_SRC}
        alt=""
        width={36}
        height={36}
        className="h-9 w-9 shrink-0 rounded-2xl object-cover shadow-sm"
        decoding="async"
      />
      <span className="font-sans text-xl font-bold tracking-tight text-[#1a3c2e]">Altfood</span>
    </>
  );
}

/** Rodapé / fundo floresta: wordmark horizontal (texto claro integrado na arte) */
export function AltfoodLogoFooterDark({ className }: { className?: string }) {
  return (
    <img
      src={BRAND_HORIZONTAL_SRC}
      alt="Altfood"
      width={200}
      height={48}
      className={cn('h-10 w-auto max-w-[200px] object-contain object-left', className)}
      decoding="async"
    />
  );
}
