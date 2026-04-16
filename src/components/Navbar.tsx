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
    <header className="sticky top-0 z-40 border-b border-slate-800/60 bg-slate-950">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:py-5">
        <Link className="flex items-baseline gap-2 text-white group" href="/">
          <span className="font-serif text-xl tracking-tight" style={{ fontFamily: "'Prata', Georgia, serif" }}>
            Doc
          </span>
          <span style={{ fontFamily: "'Work Sans', system-ui, sans-serif" }} className="text-[0.65rem] font-medium uppercase tracking-[0.25em] text-slate-400 group-hover:text-slate-300 transition-colors">
            Forge
          </span>
        </Link>
        <nav className="flex items-center gap-8">
          <div className="hidden items-center gap-8 sm:flex">
            <Link 
              className="text-sm font-medium text-slate-400 tracking-wide hover:text-white transition-colors" 
              href="/#pricing"
            >
              Pricing
            </Link>
            <Link 
              className="text-sm font-medium text-slate-400 tracking-wide hover:text-white transition-colors" 
              href="/docs"
            >
              Docs
            </Link>
          </div>
          <Link
            className="text-sm font-medium text-white border-b border-slate-600 pb-0.5 hover:border-white transition-colors"
            href={isAuthenticated ? '/dashboard' : '/auth/signup'}
          >
            {isAuthenticated ? 'Dashboard' : 'Sign in'}
          </Link>
        </nav>
      </div>
    </header>
  );
}
