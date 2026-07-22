import { describe, it, expect } from 'vitest';
import { computeLegQuantities, isValidQuantity, type OfferLeg } from './offer';

const LEGS: OfferLeg[] = [
  { ativo: 'AXIA3', direcao: 'sell', tipo: 'put', ratio: 1 },
  { ativo: 'ECOR3', direcao: 'buy', tipo: 'call', ratio: 4 }
];

describe('computeLegQuantities', () => {
  it('aplica a proporção 1:4 (Long Combo AXIA3-ECOR3)', () => {
    const q = computeLegQuantities(LEGS, 0, 300);
    expect(q[0].quantidade).toBe(300);
    expect(q[1].quantidade).toBe(1200);
  });

  it('usa ratio 1 como default quando ausente', () => {
    const q = computeLegQuantities(
      [{ ativo: 'X', direcao: 'buy' }],
      0,
      100
    );
    expect(q[0].quantidade).toBe(100);
  });

  it('não divide por zero se a perna base tiver ratio 0', () => {
    const q = computeLegQuantities(
      [{ ativo: 'X', direcao: 'buy', ratio: 0 }],
      0,
      100
    );
    expect(q[0].quantidade).toBe(100);
  });
});

describe('isValidQuantity', () => {
  it('exige >= lote_min e múltiplo de lote_multiplo', () => {
    expect(isValidQuantity(300, 100, 100)).toBe(true);
    expect(isValidQuantity(50, 100, 100)).toBe(false);
    expect(isValidQuantity(150, 100, 100)).toBe(false);
    expect(isValidQuantity(0, 100, 100)).toBe(false);
  });
});
