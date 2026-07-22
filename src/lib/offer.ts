// Tipos da oferta pública + cálculo puro de quantidades por perna.
// Espelha a lógica do create_reservation no Postgres (fonte da verdade): a perna
// base é a que o cliente digita; as demais saem por proporção (ratio).

export type LegDirection = 'buy' | 'sell';
export type LegType = 'put' | 'call';

export interface OfferLeg {
  ativo: string;
  direcao: LegDirection;
  tipo?: LegType;
  moneyness?: string;
  strike?: number;
  vencimento?: string; // yyyy-MM-dd
  ratio?: number;
}

export interface PublicOffer {
  id: string;
  title: string;
  structure_type: string | null;
  legs: OfferLeg[];
  base_leg_index: number;
  lote_min: number;
  lote_multiplo: number;
  margem_text: string | null;
  risco_text: string | null;
  aviso_text: string | null;
  valid_until: string | null;
  brand: Record<string, unknown> | null;
}

export interface LegQuantity {
  ativo: string;
  direcao: LegDirection;
  tipo?: LegType;
  moneyness?: string;
  vencimento?: string;
  quantidade: number;
}

/** Quantidade de cada perna a partir da quantidade da perna base. */
export function computeLegQuantities(
  legs: OfferLeg[],
  baseLegIndex: number,
  baseQuantity: number
): LegQuantity[] {
  const baseRatio = legs[baseLegIndex]?.ratio || 1;
  const safeBaseRatio = baseRatio === 0 ? 1 : baseRatio;

  return legs.map((leg) => ({
    ativo: leg.ativo,
    direcao: leg.direcao,
    tipo: leg.tipo,
    moneyness: leg.moneyness,
    vencimento: leg.vencimento,
    quantidade: Math.round((baseQuantity * (leg.ratio || 1)) / safeBaseRatio)
  }));
}

/** Regras de lote (mesma checagem do servidor) para feedback instantâneo. */
export function isValidQuantity(
  quantity: number,
  loteMin: number,
  loteMultiplo: number
): boolean {
  if (!Number.isFinite(quantity) || quantity <= 0) return false;
  if (quantity < loteMin) return false;
  return quantity % loteMultiplo === 0;
}

export function directionLabel(direction: LegDirection): string {
  return direction === 'sell' ? 'Venda' : 'Compra';
}
