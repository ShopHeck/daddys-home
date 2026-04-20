import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="px-4 py-8 sm:px-6 lg:px-10">
      <div className="max-w-md w-full text-center mx-auto">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500 mb-4">404</p>
        <h1 className="text-4xl font-semibold tracking-tight text-white mb-6">
          Page not found
        </h1>
        <p className="text-base text-slate-400 leading-relaxed mb-10">
          This dashboard page doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-slate-950 bg-white hover:bg-slate-100 transition-colors"
          >
            Go to dashboard
          </Link>
          <Link
            href="/docs"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white border border-slate-700 hover:border-slate-500 transition-colors"
          >
            View docs
          </Link>
        </div>
      </div>
    </div>
  );
}
