import { getCSPNonce } from '@/resources/lib/csp';
import type { Metadata } from 'next';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/lara-light-blue/theme.css';

export const metadata: Metadata = {
  title: 'starter Next App',
  description: 'starter next app',
  icons: {
    icon: '/images/favicon.ico',
  },
};

interface RootLayoutProps {
  readonly children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const nonce = await getCSPNonce();
  const value = {
    nonce: nonce, // Pass nonce to PrimeReact context
  };
  return (
    <html lang="en">
      <body nonce={nonce}>
        <PrimeReactProvider value={value}>{children}</PrimeReactProvider>
      </body>
    </html>
  );
}
