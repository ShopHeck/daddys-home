"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

export function Navbar() {
  const pathname = usePathname();
  const { status } = useSession();

  if (pathname.startsWith('/dashboard')) {
    return null;
  }

  const isAuthenticated = status === 'authenticated';

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        <Link className="flex items-center gap-3 text-sm font-semibold tracking-wide text-white" href="/">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-500/40 bg-blue-500/10 text-blue-300">
            DF
          </span>
          <span>DocForge</span>
        </Link>
        <nav className="flex items-center gap-6">
          <div className="hidden items-center gap-6 sm:flex">
            <Link className="text-sm text-slate-300 transition hover:text-white" href="/#pricing">
              Pricing
            </Link>
            <Link className="text-sm text-slate-300 transition hover:text-white" href="/docs">
              Docs
            </Link>
          </div>
          <Link
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
            href={isAuthenticated ? '/dashboard' : '/auth/signup'}
          >
            {isAuthenticated ? 'Dashboard' : 'Sign Up'}
          </Link>
        </nav>
      </div>
    </header>
  );
}
