import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './styles.css';

export const metadata: Metadata = {
  title: {
    default: 'Minha Biblioteca',
    template: '%s | Minha Biblioteca',
  },
  description: 'Organize sua biblioteca pessoal e seus empréstimos.',
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
