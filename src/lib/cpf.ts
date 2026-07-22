// Utilidades de CPF no cliente (feedback instantâneo). A validação de verdade
// acontece no servidor (RPC create_reservation → is_valid_cpf). Espelha o mesmo
// algoritmo de dígito verificador para o usuário não errar à toa.

/** Só dígitos. */
export function normalizeCpf(value: string): string {
  return (value ?? '').replace(/\D/g, '');
}

/** Formata progressivamente como 000.000.000-00. */
export function formatCpf(value: string): string {
  const v = normalizeCpf(value).slice(0, 11);
  return v
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

/** Valida o dígito verificador (mesma regra do is_valid_cpf no Postgres). */
export function isValidCpf(value: string): boolean {
  const v = normalizeCpf(value);
  if (v.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(v)) return false;

  const digit = (sliceLen: number, factorStart: number): number => {
    let sum = 0;
    for (let i = 0; i < sliceLen; i += 1) {
      sum += Number(v[i]) * (factorStart - i);
    }
    const mod = 11 - (sum % 11);
    return mod >= 10 ? 0 : mod;
  };

  if (digit(9, 10) !== Number(v[9])) return false;
  if (digit(10, 11) !== Number(v[10])) return false;
  return true;
}
