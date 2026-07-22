import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export const runtime = 'edge';

// Mensagens amigáveis por código de erro levantado pela RPC create_reservation.
const ERROR_MESSAGES: Record<string, string> = {
  OFERTA_INDISPONIVEL: 'Esta oferta não está mais disponível.',
  CPF_INVALIDO: 'CPF inválido. Confira os dígitos.',
  QUANTIDADE_INVALIDA: 'Quantidade inválida para esta operação.',
  EMAIL_INVALIDO: 'E-mail inválido.',
  RESERVA_JA_EXECUTADA: 'Já existe uma reserva executada para este CPF.'
};

interface ReserveBody {
  slug?: unknown;
  cpf?: unknown;
  email?: unknown;
  baseQuantity?: unknown;
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: ReserveBody;
  try {
    body = (await request.json()) as ReserveBody;
  } catch {
    return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 });
  }

  const slug = typeof body.slug === 'string' ? body.slug : '';
  const cpf = typeof body.cpf === 'string' ? body.cpf : '';
  const email = typeof body.email === 'string' ? body.email : '';
  const baseQuantity = Number(body.baseQuantity);

  if (!slug || !cpf || !email || !Number.isFinite(baseQuantity)) {
    return NextResponse.json(
      { error: 'Preencha quantidade, CPF e e-mail.' },
      { status: 400 }
    );
  }

  const ip =
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    null;
  const userAgent = request.headers.get('user-agent') ?? null;

  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('create_reservation', {
    p_slug: slug,
    p_cpf: cpf,
    p_email: email,
    p_base_quantity: Math.trunc(baseQuantity),
    p_source_ip: ip,
    p_user_agent: userAgent
  });

  if (error) {
    const friendly = ERROR_MESSAGES[error.message];
    // Erros de validação conhecidos → 422; oferta indisponível → 404; resto → 500.
    const status = friendly
      ? error.message === 'OFERTA_INDISPONIVEL'
        ? 404
        : 422
      : 500;
    return NextResponse.json(
      { error: friendly ?? 'Não foi possível registrar a reserva.' },
      { status }
    );
  }

  // RPC RETURNS TABLE → array de uma linha.
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    return NextResponse.json(
      { error: 'Não foi possível registrar a reserva.' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ref_code: row.ref_code,
    email_subject: row.email_subject,
    email_body: row.email_body,
    email_to: row.email_to
  });
}
