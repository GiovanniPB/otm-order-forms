import { describe, it, expect } from 'vitest';
import { formatCpf, isValidCpf, normalizeCpf } from './cpf';

describe('normalizeCpf', () => {
  it('remove tudo que não é dígito', () => {
    expect(normalizeCpf('111.444.777-35')).toBe('11144477735');
  });
});

describe('formatCpf', () => {
  it('formata progressivamente', () => {
    expect(formatCpf('11144477735')).toBe('111.444.777-35');
    expect(formatCpf('111444')).toBe('111.444');
  });
  it('trunca em 11 dígitos', () => {
    expect(formatCpf('1114447773599')).toBe('111.444.777-35');
  });
});

describe('isValidCpf', () => {
  it('aceita CPFs válidos (com e sem máscara)', () => {
    expect(isValidCpf('111.444.777-35')).toBe(true);
    expect(isValidCpf('11144477735')).toBe(true);
    expect(isValidCpf('529.982.247-25')).toBe(true);
  });
  it('rejeita dígitos repetidos', () => {
    expect(isValidCpf('111.111.111-11')).toBe(false);
  });
  it('rejeita dígito verificador errado', () => {
    expect(isValidCpf('123.456.789-00')).toBe(false);
  });
  it('rejeita tamanho inválido', () => {
    expect(isValidCpf('123')).toBe(false);
  });
});
