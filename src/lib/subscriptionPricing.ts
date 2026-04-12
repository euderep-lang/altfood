/** Assinatura Pro: somente mensal recorrente (valor exibido e referência para cópia). */
export const PRO_MONTHLY_PRICE_BRL = 19.9;

/** Dias após o primeiro pagamento em que o cliente pode pedir reembolso integral (política comercial). */
export const REFUND_GUARANTEE_DAYS = 14;

export function formatProMonthlyMoney(): string {
  return `R$ ${PRO_MONTHLY_PRICE_BRL.toFixed(2).replace('.', ',')}`;
}

export function formatProMonthlyWithPeriod(): string {
  return `${formatProMonthlyMoney()}/mês`;
}

export function formatRefundGuaranteeShort(): string {
  return `${REFUND_GUARANTEE_DAYS} dias de garantia: reembolso integral se cancelar nesse período`;
}
