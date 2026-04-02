"use client";

import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link.');
    }
  }, [token]);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!token) {
      setError('Invalid reset link.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? 'Failed to reset password. The link may be expired.');
        setIsSubmitting(false);
        return;
      }

      setIsSuccess(true);
    } catch {
      setError('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!token && !error) {
    return (
      <>
        <div className="text-center">
          <Link className="inline-flex items-center gap-3 text-sm font-semibold text-white" href="/">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/40 bg-blue-500/10 text-blue-300">
              DF
            </span>
            <span>DocForge</span>
          </Link>
        </div>
        <div className="mt-8 rounded-lg border border-rose-500/20 bg-rose-500/10 p-4">
          <p className="text-center text-sm text-rose-400">Invalid reset link.</p>
        </div>
        <p className="mt-6 text-center text-sm text-slate-400">
          <Link className="text-blue-400 hover:text-blue-300" href="/auth/login">
            Back to sign in
          </Link>
        </p>
      </>
    );
  }

  return (
    <>
      <div className="text-center">
        <Link className="inline-flex items-center gap-3 text-sm font-semibold text-white" href="/">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/40 bg-blue-500/10 text-blue-300">
            DF
          </span>
          <span>DocForge</span>
        </Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white">Reset your password</h1>
        <p className="mt-2 text-sm text-slate-400">
          Enter a new password for your account.
        </p>
      </div>

      {isSuccess ? (
        <div className="mt-8 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
          <p className="text-center text-sm text-emerald-400">
            Password updated! Redirecting to login...
          </p>
        </div>
      ) : (
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="password">
              New Password
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
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 focus:ring-2 focus:ring-blue-500"
              id="confirmPassword"
              minLength={8}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Re-enter your password"
              type="password"
              value={confirmPassword}
            />
          </div>
          {error ? <p className="text-sm text-rose-400">{error}</p> : null}
          <button
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting || !token}
            type="submit"
          >
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-slate-400">
        <Link className="text-blue-400 hover:text-blue-300" href="/auth/login">
          Back to sign in
        </Link>
      </p>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-2xl shadow-slate-950/40">
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
