import type { Metadata } from 'next';
import { SignupClient } from './SignupClient';

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create a free DocForge account. Start generating PDFs from HTML templates in minutes.',
};

export default function SignupPage() {
  return <SignupClient />;
}
