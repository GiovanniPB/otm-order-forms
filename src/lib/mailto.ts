export interface ReservationEmail {
  ref_code: string;
  email_subject: string;
  email_body: string;
  email_to: string;
}

/** Monta o link mailto: com assunto e corpo já preenchidos.
 * Usa encodeURIComponent (espaço → %20). NÃO usar URLSearchParams: ele codifica
 * espaço como "+", que clientes de e-mail mostram literalmente no corpo. */
export function buildMailtoHref(email: ReservationEmail): string {
  const subject = encodeURIComponent(email.email_subject);
  const body = encodeURIComponent(email.email_body);
  return `mailto:${email.email_to}?subject=${subject}&body=${body}`;
}
