/** Campos mínimos para checagem de acesso ao app (dashboard etc.). */
export type DoctorAccessFields = {
  subscription_status: string;
  subscription_end_date?: string | null;
  trial_ends_at?: string;
};

/** Acesso ao painel e recursos Pro: só com assinatura paga ativa (ou período já pago após cancelamento). */
export function hasPaidAppAccess(d: DoctorAccessFields | null | undefined): boolean {
  if (!d) return false;
  if (d.subscription_status === 'blocked') return false;
  if (d.subscription_status === 'active') return true;
  if (d.subscription_status === 'cancelled' && d.subscription_end_date) {
    return new Date(d.subscription_end_date) > new Date();
  }
  return false;
}

/**
 * Após a 1ª cobrança, o webhook grava em `trial_ends_at` o fim da janela de garantia (14 dias).
 * Enquanto essa data for futura, vale política de reembolso integral.
 */
export function hasRefundGuaranteeActive(d: DoctorAccessFields | null | undefined): boolean {
  if (!d || d.subscription_status !== 'active' || !d.trial_ends_at) return false;
  return new Date(d.trial_ends_at) > new Date();
}
