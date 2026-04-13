import type { Variants } from 'framer-motion';

/** Curva próxima de “premium / 21st” — entra rápido, desacelera no fim */
export const landingEase = [0.16, 1, 0.3, 1] as [number, number, number, number];

export function fadeUpVariants(reducedMotion: boolean): Variants {
  if (reducedMotion) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.2 } },
    };
  }
  return {
    hidden: { opacity: 0, y: 26, filter: 'blur(10px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.58, ease: landingEase },
    },
  };
}

export function fadeUpSoftVariants(reducedMotion: boolean): Variants {
  if (reducedMotion) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.2 } },
    };
  }
  return {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: landingEase },
    },
  };
}

export function staggerContainer(reducedMotion: boolean, stagger = 0.07): Variants {
  return {
    hidden: {},
    visible: {
      transition: reducedMotion ? { staggerChildren: 0 } : { staggerChildren: stagger, delayChildren: 0.06 },
    },
  };
}

export function staggerItem(reducedMotion: boolean): Variants {
  if (reducedMotion) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.2 } },
    };
  }
  return {
    hidden: { opacity: 0, y: 22, filter: 'blur(8px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.52, ease: landingEase },
    },
  };
}

/** Intersection rootMargin: antecipa um pouco o reveal ao rolar */
export const viewportOnce = { once: true as const, amount: 0.2, margin: '0px 0px -10% 0px' };
