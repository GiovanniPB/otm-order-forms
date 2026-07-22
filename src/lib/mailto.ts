export interface ReservationEmail {
  ref_code: string;
  email_subject: string;
  email_body: string;
  email_to: string;
}

/** Monta o link mailto: com assunto e corpo já preenchidos. */
export function buildMailtoHref(email: ReservationEmail): string {
  const params = new URLSearchParams({
    subject: email.email_subject,
    body: email.email_body
  });
  return `mailto:${email.email_to}?${params.toString()}`;
}
