// Raiz sem oferta: página não é um índice navegável. Cada link aponta para
// /op/<slug>. Mostra uma mensagem neutra em vez de 404 seco.
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-xl font-semibold text-ink">Reserva de Operação</h1>
      <p className="mt-3 text-muted">
        Abra o link específico enviado pelo seu assessor para acessar a operação.
      </p>
    </main>
  );
}
