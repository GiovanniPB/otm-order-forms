'use client';

import { useMemo, useState } from 'react';
import {
  computeLegQuantities,
  directionLabel,
  isValidQuantity,
  type PublicOffer
} from '@/lib/offer';
import { formatCpf, isValidCpf } from '@/lib/cpf';
import { buildMailtoHref, type ReservationEmail } from '@/lib/mailto';

interface Props {
  slug: string;
  offer: PublicOffer;
}

export function ReservationForm({ slug, offer }: Props) {
  const [quantity, setQuantity] = useState('');
  const [cpf, setCpf] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReservationEmail | null>(null);
  const [copied, setCopied] = useState(false);

  const qtyNumber = Number(quantity);
  const qtyValid = isValidQuantity(qtyNumber, offer.lote_min, offer.lote_multiplo);
  const cpfValid = isValidCpf(cpf);
  const canSubmit = qtyValid && cpfValid && !submitting;

  const legQuantities = useMemo(
    () =>
      qtyValid
        ? computeLegQuantities(offer.legs, offer.base_leg_index, qtyNumber)
        : [],
    [qtyValid, qtyNumber, offer.legs, offer.base_leg_index]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, cpf, baseQuantity: qtyNumber })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Não foi possível registrar a reserva.');
        return;
      }
      setResult(data as ReservationEmail);
    } catch {
      setError('Falha de conexão. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <ConfirmationStep
        result={result}
        copied={copied}
        onCopy={async () => {
          await navigator.clipboard.writeText(result.email_body);
          setCopied(true);
        }}
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h2 className="mb-4 text-lg font-semibold text-ink">Reserve sua operação</h2>

      <label className="mb-1 block text-sm font-medium text-ink" htmlFor="qty">
        Quantidade ({offer.legs[offer.base_leg_index]?.ativo})
      </label>
      <input
        id="qty"
        inputMode="numeric"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value.replace(/\D/g, ''))}
        placeholder={`Múltiplos de ${offer.lote_multiplo}, mín. ${offer.lote_min}`}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
      />
      {quantity !== '' && !qtyValid && (
        <p className="mt-1 text-sm text-rose-600">
          Deve ser múltiplo de {offer.lote_multiplo} (mín. {offer.lote_min}).
        </p>
      )}

      {legQuantities.length > 0 && (
        <div className="mt-3 space-y-1 rounded-lg bg-slate-50 p-3 text-sm">
          {legQuantities.map((leg, i) => (
            <div key={`${leg.ativo}-${i}`} className="flex justify-between">
              <span className="text-muted">
                {directionLabel(leg.direcao)} {leg.ativo}
              </span>
              <span className="font-semibold text-ink">
                {leg.quantidade.toLocaleString('pt-BR')}
              </span>
            </div>
          ))}
        </div>
      )}

      <label
        className="mb-1 mt-4 block text-sm font-medium text-ink"
        htmlFor="cpf"
      >
        CPF
      </label>
      <input
        id="cpf"
        inputMode="numeric"
        value={cpf}
        onChange={(e) => setCpf(formatCpf(e.target.value))}
        placeholder="000.000.000-00"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
      />
      {cpf !== '' && !cpfValid && (
        <p className="mt-1 text-sm text-rose-600">CPF incompleto ou inválido.</p>
      )}

      <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-muted">
        No próximo passo você confirma a ordem enviando um e-mail — ele precisa
        ser enviado do <strong className="text-ink">mesmo endereço cadastrado na
        corretora</strong>, que é o respaldo da operação.
      </p>

      {error && (
        <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-5 w-full rounded-lg bg-brand-600 py-2.5 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {submitting ? 'Registrando…' : 'Reservar'}
      </button>
    </form>
  );
}

function ConfirmationStep({
  result,
  copied,
  onCopy
}: {
  result: ReservationEmail;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-ink">
        Falta 1 passo: enviar o e-mail
      </h2>
      <p className="mt-2 text-sm text-muted">
        Sua reserva <strong>{result.ref_code}</strong> foi registrada. Para valer,
        envie o e-mail abaixo <strong>do seu e-mail cadastrado na corretora</strong> —
        é o respaldo da ordem.
      </p>

      <a
        href={buildMailtoHref(result)}
        className="mt-4 block w-full rounded-lg bg-emerald-600 py-2.5 text-center font-semibold text-white transition hover:bg-emerald-700"
      >
        Abrir meu e-mail com a ordem
      </a>

      <div className="mt-4 rounded-lg bg-slate-50 p-3">
        <p className="text-xs font-medium text-muted">
          Usa webmail? Envie manualmente para{' '}
          <strong className="text-ink">{result.email_to}</strong> com este texto:
        </p>
        <pre className="mt-2 max-h-52 overflow-auto whitespace-pre-wrap rounded bg-white p-3 text-xs text-ink">
          {result.email_body}
        </pre>
        <button
          type="button"
          onClick={onCopy}
          className="mt-2 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-slate-100"
        >
          {copied ? 'Texto copiado ✓' : 'Copiar texto'}
        </button>
      </div>
    </div>
  );
}
