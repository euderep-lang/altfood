const PENDING_CHECKOUT_PLAN_KEY = 'altfood_pending_checkout_plan';

/** Checkout interno que chama a edge function e redireciona para a Abacate Pay. */
export const CHECKOUT_MONTHLY_PATH = '/checkout?plan=monthly';

/** Cadastro com retorno ao checkout Pro após onboarding (mesmo fluxo que `next` na URL). */
export function hrefRegisterThenProCheckout(): string {
  return `/register?next=${encodeURIComponent(CHECKOUT_MONTHLY_PATH)}`;
}

export type CheckoutPlan = 'monthly' | 'annual';

export function setPendingCheckoutPlan(plan: CheckoutPlan) {
  try {
    sessionStorage.setItem(PENDING_CHECKOUT_PLAN_KEY, plan);
  } catch {
    /* no-op */
  }
}

/** Lê e remove o plano pendente (ex.: vindo da landing antes do cadastro). */
export function consumePendingCheckoutPlan(): CheckoutPlan | null {
  try {
    const v = sessionStorage.getItem(PENDING_CHECKOUT_PLAN_KEY);
    sessionStorage.removeItem(PENDING_CHECKOUT_PLAN_KEY);
    if (v === 'monthly' || v === 'annual') return v;
  } catch {
    /* no-op */
  }
  return null;
}
