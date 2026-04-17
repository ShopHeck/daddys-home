"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export function LoginClient() {
  const router = useRouter();
  const { status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [router, status]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Password is required.');
      return;
    }

    setIsSubmitting(true);
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false
    });

    if (!result || result.error) {
      setError('Invalid email or password.');
      setIsSubmitting(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-10 shadow-xl shadow-slate-950/50">
        <div className="text-center">
          <Link className="inline-flex items-baseline gap-2 text-white group" href="/">
            <span className="text-xl tracking-tight" style={{ fontFamily: "'Prata', Georgia, serif" }}>
              Doc
            </span>
            <span style={{ fontFamily: "'Work Sans', system-ui, sans-serif" }} className="text-[0.65rem] font-medium uppercase tracking-[0.25em] text-slate-400 group-hover:text-slate-300 transition-colors">
              FORGE
            </span>
          </Link>
          <h1 className="mt-8 text-3xl font-medium text-white" style={{ fontFamily: "'Work Sans', system-ui, sans-serif" }}>Sign in</h1>
          <p className="mt-3 text-sm text-slate-400" style={{ fontFamily: "'Work Sans', system-ui, sans-serif" }}>Access your dashboard, templates, and API keys.</p>
        </div>

        <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="email">
              Email
            </label>
            <input
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 focus:ring-2 focus:ring-blue-500"
              id="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              type="email"
              value={email}
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-slate-200" htmlFor="password">
                Password
              </label>
              <Link
                className="text-xs text-blue-400 hover:text-blue-300"
                href="/auth/forgot-password"
              >
                Forgot password?
              </Link>
            </div>
            <input
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 focus:ring-2 focus:ring-blue-500"
              id="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              type="password"
              value={password}
            />
          </div>
          {error ? <p className="text-sm text-rose-400">{error}</p> : null}
          <button
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting || status === 'loading'}
            type="submit"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Need an account?{' '}
          <Link className="text-blue-400 hover:text-blue-300" href="/auth/signup">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
