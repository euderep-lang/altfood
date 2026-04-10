const PENDING_CHECKOUT_PLAN_KEY = 'altfood_pending_checkout_plan';

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
