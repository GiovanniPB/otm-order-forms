import { getSupabase } from '@/lib/supabase';
import { directionLabel, type PublicOffer } from '@/lib/offer';
import { ReservationForm } from './reservation-form';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

async function fetchOffer(slug: string): Promise<PublicOffer | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('get_public_offer', {
    p_slug: slug
  });
  if (error) throw new Error(error.message);
  const row = Array.isArray(data) ? data[0] : data;
  return (row as PublicOffer) ?? null;
}

function Unavailable() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-xl font-semibold text-ink">Oferta indisponível</h1>
      <p className="mt-3 text-muted">
        Este link expirou ou não está mais ativo. Fale com o seu assessor.
      </p>
    </main>
  );
}

export default async function OfferPage({
  params
}: {
  params: { slug: string };
}) {
  const offer = await fetchOffer(params.slug);
  if (!offer) return <Unavailable />;

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <header className="mb-8 border-b border-slate-200 pb-6">
        <p className="text-sm font-medium uppercase tracking-wide text-brand-600">
          Reserva de operação
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">{offer.title}</h1>
        {offer.valid_until && (
          <p className="mt-2 text-sm text-muted">
            Validade da ordem:{' '}
            {new Date(offer.valid_until).toLocaleDateString('pt-BR')}
          </p>
        )}
      </header>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Estrutura da operação
        </h2>
        <ul className="space-y-2">
          {offer.legs.map((leg, i) => (
            <li
              key={`${leg.ativo}-${i}`}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3"
            >
              <div>
                <span className="font-semibold text-ink">{leg.ativo}</span>
                {leg.tipo && (
                  <span className="ml-2 text-sm text-muted">
                    {leg.tipo.toUpperCase()}
                    {leg.moneyness ? ` · ${leg.moneyness}` : ''}
                  </span>
                )}
              </div>
              <span
                className={
                  'rounded-full px-3 py-1 text-xs font-semibold ' +
                  (leg.direcao === 'sell'
                    ? 'bg-rose-50 text-rose-700'
                    : 'bg-emerald-50 text-emerald-700')
                }
              >
                {directionLabel(leg.direcao)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <ReservationForm slug={params.slug} offer={offer} />

      {offer.aviso_text && (
        <p className="mt-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {offer.aviso_text}
        </p>
      )}
    </main>
  );
}
