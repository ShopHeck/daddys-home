'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function DocsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Docs error boundary caught:', error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6 bg-slate-950">
      <div className="max-w-md w-full text-center">
        <Link href="/" className="inline-flex items-baseline gap-2 text-white group mb-16 justify-center">
          <span className="font-serif text-xl tracking-tight" style={{ fontFamily: "'Prata', Georgia, serif" }}>
            Doc
          </span>
          <span style={{ fontFamily: "'Work Sans', system-ui, sans-serif" }} className="text-[0.65rem] font-medium uppercase tracking-[0.25em] text-slate-400 group-hover:text-slate-300 transition-colors">
            Forge
          </span>
        </Link>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500 mb-4">Something went wrong</p>
        <h1 className="text-4xl font-semibold tracking-tight text-white mb-6">
          Documentation error
        </h1>
        <p className="text-base text-slate-400 leading-relaxed mb-10">
          Something went wrong loading the documentation. Try again or return to the homepage.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-slate-950 bg-white hover:bg-slate-100 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white border border-slate-700 hover:border-slate-500 transition-colors"
          >
            Go home
          </Link>
        </div>
        {error.digest && (
          <p className="mt-8 text-xs text-slate-600 font-mono">Error ID: {error.digest}</p>
        )}
      </div>
    </main>
  );
}
