"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState } from 'react';

type DashboardShellProps = {
  children: React.ReactNode;
  user: {
    name: string | null | undefined;
    email: string | null | undefined;
  };
};

const navigation = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/templates', label: 'Templates' },
  { href: '/dashboard/api-keys', label: 'API Keys' },
  { href: '/dashboard/usage', label: 'Usage' },
  { href: '/dashboard/render-history', label: 'Render History' },
  { href: '/dashboard/webhooks', label: 'Webhooks' },
  {
    href: '/dashboard/billing',
    label: 'Billing',
    icon: (
      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
        <rect height="14" rx="2" stroke="currentColor" strokeWidth="1.75" width="20" x="2" y="5" />
        <path d="M2 10.5h20" stroke="currentColor" strokeWidth="1.75" />
        <path d="M6 15.5h4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.75" />
      </svg>
    )
  },
  { href: '/docs', label: 'Documentation' }
];

export function DashboardShell({ children, user }: DashboardShellProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const displayName = user.name || user.email || 'DocForge user';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen">
        <aside
          className={[
            'fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-800 bg-slate-950/95 p-6 transition-transform duration-200 md:static md:translate-x-0',
            isOpen ? 'translate-x-0' : '-translate-x-full'
          ].join(' ')}
        >
          <div className="flex items-center justify-between md:block">
            <Link className="flex items-center gap-3 text-sm font-semibold text-white" href="/dashboard">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/40 bg-blue-500/10 text-blue-300">
                DF
              </span>
              <span>DocForge</span>
            </Link>
            <button
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 md:hidden"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              Close
            </button>
          </div>
          <nav className="mt-10 space-y-2">
            {navigation.map((item) => {
              const isActive = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  className={[
                    'flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition',
                    isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  ].join(' ')}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon ? <span className="text-current">{item.icon}</span> : null}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {isOpen ? (
          <button
            aria-label="Close sidebar overlay"
            className="fixed inset-0 z-40 bg-slate-950/70 md:hidden"
            onClick={() => setIsOpen(false)}
            type="button"
          />
        ) : null}

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-4 backdrop-blur sm:px-6 lg:px-10">
            <div className="flex items-center gap-3">
              <button
                className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 md:hidden"
                onClick={() => setIsOpen(true)}
                type="button"
              >
                Menu
              </button>
              <div>
                <p className="text-sm font-medium text-white">{displayName}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
            </div>
            <button
              className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-600"
              onClick={() => signOut({ callbackUrl: '/auth/login' })}
              type="button"
            >
              Sign out
            </button>
          </header>
          <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
