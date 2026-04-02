import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DocForge',
  description: 'Premium document generation API for HTML and Handlebars templates.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
