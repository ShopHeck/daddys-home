'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error boundary caught:', error);
  }, [error]);

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-10">
      <div className="max-w-md w-full text-center mx-auto">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500 mb-4">Something went wrong</p>
        <h1 className="text-4xl font-semibold tracking-tight text-white mb-6">
          Unexpected error
        </h1>
        <p className="text-base text-slate-400 leading-relaxed mb-10">
          Something went wrong in the dashboard. Your data is safe. Try again or return to the overview.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-slate-950 bg-white hover:bg-slate-100 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white border border-slate-700 hover:border-slate-500 transition-colors"
          >
            Go to dashboard
          </Link>
        </div>
        {error.digest && (
          <p className="mt-8 text-xs text-slate-600 font-mono">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
