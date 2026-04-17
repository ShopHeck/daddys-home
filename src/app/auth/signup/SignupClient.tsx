"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export function SignupClient() {
  const router = useRouter();
  const { status } = useSession();
  const [name, setName] = useState('');
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

    if (!name.trim()) {
      setError('Name is required.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsSubmitting(true);
    const signupResponse = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const signupPayload = (await signupResponse.json().catch(() => null)) as { error?: string } | null;

    if (!signupResponse.ok) {
      setError(signupPayload?.error ?? 'Unable to create account.');
      setIsSubmitting(false);
      return;
    }

    const signInResult = await signIn('credentials', {
      email,
      password,
      redirect: false
    });

    if (!signInResult || signInResult.error) {
      setError('Account created, but automatic sign-in failed. Please sign in manually.');
      setIsSubmitting(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-6 py-16">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Prata&family=Work+Sans:wght@300;400;500;600&display=swap');
      `}</style>
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-10 shadow-xl shadow-slate-950/50">
        <div className="text-center">
          <Link className="inline-flex items-baseline gap-2 text-white group" href="/">
            <span className="text-xl tracking-tight italic" style={{ fontFamily: "'Prata', Georgia, serif" }}>
              Doc
            </span>
            <span style={{ fontFamily: "'Work Sans', system-ui, sans-serif" }} className="text-[0.65rem] font-medium uppercase tracking-[0.25em] text-slate-400 group-hover:text-slate-300 transition-colors">
              FORGE
            </span>
          </Link>
          <h1 className="mt-8 text-3xl font-medium text-white" style={{ fontFamily: "'Work Sans', system-ui, sans-serif" }}>Create your account</h1>
          <p className="mt-3 text-sm text-slate-400" style={{ fontFamily: "'Work Sans', system-ui, sans-serif" }}>Start generating PDFs from stored templates in minutes.</p>
        </div>

        <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="name">
              Name
            </label>
            <input
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 focus:ring-2 focus:ring-blue-500"
              id="name"
              onChange={(event) => setName(event.target.value)}
              placeholder="Taylor Morgan"
              value={name}
            />
          </div>
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
            <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="password">
              Password
            </label>
            <input
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 focus:ring-2 focus:ring-blue-500"
              id="password"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 8 characters"
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
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link className="text-blue-400 hover:text-blue-300" href="/auth/login">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
