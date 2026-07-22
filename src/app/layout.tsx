import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Reserva de Operação',
  description: 'Reserve sua participação na operação enviada pelo seu assessor.',
  robots: { index: false, follow: false }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
