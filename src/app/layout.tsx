import type { Metadata } from 'next';
import './globals.css';

import { AppChrome } from '@/components/AppChrome';
import { Providers } from '@/components/Providers';

export const viewport = {
  themeColor: '#020617',
};

const baseUrl = process.env.NEXTAUTH_URL || 'https://docforge.app';

export const metadata: Metadata = {
  title: {
    default: 'DocForge — Generate PDFs from HTML Templates via API',
    template: '%s | DocForge',
  },
  description: 'DocForge is a premium document generation API. Upload HTML or Handlebars templates, send JSON data, and get production-ready PDFs back in seconds.',
  keywords: ['PDF API', 'HTML to PDF', 'document generation', 'PDF rendering', 'Handlebars templates', 'invoice generator', 'PDF generation API'],
  authors: [{ name: 'DocForge' }],
  creator: 'DocForge',
  metadataBase: new URL(baseUrl),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'DocForge',
    title: 'DocForge — Generate PDFs from HTML Templates via API',
    description: 'Upload HTML or Handlebars templates, send JSON data, and get production-ready PDFs back in seconds.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DocForge — Generate PDFs from HTML Templates via API',
    description: 'Upload HTML or Handlebars templates, send JSON data, and get production-ready PDFs back in seconds.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Prata&family=Work+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          <AppChrome>{children}</AppChrome>
        </Providers>
      </body>
    </html>
  );
}
