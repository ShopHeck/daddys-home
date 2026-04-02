import type { Metadata } from 'next';
import './globals.css';

import { AppChrome } from '@/components/AppChrome';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'DocForge',
  description: 'Premium document generation API for HTML and Handlebars templates.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppChrome>{children}</AppChrome>
        </Providers>
      </body>
    </html>
  );
}
